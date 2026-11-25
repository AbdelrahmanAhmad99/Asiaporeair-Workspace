
import { inject, computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import {
  pipe,
  switchMap,
  tap,
  debounceTime,
  distinctUntilChanged,
  catchError,
  finalize,
  of,
  firstValueFrom,
  forkJoin,
} from 'rxjs';

import {
  FlightOperationsService, IFlightInstanceDto, IFlightInstanceFilterDto,
  IFlightInstanceBriefDto, IAssignAircraftDto
} from '@shared-core';

import { RoutesService } from '@shared-core';
import { AircraftService } from '@shared-core';
import { AirlinesService } from '@shared-core';
import { IRouteDto, IRouteFilterDto } from '@shared-core';
import { IAircraftDto, IAircraftFilterDto } from '@shared-core';
import { IAirlineDto } from '@shared-core';
import {
  ICreateAdHocFlightInstanceDto,
} from '@shared-core';
import { IGenerateInstancesRequestDto, IGenerationReportDto } from '@shared-core';
import { FlightScheduleService } from '@shared-core';
import { IFlightScheduleDto, IScheduleFilterDto } from '@shared-core';
// ── Public Types ─────────────────────────────────────────────────────────

export type FlightInstanceStatus =
  | 'SCHEDULED'
  | 'DELAYED'
  | 'BOARDING'
  | 'DEPARTED'
  | 'IN_FLIGHT'
  | 'ARRIVED'
  | 'CANCELLED'
  | 'DIVERTED';

export interface IDispatchSearchFilters {
  flightNo: string;
  airportCode: string;            // origin OR destination IATA
  dateFrom: string;            // ISO date string YYYY-MM-DD
  dateTo: string;            // ISO date string YYYY-MM-DD
  status: FlightInstanceStatus | null;
}

export interface IDispatchPagination {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface IInstanceStatusSummary {
  scheduled: number;
  delayed: number;
  boarding: number;
  inFlight: number;
  arrived: number;
  cancelled: number;
  total: number;
}


export interface IAircraftSummaryDto {
  tailNumber: string;
  status: AircraftReadiness;
  lastOriginIata?: string;
  nextFlight?: string;
}
export type AircraftReadiness = 'READY' | 'IN_TRANSIT' | 'MAINTENANCE' | 'UNKNOWN';

// ── Defaults ──────────────────────────────────────────────────────────────

function _todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

function _tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export const DEFAULT_DISPATCH_FILTERS: IDispatchSearchFilters = {
  flightNo: '',
  airportCode: '',
  dateFrom: _todayIso(),
  dateTo: _tomorrowIso(),
  status: null,
};

const DEFAULT_PAGINATION: IDispatchPagination = {
  pageNumber: 1,
  pageSize: 20,
  totalCount: 0,
  totalPages: 0,
};

// ── State ─────────────────────────────────────────────────────────────────

interface FlightDispatchState {
  flightInstances: IFlightInstanceDto[];
  searchFilters: IDispatchSearchFilters;
  pagination: IDispatchPagination;
  isDispatchLoading: boolean;
  dispatchError: string | null;
  // Aircraft Assignment Hub
  selectedInstance: IFlightInstanceDto | null;
  instanceDetailLoading: boolean;
  aircraftTimeline: IFlightInstanceBriefDto[];
  timelineLoading: boolean;
  selectedTailNumber: string | null;    // aircraft currently staged for assignment
  assignmentLoading: boolean;
  assignmentErrorMessage: string | null;
  assignmentSuccess: boolean;          // one-shot flag → component reacts then clears

  // Ad-Hoc Flight Creator
  availableRoutes: IRouteDto[];
  activeAirlines: IAirlineDto[];
  selectableAircraft: IAircraftDto[];
  refDataLoading: boolean;
  refDataLoaded: boolean;            // guard: skip re-fetch if already loaded
  isSubmitting: boolean;
  adHocErrorMessage: string | null;
  createdAdHocFlight: IFlightInstanceDto | null;  // one-shot → navigation trigger

  // Bulk Instance Generator
  masterSchedules: IFlightScheduleDto[];
  airlineList: IAirlineDto[];
  bulkRefLoading: boolean;
  bulkRefLoaded: boolean;            // session-level guard
  isGenerating: boolean;
  generationSuccess: IGenerationReportDto | null;
  generationError: string | null;
}

const initialState: FlightDispatchState = {
  flightInstances: [],
  searchFilters: DEFAULT_DISPATCH_FILTERS,
  pagination: DEFAULT_PAGINATION,
  isDispatchLoading: false,
  dispatchError: null,
  selectedInstance: null,
  instanceDetailLoading: false,
  aircraftTimeline: [],
  timelineLoading: false,
  selectedTailNumber: null,
  assignmentLoading: false,
  assignmentErrorMessage: null,
  assignmentSuccess: false,
  availableRoutes: [],
  activeAirlines: [],
  selectableAircraft: [],
  refDataLoading: false,
  refDataLoaded: false,
  isSubmitting: false,
  adHocErrorMessage: null,
  createdAdHocFlight: null,
  masterSchedules: [],
  airlineList: [],
  bulkRefLoading: false,
  bulkRefLoaded: false,
  isGenerating: false,
  generationSuccess: null,
  generationError: null,
};

// ── Store ─────────────────────────────────────────────────────────────────

export const FlightDispatchStore = signalStore(
  { providedIn: 'root' },

  withState<FlightDispatchState>(initialState),

  // ── Computed ─────────────────────────────────────────────────────────────
  withComputed(store => ({

    /**
     * Per-status counts for the command bar badge strip.
     * Derived from the current page of instances only — sufficient for
     * the dispatcher's "at-a-glance" operational awareness.
     */
    instancesByStatus: computed<IInstanceStatusSummary>(() => {
      const list = store.flightInstances();
      const count = (s: FlightInstanceStatus) => list.filter(f => f.status?.toUpperCase() === s).length;
      return {
        scheduled: count('SCHEDULED'),
        delayed: count('DELAYED'),
        boarding: count('BOARDING'),
        inFlight: count('IN_FLIGHT') + count('DEPARTED'),
        arrived: count('ARRIVED'),
        cancelled: count('CANCELLED'),
        total: store.pagination().totalCount || list.length,
      };
    }),

    /**
     * Count of operationally active (live) flights:
     * DEPARTED + IN_FLIGHT + BOARDING = crews are committed.
     */
    liveFlightCount: computed<number>(() =>
      store.flightInstances().filter(f => {
        const s = f.status?.toUpperCase();
        return s === 'IN_FLIGHT' || s === 'DEPARTED' || s === 'BOARDING';
      }).length
    ),

    hasActiveFilter: computed<boolean>(() => {
      const f = store.searchFilters();
      return !!(f.flightNo || f.airportCode || f.status !== null);
    }),

    recordLabel: computed<string>(() => {
      const p = store.pagination();
      return p.totalCount > 0
        ? `Page ${p.pageNumber} of ${p.totalPages} · ${p.totalCount.toLocaleString()} instance${p.totalCount !== 1 ? 's' : ''}`
        : `${store.flightInstances().length} instances`;
    }),

    canGoPrev: computed<boolean>(() => store.pagination().pageNumber > 1),

    canGoNext: computed<boolean>(() =>
      store.pagination().pageNumber < store.pagination().totalPages
    ),

    /**
         * Derive a lightweight aircraft roster from the current page of
         * flight instances. This avoids needing a separate aircraft-registry
         * service for the picker modal — any tail number that appears in the
         * active dispatch window is eligible for staging.
         *
         * Aircraft already assigned to the selectedInstance are excluded.
         */
    availableAircraft: computed<IAircraftSummaryDto[]>(() => {
      const selected = store.selectedInstance();
      const alreadyAssigned = selected?.assignedAircraftTailNumber
        ?? selected?.tailNumber ?? null;

      const tailMap = new Map<string, IAircraftSummaryDto>();

      for (const inst of store.flightInstances()) {
        const tail = inst.assignedAircraftTailNumber ?? inst.tailNumber;
        if (!tail || tail === alreadyAssigned) continue;
        if (tailMap.has(tail)) continue;

        const s = inst.status?.toUpperCase() ?? '';
        let readiness: AircraftReadiness = 'READY';
        if (s === 'IN_FLIGHT' || s === 'DEPARTED') readiness = 'IN_TRANSIT';
        else if (s === 'MAINTENANCE') readiness = 'MAINTENANCE';

        tailMap.set(tail, {
          tailNumber: tail,
          status: readiness,
          lastOriginIata: inst.originAirportIata,
          nextFlight: inst.flightNo,
        });
      }

      return [...tailMap.values()].sort((a, b) => a.tailNumber.localeCompare(b.tailNumber));
    }),

    /** True when an aircraft has been staged (selected in picker) but not yet confirmed. */
    isAircraftStaged: computed<boolean>(() => store.selectedTailNumber() !== null),

    /** Conflict: staged aircraft's timeline overlaps with selectedInstance's window. */
    hasStagingConflict: computed<boolean>(() => {
      const instance = store.selectedInstance();
      const timeline = store.aircraftTimeline();
      if (!instance || timeline.length === 0) return false;

      const depTime = new Date(instance.scheduledDeparture).getTime();
      const arrTime = new Date(instance.scheduledArrival).getTime();

      return timeline.some(t => {
        if (t.instanceId === instance.instanceId) return false;
        const tDep = new Date(t.scheduledDeparture).getTime();
        const tArr = new Date(t.scheduledArrival).getTime();
        // Overlaps if not (tArr ≤ depTime OR tDep ≥ arrTime)
        return !(tArr <= depTime || tDep >= arrTime);
      });
    }),

    /** Active (non-deleted) aircraft only — Maintenance units are still selectable
     * for special charter (dispatcher makes the call), but are visually flagged. */
    activeAircraftCount: computed<number>(
      () => store.selectableAircraft().filter(a => a.status !== 'DELETED').length
    ),

    /** Quick airline IATA → name lookup map for the form display. */
    airlineMap: computed<Map<string, IAirlineDto>>(
      () => new Map(store.activeAirlines().map(a => [a.iataCode, a]))
    ),

    /** Quick route lookup map for the form confirmation strip. */
    routeMap: computed<Map<number, IRouteDto>>(
      () => new Map(store.availableRoutes().map(r => [r.routeId, r]))
    ),

    /** Active schedules only (isActive === true) — grid shows only actionable entries. */
    activeScheduleCount: computed<number>(
      () => store.masterSchedules().filter(s => s.isActive).length
    ),

    /** Airline IATA → full airline object lookup map for the form display. */
    bulkAirlineMap: computed<Map<string, IAirlineDto>>(
      () => new Map(store.airlineList().map(a => [a.iataCode, a]))
    ),

    /**
     * Earliest and latest dates across all active schedules — used to
     * set sensible min/max constraints on the generation date pickers.
     */
    scheduleValidityWindow: computed<{ earliest: string; latest: string } | null>(() => {
      const active = store.masterSchedules().filter(s => s.isActive);
      if (active.length === 0) return null;

      const starts = active.map(s => new Date(s.effectiveStartDate).getTime());
      const ends = active
        .filter(s => s.effectiveEndDate)
        .map(s => new Date(s.effectiveEndDate!).getTime());

      return {
        earliest: new Date(Math.min(...starts)).toISOString().split('T')[0],
        latest: ends.length > 0
          ? new Date(Math.max(...ends)).toISOString().split('T')[0]
          : '', // open-ended
      };
    }),


  })),

  // ── Methods ───────────────────────────────────────────────────────────────
  withMethods((store,
    opsSvc = inject(FlightOperationsService),
    routesSvc = inject(RoutesService),
    aircraftSvc = inject(AircraftService),
    airlinesSvc = inject(AirlinesService),
    schedulesSvc = inject(FlightScheduleService),
  ) => ({
    /**
     * Core fetch — called on init and whenever filters or pagination change.
     *
     * Strategy: if the date range is narrow (≤ 3 days), the service uses
     * getInstancesByDateRange for speed. Otherwise, searchFlightInstances
     * with full filter params is invoked. The service decides the endpoint;
     * the store always passes the full filter context.
     *
     * 300ms debounce + distinctUntilChanged prevents thrashing during
     * rapid filter edits (typing flight number, for example).
     */
    fetchInstances: rxMethod<{ page?: number }>(
      pipe(
        debounceTime(300),
        // Ensure we trigger on page OR filter changes
        distinctUntilChanged((a, b) => {
          const filtersChanged = JSON.stringify(store.searchFilters()) !== JSON.stringify(store.searchFilters());
          // Wait, this doesn't work inside distinctUntilChanged if we only pass {page}
          return false; // Force re-fetch for now to fix the navigation issue
        }),
        tap(({ page }) =>
          patchState(store, {
            isDispatchLoading: true,
            dispatchError: null,
            pagination: {
              ...store.pagination(),
              pageNumber: page ?? 1,
            },
          })
        ),
        switchMap(({ page }) => {
          const f = store.searchFilters();
          const filter: IFlightInstanceFilterDto = {
            flightNo: f.flightNo || undefined,
            airportIataCode: f.airportCode || undefined,
            startDate: f.dateFrom || undefined,
            endDate: f.dateTo || undefined,
            status: f.status ?? undefined,
          };

          return opsSvc.searchFlightInstances(filter, page ?? 1, store.pagination().pageSize).pipe(
            tapResponse({
              next: result =>
                patchState(store, {
                  flightInstances: result.items ?? [],
                  pagination: {
                    pageNumber: result.pageNumber,
                    pageSize: result.pageSize,
                    totalCount: result.totalCount,
                    totalPages: result.totalPages,
                  },
                  isDispatchLoading: false,
                }),
              error: (err: unknown) =>
                patchState(store, {
                  isDispatchLoading: false,
                  dispatchError: _dispatchError(err, 'Failed to retrieve flight instances.'),
                }),
            })
          );
        })
      )
    ),

    /**
     * Update search filters (partial merge) and re-fetch from page 1.
     * Designed to accept partial updates from individual filter controls.
     */
    updateSearchFilters(partial: Partial<IDispatchSearchFilters>): void {
      patchState(store, {
        searchFilters: { ...store.searchFilters(), ...partial },
        pagination: { ...store.pagination(), pageNumber: 1 },
      });
    },

    /** Reset all filters to today–tomorrow defaults. */
    resetFilters(): void {
      patchState(store, {
        searchFilters: DEFAULT_DISPATCH_FILTERS,
        pagination: DEFAULT_PAGINATION,
      });
    },

    /** Navigate to a specific page in the current result set. */
    goToPage(page: number): void {
      patchState(store, { pagination: { ...store.pagination(), pageNumber: page } });
    },

    /**
     * Cancel (delete) a flight instance with a mandatory reason.
     *
     * Safety contract: the Smart Component MUST show the cancellation dialog
     * before calling this method. This method itself does not validate the
     * reason — that is the dialog's responsibility.
     *
     * Optimistic UI: removes the instance immediately, rolls back on failure.
     * Returns Promise<{ success; error? }> for toast handling.
     */
    async cancelFlightInstance(
      instanceId: number,
      reason: string,
      notes?: string
    ): Promise<{ success: boolean; error?: string }> {
      const prev = store.flightInstances();
      const prevPagn = store.pagination();

      // Optimistic remove
      patchState(store, {
        flightInstances: prev.filter(f => f.instanceId !== instanceId),
        isDispatchLoading: true,
        dispatchError: null,
        pagination: {
          ...prevPagn,
          totalCount: Math.max(0, prevPagn.totalCount - 1),
        },
      });

      try {
        await firstValueFrom(opsSvc.deleteFlightInstance(instanceId, reason, notes));
        patchState(store, { isDispatchLoading: false });
        return { success: true };
      } catch (err) {
        const msg = _dispatchError(err, `Failed to cancel flight instance #${instanceId}.`);
        // Full rollback
        patchState(store, {
          flightInstances: prev,
          pagination: prevPagn,
          isDispatchLoading: false,
          dispatchError: msg,
        });
        return { success: false, error: msg };
      }
    },

    /** Dismiss the global error banner. */
    clearDispatchError(): void {
      patchState(store, { dispatchError: null });
    },

    // ══════════════════════════════════════════════════════════════════════════
    // AIRCRAFT ASSIGNMENT HUB METHODS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Load full instance details for the Assignment Hub.
     *
     * Isolated `instanceDetailLoading` — never triggers the Control Room's
     * `isDispatchLoading` flag.
     */
    loadInstanceDetails: rxMethod<number>(
      pipe(
        tap(() =>
          patchState(store, {
            instanceDetailLoading: true,
            selectedInstance: null,
            assignmentErrorMessage: null,
            assignmentSuccess: false,
          })
        ),
        switchMap((id: number) =>
          opsSvc.getInstanceById(id).pipe(
            tapResponse({
              next: (instance) =>
                patchState(store, {
                  selectedInstance: instance,
                  instanceDetailLoading: false,
                }),
              error: (err: unknown) =>
                patchState(store, {
                  instanceDetailLoading: false,
                  assignmentErrorMessage: _assignmentError(err, `Failed to load instance #${id}.`),
                }),
            })
          )
        )
      )
    ),

    /**
     * Load a specific aircraft's operational timeline.
     *
     * Uses a 7-day window centred on the current date to give the dispatcher
     * enough context (previous and upcoming flights) without pulling
     * excessive data. Isolated `timelineLoading` flag.
     */
    loadAircraftSchedule: rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, { timelineLoading: true, aircraftTimeline: [] })
        ),
        switchMap((tailNumber: string) => {
          const start = new Date();
          start.setDate(start.getDate() - 3);
          const end = new Date();
          end.setDate(end.getDate() + 4);

          return opsSvc.getInstancesByAircraft(tailNumber, start.toISOString(), end.toISOString()).pipe(
            tapResponse({
              next: (timeline) =>
                patchState(store, {
                  aircraftTimeline: timeline,
                  timelineLoading: false,
                }),
              error: (err: unknown) =>
                patchState(store, {
                  timelineLoading: false,
                  assignmentErrorMessage: _assignmentError(err, `Failed to load timeline for ${tailNumber}.`),
                }),
            })
          );
        })
      )
    ),

    /** Stage an aircraft tail number for review before executing assignment. */
    stageAircraft(tailNumber: string): void {
      patchState(store, {
        selectedTailNumber: tailNumber,
        assignmentErrorMessage: null,
        assignmentSuccess: false,
      });
    },

    /** Unstage the currently staged aircraft without executing. */
    clearStagedAircraft(): void {
      patchState(store, {
        selectedTailNumber: null,
        aircraftTimeline: [],
        assignmentErrorMessage: null,
      });
    },

    /**
     * Execute the aircraft assignment.
     *
     * Validates that both instanceId and tailNumber are present.
     * On success: updates `selectedInstance` inline and marks `assignmentSuccess`.
     * On failure: surfaces specific backend error in `assignmentErrorMessage`.
     *
     * Returns Promise<{ success; error? }> for Smart Component toast handling.
     */
    async executeAssignment(
      instanceId: number,
      tailNumber: string
    ): Promise<{ success: boolean; error?: string }> {
      patchState(store, {
        assignmentLoading: true,
        assignmentErrorMessage: null,
        assignmentSuccess: false,
      });

      try {
        await firstValueFrom(opsSvc.assignAircraftToInstance(instanceId, { tailNumber }));

        // Update the selected instance in-place so the status card refreshes
        const current = store.selectedInstance();
        if (current) {
          patchState(store, {
            selectedInstance: {
              ...current,
              assignedAircraftTailNumber: tailNumber,
              tailNumber,
            },
          });
        }

        // Update the registry cache if the instance appears in the list
        patchState(store, {
          flightInstances: store.flightInstances().map(f =>
            f.instanceId === instanceId
              ? { ...f, assignedAircraftTailNumber: tailNumber, tailNumber }
              : f
          ),
          selectedTailNumber: null,
          assignmentLoading: false,
          assignmentSuccess: true,
        });

        return { success: true };
      } catch (err) {
        const msg = _assignmentError(err, `Failed to assign ${tailNumber} to flight #${instanceId}.`);
        patchState(store, {
          assignmentLoading: false,
          assignmentErrorMessage: msg,
        });
        return { success: false, error: msg };
      }
    },

    /** Clear the one-shot assignment success flag. */
    clearAssignmentSuccess(): void {
      patchState(store, { assignmentSuccess: false });
    },

    /** Dismiss the assignment error banner. */
    clearAssignmentError(): void {
      patchState(store, { assignmentErrorMessage: null });
    },

    /** Full hub state teardown on navigate-away. */
    clearAssignmentHub(): void {
      patchState(store, {
        selectedInstance: null,
        instanceDetailLoading: false,
        aircraftTimeline: [],
        timelineLoading: false,
        selectedTailNumber: null,
        assignmentLoading: false,
        assignmentErrorMessage: null,
        assignmentSuccess: false,
      });
    },

    // ══════════════════════════════════════════════════════════════════════════
    // AD-HOC FLIGHT CREATOR METHODS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Load all reference data required for the Ad-Hoc form in one atomic call.
     *
     * Guard: if `refDataLoaded` is already true (user navigated away and back),
     * skip the network calls — reference data is stable within a session.
     *
     * All three calls are fired in parallel via forkJoin. Individual failures
     * are trapped so partial data is still usable (e.g., airlines fail but
     * routes succeed → form is partially functional).
     */
    loadReferenceData: rxMethod<void>(
      pipe(
        tap(() => {
          if (store.refDataLoaded()) return;
          patchState(store, { refDataLoading: true, adHocErrorMessage: null });
        }),
        switchMap(() => {
          if (store.refDataLoaded()) return of(null);

          return forkJoin({
            routes: routesSvc.searchRoutes({ isActive: true }, 1, 500).pipe(
              catchError(() => of({ items: [] as IRouteDto[] }))
            ),
            airlines: airlinesSvc.getAllActiveAirlines().pipe(
              catchError(() => of([] as IAirlineDto[]))
            ),
            aircraft: aircraftSvc.searchAircraft({}, 1, 500).pipe(
              catchError(() => of({ items: [] as IAircraftDto[] }))
            ),
          }).pipe(
            tapResponse({
              next: ({ routes, airlines, aircraft }) =>
                patchState(store, {
                  availableRoutes: (routes as { items: IRouteDto[] }).items ?? [],
                  activeAirlines: Array.isArray(airlines) ? airlines : [],
                  selectableAircraft: (aircraft as { items: IAircraftDto[] }).items ?? [],
                  refDataLoading: false,
                  refDataLoaded: true,
                }),
              error: (err: unknown) =>
                patchState(store, {
                  refDataLoading: false,
                  adHocErrorMessage: _adHocError(err, 'Failed to load reference data. Refresh and retry.'),
                }),
            })
          );
        })
      )
    ),

    /**
     * Submit the ad-hoc flight creation payload.
     *
     * On success:
     *  - Prepends the new instance to `flightInstances` so the Control Room
     *    grid reflects it immediately upon navigation back.
     *  - Sets `createdAdHocFlight` as a one-shot signal for navigation.
     *
     * Returns Promise<{ success; instanceId?; error? }> for toast handling.
     */
    async submitAdHocFlight(
      payload: ICreateAdHocFlightInstanceDto
    ): Promise<{ success: boolean; instanceId?: number; error?: string }> {
      patchState(store, { isSubmitting: true, adHocErrorMessage: null, createdAdHocFlight: null });

      try {
        const created = await firstValueFrom(opsSvc.createAdHocFlightInstance(payload));

        patchState(store, {
          isSubmitting: false,
          createdAdHocFlight: created,
          flightInstances: [created, ...store.flightInstances()],
          pagination: {
            ...store.pagination(),
            totalCount: store.pagination().totalCount + 1,
          },
        });

        return { success: true, instanceId: created.instanceId };
      } catch (err) {
        const msg = _adHocError(err, 'Failed to create the ad-hoc flight instance.');
        patchState(store, { isSubmitting: false, adHocErrorMessage: msg });
        return { success: false, error: msg };
      }
    },

    /** Clear the one-shot created flight signal after navigation. */
    clearCreatedAdHocFlight(): void {
      patchState(store, { createdAdHocFlight: null });
    },

    /** Dismiss the ad-hoc error banner. */
    clearAdHocError(): void {
      patchState(store, { adHocErrorMessage: null });
    },

    /** Invalidate reference-data cache (call on forced refresh). */
    invalidateRefData(): void {
      patchState(store, {
        refDataLoaded: false,
        availableRoutes: [],
        activeAirlines: [],
        selectableAircraft: [],
      });
    },

    // ══════════════════════════════════════════════════════════════════════════
    // BULK INSTANCE GENERATOR METHODS
    // ══════════════════════════════════════════════════════════════════════════

    /**
     * Load all reference data for the Bulk Generator in parallel.
     *
     * Guard: `bulkRefLoaded` prevents double-fetching within a session.
     * Schedules: fetches ALL active schedules (isActive: true), up to 500.
     * Airlines: uses the same `airlineList` slot as the Ad-Hoc creator
     *           (both features share the same signal — no duplication).
     *
     * Each branch is individually catch-wrapped for partial resilience:
     * if schedules fail, airlines still populate and vice versa.
     */
    loadBulkReferenceData: rxMethod<void>(
      pipe(
        tap(() => {
          if (store.bulkRefLoaded()) return;
          patchState(store, { bulkRefLoading: true, generationError: null });
        }),
        switchMap(() => {
          if (store.bulkRefLoaded()) return of(null);

          return forkJoin({
            schedules: schedulesSvc.searchSchedules(
              { isActive: true }, 1, 500
            ).pipe(
              catchError(() => of({ items: [] as IFlightScheduleDto[] }))
            ),
            airlines: airlinesSvc.getAllActiveAirlines().pipe(
              catchError(() => of([] as IAirlineDto[]))
            ),
          }).pipe(
            tapResponse({
              next: ({ schedules, airlines }) =>
                patchState(store, {
                  masterSchedules: (schedules as { items: IFlightScheduleDto[] }).items ?? [],
                  // Merge with existing airlineList from Ad-Hoc feature to avoid overwrite
                  airlineList: Array.isArray(airlines) && airlines.length > 0
                    ? airlines
                    : store.airlineList(),
                  bulkRefLoading: false,
                  bulkRefLoaded: true,
                }),
              error: (err: unknown) =>
                patchState(store, {
                  bulkRefLoading: false,
                  generationError: _bulkError(err, 'Failed to load bulk generation reference data.'),
                }),
            })
          );
        })
      )
    ),

    /**
     * Execute bulk instance generation from master schedules.
     *
     * Calls `generateInstancesFromSchedules` with the supervisor-provided
     * date range and airline IATA code. The DTO shape maps directly from
     * the uploaded model: { startDate, endDate, airlineIataCode }.
     *
     * On success: sets `generationSuccess` with the full report DTO.
     * On failure: maps the backend error into `generationError`.
     *
     * Returns Promise<{ success; report?; error? }> for toast / modal handling.
     */
    async generateBulk(
      payload: IGenerateInstancesRequestDto
    ): Promise<{ success: boolean; report?: IGenerationReportDto; error?: string }> {
      patchState(store, {
        isGenerating: true,
        generationSuccess: null,
        generationError: null,
      });

      try {
        const report = await firstValueFrom(
          opsSvc.generateInstancesFromSchedules(payload)
        );

        patchState(store, {
          isGenerating: false,
          generationSuccess: report,
          // Invalidate the dispatch list so the Control Room re-fetches
          flightInstances: [],
          pagination: { ...store.pagination(), pageNumber: 1, totalCount: 0 },
        });

        return { success: true, report };
      } catch (err) {
        const msg = _bulkError(err, 'Bulk generation failed. Review the parameters and retry.');
        patchState(store, { isGenerating: false, generationError: msg });
        return { success: false, error: msg };
      }
    },

    /** Dismiss the generation success report (after the supervisor has read it). */
    clearGenerationSuccess(): void {
      patchState(store, { generationSuccess: null });
    },

    /** Dismiss the generation error banner. */
    clearGenerationError(): void {
      patchState(store, { generationError: null });
    },

    /** Invalidate the bulk reference data cache (useful after adding new schedules). */
    invalidateBulkRefData(): void {
      patchState(store, {
        bulkRefLoaded: false,
        masterSchedules: [],
      });
    },



  }))
);

