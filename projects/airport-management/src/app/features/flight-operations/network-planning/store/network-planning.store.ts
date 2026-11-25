
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
    of,
    catchError,
    forkJoin,
} from 'rxjs';

import { FlightScheduleService } from '@shared-core';
import {
    IFlightScheduleDto,
    IScheduleFilterDto,
    ICreateFlightScheduleDto, IFlightLegDefDto, ICreateFlightLegDefDto,
} from '@shared-core';

// ── Supporting Shapes ─────────────────────────────────────────────────────

export interface IScheduleFilters {
    flightNo: string;
    routeId: number | null;
    originIata: string;
    destinationIata: string;
    isActive: boolean | null; // null = all
    season: 'SUMMER' | 'WINTER' | null;
}

export interface ISchedulePagination {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface IScheduleSummaryStats {
    total: number;
    active: number;
    inactive: number;
}

// ── Season mapping helper (derived from effectiveStartDate month) ──────────
// IATA: Summer = Mar–Oct  ·  Winter = Nov–Feb
function _isSummerSchedule(s: IFlightScheduleDto): boolean {
    const m = new Date(s.effectiveStartDate).getMonth() + 1;
    return m >= 3 && m <= 10;
}

// ── Default values ────────────────────────────────────────────────────────

export const DEFAULT_FILTERS: IScheduleFilters = {
    flightNo: '',
    routeId: null,
    originIata: '',
    destinationIata: '',
    isActive: null,
    season: null,
};

const DEFAULT_PAGINATION: ISchedulePagination = {
    pageNumber: 1,
    pageSize: 15,
    totalCount: 0,
    totalPages: 0,
};

// ── State ─────────────────────────────────────────────────────────────────

interface NetworkPlanningState {
    schedules: IFlightScheduleDto[];
    filters: IScheduleFilters;
    pagination: ISchedulePagination;
    isLoading: boolean;
    errorMessage: string | null;
    // Configuration Center
    selectedSchedule: IFlightScheduleDto | null;
    scheduleLegs: IFlightLegDefDto[];
    isConfigLoading: boolean;
    isLegSaving: boolean;
    configErrorMessage: string | null;
    isSavingSchedule: boolean;
    savedScheduleId: number | null;   // one-shot: set after successful upsert
}

const initialState: NetworkPlanningState = {
    schedules: [],
    filters: DEFAULT_FILTERS,
    pagination: DEFAULT_PAGINATION,
    isLoading: false,
    errorMessage: null,
    selectedSchedule: null,
    scheduleLegs: [],
    isConfigLoading: false,
    isLegSaving: false,
    configErrorMessage: null,
    isSavingSchedule: false,
    savedScheduleId: null,
};

// ── Store ─────────────────────────────────────────────────────────────────

export const NetworkPlanningStore = signalStore(
    { providedIn: 'root' },

    withState<NetworkPlanningState>(initialState),

    // ── Computed ─────────────────────────────────────────────────────────────
    withComputed(store => ({

        /** Count of currently active schedules visible on this page. */
        activeSchedulesCount: computed<number>(
            () => store.schedules().filter(s => s.isActive).length
        ),

        /** Summary counts for the sidebar widget. */
        summaryStats: computed<IScheduleSummaryStats>(() => {
            const list = store.schedules();
            // Since we don't have global active/inactive from the backend, 
            // display stats that mathematically add up for the current page, 
            // but use global total if no active/inactive mismatch.
            // By default, showing stats for the *displayed* items prevents UI contradiction.
            const active = list.filter(s => s.isActive).length;
            const inactive = list.length - active;
            return {
                total: store.pagination().totalCount || list.length,
                active: active,
                inactive: inactive
            };
        }),

        /** Human-readable grid footer string. */
        recordLabel: computed<string>(() => {
            const p = store.pagination();
            return p.totalCount > 0
                ? `Page ${p.pageNumber} of ${p.totalPages} · ${p.totalCount} schedule${p.totalCount !== 1 ? 's' : ''}`
                : `${store.schedules().length} schedules`;
        }),

        /** True when any filter field carries a value. */
        hasActiveFilter: computed<boolean>(() => {
            const f = store.filters();
            return !!(
                f.flightNo || f.routeId || f.originIata ||
                f.destinationIata || f.isActive !== null || f.season !== null
            );
        }),

        canGoPrev: computed<boolean>(() => store.pagination().pageNumber > 1),

        canGoNext: computed<boolean>(() =>
            store.pagination().pageNumber < store.pagination().totalPages
        ),

        /**
    * Sorted legs by segmentNumber — the authoritative display order
    * for the timeline visualizer.
    */
        sortedLegs: computed<IFlightLegDefDto[]>(() =>
            [...store.scheduleLegs()].sort((a, b) => a.segmentNumber - b.segmentNumber)
        ),

        /**
         * Time conflict detection — aviation business rule:
         * Each leg's departure (converted to minutes-from-midnight + offset days)
         * must be AFTER the previous leg's arrival.
         *
         * offsetDays * 1440 converts day offsets to minutes, enabling
         * multi-day itinerary comparison on a single numeric axis.
         */
        hasTimeConflict: computed<boolean>(() => {
            const legs = [...store.scheduleLegs()]
                .sort((a, b) => a.segmentNumber - b.segmentNumber);

            if (legs.length < 2) return false;

            const toMinutes = (time: string, offsetDays: number): number => {
                const [h, m] = time.split(':').map(Number);
                return offsetDays * 1440 + h * 60 + m;
            };

            for (let i = 1; i < legs.length; i++) {
                const prevArr = toMinutes(legs[i - 1].arrivalTimeLocal, legs[i - 1].arrivalOffsetDays);
                const currDep = toMinutes(legs[i].departureTimeLocal, legs[i].departureOffsetDays);
                if (currDep < prevArr) return true;
            }

            return false;
        }),

        /**
         * Total block time for all legs in minutes — used by the timeline visualizer
         * to proportion segment widths.
         */
        totalBlockMinutes: computed<number>(() => {
            return store.scheduleLegs().reduce((sum, leg) => {
                const depMins = leg.departureOffsetDays * 1440 +
                    _parseTimeToMins(leg.departureTimeLocal);
                const arrMins = leg.arrivalOffsetDays * 1440 +
                    _parseTimeToMins(leg.arrivalTimeLocal);
                return sum + Math.max(0, arrMins - depMins);
            }, 0);
        }),

        /** Next available sequence number for a new leg. */
        nextLegSequence: computed<number>(() => {
            const legs = store.scheduleLegs();
            if (legs.length === 0) return 1;
            return Math.max(...legs.map(l => l.segmentNumber)) + 1;
        }),

        /** True when the configuration form has a schedule loaded or being created. */
        isConfigMode: computed<boolean>(() => true), // Always true when on config page

    })),

    // ── Methods ───────────────────────────────────────────────────────────────
    withMethods((store, svc = inject(FlightScheduleService)) => ({

        /**
         * Fetch schedules using current filters + page.
         *
         * 300ms debounce + JSON-serialize distinctUntilChanged prevents
         * thrashing during rapid filter changes.
         */
        fetchSchedules: rxMethod<{ page?: number }>(
            pipe(
                debounceTime(300),
                distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
                tap(({ page }) =>
                    patchState(store, {
                        isLoading: true,
                        errorMessage: null,
                        pagination: {
                            ...store.pagination(),
                            pageNumber: page ?? 1,
                        },
                    })
                ),
                switchMap(({ page }) => {
                    const f = store.filters();
                    const filter: IScheduleFilterDto = {
                        flightNo: f.flightNo || undefined,
                        routeId: f.routeId ?? undefined,
                        originIata: f.originIata || undefined,
                        destinationIata: f.destinationIata || undefined,
                        isActive: f.isActive ?? undefined,
                    };

                    return svc.searchSchedules(filter, page ?? 1, store.pagination().pageSize).pipe(
                        tapResponse({
                            next: result => {
                                let items = result.items ?? [];

                                // Local filter for season since API does not support it
                                if (f.season === 'SUMMER') {
                                    items = items.filter(_isSummerSchedule);
                                } else if (f.season === 'WINTER') {
                                    items = items.filter(s => !_isSummerSchedule(s));
                                }

                                patchState(store, {
                                    schedules: items,
                                    pagination: {
                                        pageNumber: result.pageNumber,
                                        pageSize: result.pageSize,
                                        totalCount: f.season ? items.length : result.totalCount,
                                        totalPages: f.season ? 1 : result.totalPages,
                                    },
                                    isLoading: false,
                                });
                            },
                            error: (err: unknown) =>
                                patchState(store, {
                                    isLoading: false,
                                    errorMessage: _schedError(err, 'Failed to load schedule inventory.'),
                                }),
                        })
                    );
                })
            )
        ),

        /**
         * Update filters and re-fetch from page 1.
         * Merged with existing filters — partial updates are supported.
         */
        updateFilters(partial: Partial<IScheduleFilters>): void {
            patchState(store, {
                filters: { ...store.filters(), ...partial },
                pagination: { ...store.pagination(), pageNumber: 1 },
            });
        },

        /** Reset all filters to defaults. */
        resetFilters(): void {
            patchState(store, { filters: DEFAULT_FILTERS, pagination: DEFAULT_PAGINATION });
        },

        /** Navigate to a specific page. */
        goToPage(page: number): void {
            patchState(store, { pagination: { ...store.pagination(), pageNumber: page } });
        },

        /**
         * Delete a schedule with optimistic UI removal.
         *
         * Strategy: snapshot → remove → API → on failure roll back + set error.
         * Returns Promise<{ success; error? }> for Smart Component toast handling.
         */
        removeSchedule(scheduleId: number): Promise<{ success: boolean; error?: string }> {
            const prev = store.schedules();
            const prevPagn = store.pagination();

            patchState(store, {
                schedules: prev.filter(s => s.scheduleId !== scheduleId),
                isLoading: true,
                errorMessage: null,
                pagination: {
                    ...prevPagn,
                    totalCount: Math.max(0, prevPagn.totalCount - 1),
                },
            });

            return new Promise(resolve => {
                svc.deleteSchedule(scheduleId).pipe(
                    catchError(err => {
                        const msg = _schedError(err, `Failed to remove schedule #${scheduleId}.`);
                        patchState(store, {
                            schedules: prev,
                            pagination: prevPagn,
                            isLoading: false,
                            errorMessage: msg,
                        });
                        resolve({ success: false, error: msg });
                        return of(undefined);
                    })
                ).subscribe(result => {
                    if (result === undefined && store.errorMessage()) return;
                    patchState(store, { isLoading: false });
                    resolve({ success: true });
                });
            });
        },

        /** Dismiss the error banner. */
        clearError(): void {
            patchState(store, { errorMessage: null });
        },

        // ══════════════════════════════════════════════════════════════════════════
        // CONFIGURATION CENTER METHODS
        // ══════════════════════════════════════════════════════════════════════════

        /**
         * Load a schedule and its legs in a single atomic forkJoin.
         *
         * Both calls run in parallel. If the schedule fetch fails the entire load
         * fails; if only the legs call fails we still surface the schedule and
         * report a partial error — dispatchers can still edit the schedule body.
         */
        loadScheduleDetails: rxMethod<number>(
            pipe(
                tap(() =>
                    patchState(store, {
                        isConfigLoading: true,
                        configErrorMessage: null,
                        selectedSchedule: null,
                        scheduleLegs: [],
                    })
                ),
                switchMap((id: number) =>
                    forkJoin({
                        schedule: svc.getScheduleById(id),
                        legs: svc.getLegsBySchedule(id).pipe(catchError(() => of([] as IFlightLegDefDto[]))),
                    }).pipe(
                        tapResponse({
                            next: ({ schedule, legs }) =>
                                patchState(store, {
                                    selectedSchedule: schedule,
                                    scheduleLegs: legs,
                                    isConfigLoading: false,
                                }),
                            error: (err: unknown) =>
                                patchState(store, {
                                    isConfigLoading: false,
                                    configErrorMessage: _configError(err, 'Failed to load schedule details.'),
                                }),
                        })
                    )
                )
            )
        ),

        /**
         * Create or update the master schedule header.
         *
         * If `store.selectedSchedule()` exists → updateSchedule (PUT).
         * Otherwise → createSchedule (POST).
         *
         * On success:
         *  - Updates `selectedSchedule` with the returned DTO.
         *  - Sets `savedScheduleId` as a one-shot navigation trigger.
         *  - Applies cache update on the inventory list if it's in memory.
         *
         * Returns Promise<{ success; scheduleId?; error? }>.
         */
        upsertSchedule(dto: ICreateFlightScheduleDto): Promise<{ success: boolean; scheduleId?: number; error?: string }> {
            const existing = store.selectedSchedule();
            const isEdit = !!existing && existing.scheduleId > 0;

            patchState(store, { isSavingSchedule: true, configErrorMessage: null, savedScheduleId: null });

            const call$ = isEdit
                ? svc.updateSchedule(existing!.scheduleId, dto)
                : svc.createSchedule(dto);

            return new Promise(resolve => {
                call$.pipe(
                    catchError(err => {
                        const msg = _configError(err, `Failed to ${isEdit ? 'update' : 'create'} schedule.`);
                        patchState(store, { isSavingSchedule: false, configErrorMessage: msg });
                        resolve({ success: false, error: msg });
                        return of(null as unknown as IFlightScheduleDto);
                    })
                ).subscribe(saved => {
                    if (!saved) return;

                    // Update the inventory cache if it's loaded
                    const cachedIdx = store.schedules().findIndex(s => s.scheduleId === saved.scheduleId);
                    if (cachedIdx >= 0) {
                        patchState(store, {
                            schedules: store.schedules().map(s => s.scheduleId === saved.scheduleId ? saved : s),
                        });
                    } else if (!isEdit) {
                        patchState(store, {
                            schedules: [saved, ...store.schedules()],
                            pagination: {
                                ...store.pagination(),
                                totalCount: store.pagination().totalCount + 1,
                            },
                        });
                    }

                    patchState(store, {
                        selectedSchedule: saved,
                        isSavingSchedule: false,
                        savedScheduleId: saved.scheduleId,
                    });
                    resolve({ success: true, scheduleId: saved.scheduleId });
                });
            });
        },

        /**
         * Add a new flight leg with optimistic UI insertion.
         *
         * Strategy:
         *  1. Build a temporary leg with a negative legId (optimistic placeholder).
         *  2. Append to `scheduleLegs` immediately.
         *  3. Call createFlightLeg.
         *  4. Replace the placeholder with the server-returned DTO on success.
         *  5. Roll back and surface error on failure.
         *
         * Returns Promise<{ success; error? }>.
         */
        addNewLeg(scheduleId: number, dto: ICreateFlightLegDefDto): Promise<{ success: boolean; error?: string }> {
            const TEMP_ID = -Date.now(); // unique negative id for optimistic placeholder

            const optimisticLeg: IFlightLegDefDto = {
                legDefId: TEMP_ID,
                scheduleId,
                segmentNumber: dto.segmentNumber,
                departureAirportIataCode: dto.departureAirportIataCode,
                arrivalAirportIataCode: dto.arrivalAirportIataCode,
                departureOffsetDays: 0,
                departureTimeLocal: '00:00',
                arrivalOffsetDays: 0,
                arrivalTimeLocal: '00:00',
            };

            patchState(store, {
                scheduleLegs: [...store.scheduleLegs(), optimisticLeg],
                isLegSaving: true,
                configErrorMessage: null,
            });

            return new Promise(resolve => {
                svc.createFlightLeg(scheduleId, dto).pipe(
                    catchError(err => {
                        const msg = _configError(err, 'Failed to add flight leg.');
                        patchState(store, {
                            scheduleLegs: store.scheduleLegs().filter(l => l.legDefId !== TEMP_ID),
                            isLegSaving: false,
                            configErrorMessage: msg,
                        });
                        resolve({ success: false, error: msg });
                        return of(null as unknown as IFlightLegDefDto);
                    })
                ).subscribe(created => {
                    if (created && created.legDefId) {
                        patchState(store, {
                            scheduleLegs: store.scheduleLegs().map(l => l.legDefId === TEMP_ID ? created : l),
                            isLegSaving: false,
                        });
                    } else {
                        // Success but no data — refresh the entire list to be sure
                        this.loadScheduleDetails(scheduleId);
                        patchState(store, { isLegSaving: false });
                    }
                    resolve({ success: true });
                });
            });
        },

        /** Remove a leg optimistically from the client cache (server-side delete TBD). */
        removeLegFromCache(legDefId: number): void {
            patchState(store, {
                scheduleLegs: store.scheduleLegs().filter(l => l.legDefId !== legDefId),
            });
        },

        /** Set the selected schedule to null — entering "New" mode. */
        clearSelectedSchedule(): void {
            patchState(store, {
                selectedSchedule: null,
                scheduleLegs: [],
                configErrorMessage: null,
                savedScheduleId: null,
            });
        },

        /** Dismiss configuration-level error. */
        clearConfigError(): void {
            patchState(store, { configErrorMessage: null });
        },

        /** Clear the one-shot savedScheduleId once navigation has occurred. */
        clearSavedScheduleId(): void {
            patchState(store, { savedScheduleId: null });
        },


    }))
);

// ── Private error mapper ───────────────────────────────────────────────────

function _schedError(err: unknown, fallback: string): string {
    const e = err as Record<string, unknown>;
    const body = e?.['error'] as Record<string, unknown> | undefined;
    const status = e?.['status'] as number | undefined;

    if (status === 409)
        return (body?.['message'] as string) ??
            'Schedule Conflict: This schedule has active flight instances. Cancel all instances before removing the master schedule.';

    if (status === 422)
        return (body?.['message'] as string) ??
            'Validation Error: The schedule parameters failed network validation. Review route, times, and operating dates.';

    if (status === 403)
        return 'Authorization Denied: You do not have clearance to modify master schedules.';

    if (status === 404)
        return 'Schedule not found. It may have already been removed from the inventory.';

    if (status === 0 || status === undefined)
        return 'Network Error: Unable to reach the Schedule Registry. Verify connectivity and retry.';

    if (body?.['errors'] && typeof body['errors'] === 'object')
        return Object.entries(body['errors'] as Record<string, string | string[]>)
            .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`)
            .join(' · ');

    return (body?.['message'] as string) ?? (e?.['message'] as string) ?? fallback;
}


function _configError(err: unknown, fallback: string): string {
    const e = err as Record<string, unknown>;
    const body = e?.['error'] as Record<string, unknown> | undefined;
    const status = e?.['status'] as number | undefined;

    if (status === 409) {
        const msg = body?.['message'] as string | undefined;
        if (msg?.toLowerCase().includes('overlap') || msg?.toLowerCase().includes('conflict'))
            return 'Leg Time Overlap: A flight leg in this schedule has conflicting departure/arrival times with an existing leg. Review and adjust the timeline.';
        if (msg?.toLowerCase().includes('sequence'))
            return 'Hub Sequence Error: The leg hub order creates an invalid routing sequence. Ensure each leg\'s origin matches the previous leg\'s destination.';
        return msg ?? 'Schedule Conflict: A conflicting record already exists in the planning registry.';
    }

    if (status === 422)
        return (body?.['message'] as string) ??
            'Validation Error: The schedule parameters failed network validation. Review all fields.';

    if (status === 400) {
        if (body?.['errors'] && typeof body['errors'] === 'object') {
            return Object.entries(body['errors'] as Record<string, string | string[]>)
                .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`)
                .join(' · ');
        }
        return (body?.['message'] as string) ?? 'Invalid schedule parameters. Review input fields.';
    }

    if (status === 404)
        return 'Schedule not found in the registry. It may have been removed.';

    if (status === 403)
        return 'Authorization Denied: You do not have clearance to configure master schedules.';

    if (status === 0 || status === undefined)
        return 'Network Error: Unable to reach the Schedule Configuration Service. Verify connectivity.';

    return (body?.['message'] as string) ?? (e?.['message'] as string) ?? fallback;
}

// Helper: convert "HH:MM" to total minutes past midnight
function _parseTimeToMins(time: string | undefined | null): number {
    if (!time) return 0;
    const parts = time.split(':');
    if (parts.length < 2) return 0;
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}