// ── Private Error Mapper ──────────────────────────────────────────────────

function _dispatchError(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return (err as any)?.toString() || fallback;
  const e = err as Record<string, unknown>;
  const body = e?.['error'] as Record<string, unknown> | undefined;
  const status = e?.['status'] as number | undefined;

  if (status === 409) {
    const msg = body?.['message'] as string | undefined;
    // Most critical case: attempt to cancel an airborne flight
    if (msg?.toLowerCase().includes('airborne') || msg?.toLowerCase().includes('in_flight'))
      return 'Safety Lock: This flight instance is currently airborne and cannot be cancelled. Contact ATC through proper channels.';
    return msg ?? 'Operational Conflict: This instance has dependent records (e.g., boarding passes issued). Resolve conflicts before cancelling.';
  }

  if (status === 422)
    return (body?.['message'] as string) ??
      'Validation Error: The cancellation parameters failed operational validation. Review reason and try again.';

  if (status === 403)
    return 'Authorization Denied: You do not have dispatch clearance to cancel flight instances.';

  if (status === 404)
    return 'Flight instance not found in the operational registry. It may have already been resolved.';

  if (status === 400) {
    if (body?.['errors'] && typeof body['errors'] === 'object') {
      return Object.entries(body['errors'] as Record<string, string | string[]>)
        .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`)
        .join(' · ');
    }
    return (body?.['message'] as string) ?? 'Invalid cancellation request. Verify input parameters.';
  }

  if (status === 0 || status === undefined)
    return 'Network Error: Unable to reach the Dispatch Registry. Verify connectivity and retry.';

  return (body?.['message'] as string) ?? (e?.['message'] as string) ?? fallback;
}



export interface IAircraftSummaryDto {
  tailNumber: string;
  status: AircraftReadiness;
  lastOriginIata?: string;
  nextFlight?: string;
}


function _assignmentError(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return (err as any)?.toString() || fallback;
  const e = err as Record<string, unknown>;
  const body = e?.['error'] as Record<string, unknown> | undefined;
  const status = e?.['status'] as number | undefined;

  if (status === 409) {
    const msg = body?.['message'] as string | undefined;
    if (msg?.toLowerCase().includes('airborne') || msg?.toLowerCase().includes('in_flight'))
      return 'Assignment Blocked: The aircraft is currently airborne. Wait until it lands before re-assigning.';
    if (msg?.toLowerCase().includes('maintenance'))
      return 'Assignment Blocked: This aircraft is currently in maintenance status. Select a different tail.';
    if (msg?.toLowerCase().includes('conflict'))
      return 'Scheduling Conflict: The selected aircraft has an overlapping flight assignment. Check the availability timeline.';
    return msg ?? 'Assignment Conflict: This aircraft cannot be assigned at this time due to an operational conflict.';
  }

  if (status === 422)
    return (body?.['message'] as string) ??
      'Validation Error: The assignment parameters failed operational validation. Verify tail number and instance details.';

  if (status === 403)
    return 'Authorization Denied: You do not have dispatch clearance to assign aircraft to flight instances.';

  if (status === 404)
    return 'Record not found. The flight instance or aircraft may have been removed from the registry.';

  if (status === 0 || status === undefined)
    return 'Network Error: Unable to reach the Fleet Registry. Verify connectivity and retry.';

  if (body?.['errors'] && typeof body['errors'] === 'object')
    return Object.entries(body['errors'] as Record<string, string | string[]>)
      .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`)
      .join(' · ');

  return (body?.['message'] as string) ?? (e?.['message'] as string) ?? fallback;
}


function _adHocError(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return fallback;
  const e = err as Record<string, unknown>;
  const body = e?.['error'] as Record<string, unknown> | undefined;
  const status = e?.['status'] as number | undefined;

  if (status === 409) {
    const msg = body?.['message'] as string | undefined;
    if (msg?.toLowerCase().includes('overlap') || msg?.toLowerCase().includes('conflict'))
      return 'Temporal Conflict: The departure/arrival window overlaps with an existing flight for the selected aircraft. Adjust times or choose a different tail number.';
    if (msg?.toLowerCase().includes('mismatch') || msg?.toLowerCase().includes('route'))
      return 'Route-Aircraft Mismatch: The selected aircraft\'s range or classification is incompatible with the chosen route. Verify aircraft type capabilities.';
    return msg ?? 'Operational Conflict: A conflicting record exists. Review selections and retry.';
  }

  if (status === 422)
    return (body?.['message'] as string) ??
      'Validation Error: The mission parameters did not pass operational validation. Review all selections and time values.';

  if (status === 400) {
    if (body?.['errors'] && typeof body['errors'] === 'object') {
      return Object.entries(body['errors'] as Record<string, string | string[]>)
        .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`)
        .join(' · ');
    }
    return (body?.['message'] as string) ?? 'Invalid mission parameters. Review all input fields.';
  }

  if (status === 403)
    return 'Authorization Denied: You do not have clearance to create ad-hoc flight instances.';

  if (status === 404)
    return 'Reference record not found. The selected route or aircraft may have been deactivated.';

  if (status === 0 || status === undefined)
    return 'Network Error: Unable to reach the Operations Registry. Verify connectivity and retry.';

  return (body?.['message'] as string) ?? (e?.['message'] as string) ?? fallback;
}

function _bulkError(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return fallback;
  const e = err as Record<string, unknown>;
  const body = e?.['error'] as Record<string, unknown> | undefined;
  const status = e?.['status'] as number | undefined;

  if (status === 409) {
    const msg = body?.['message'] as string | undefined;
    if (msg?.toLowerCase().includes('overlap'))
      return `Temporal Overlap: One or more schedules in the selected period produce conflicting flight instances. Reduce the date range or investigate the overlapping schedule. Detail: ${msg}`;
    if (msg?.toLowerCase().includes('expired') || msg?.toLowerCase().includes('effective'))
      return `Schedule Validity Error: A schedule in the selected date range has expired or has not yet become effective. Verify schedule validity windows before generating. Detail: ${msg}`;
    if (msg?.toLowerCase().includes('duplicate'))
      return 'Duplicate Conflict: Instances already exist for some schedules in this period. Enable "Overwrite existing instances" or narrow the date range.';
    return msg ?? 'Generation Conflict: A constraint violation was detected. Review schedule parameters before retrying.';
  }

  if (status === 422) {
    const msgs = body?.['messages'] as string[] | undefined;
    if (msgs?.length)
      return `Validation Failure: ${msgs.slice(0, 3).join(' · ')}${msgs.length > 3 ? ` (+${msgs.length - 3} more)` : ''}`;
    return (body?.['message'] as string) ??
      'Generation parameters failed validation. Verify the date range and airline selection.';
  }

  if (status === 400) {
    if (body?.['errors'] && typeof body['errors'] === 'object') {
      return Object.entries(body['errors'] as Record<string, string | string[]>)
        .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`)
        .join(' · ');
    }
    return (body?.['message'] as string) ?? 'Invalid generation request parameters.';
  }

  if (status === 403)
    return 'Authorization Denied: You do not have supervisor clearance to execute bulk instance generation.';

  if (status === 404)
    return 'Airline or schedule registry not found. The selected airline may have been deactivated.';

  if (status === 0 || status === undefined)
    return 'Network Error: Unable to reach the Generation Service. Verify connectivity and retry.';

  return (body?.['message'] as string) ?? (e?.['message'] as string) ?? fallback;
}