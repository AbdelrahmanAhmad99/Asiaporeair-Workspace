

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
    interval,
    Subscription,
    of,
    catchError,
    firstValueFrom,
    forkJoin,
} from 'rxjs';

import { FlightOperationsService } from '@shared-core';
import {
    IFlightInstanceDto,
    IFlightInstanceFilterDto,
    IUpdateFlightStatusDto,
    IUpdateFlightTimesDto,
} from '@shared-core';

import { DashboardService } from '@shared-core';
import { IFlightInstanceForFidsDto } from '@shared-core';

// ── Public Types ─────────────────────────────────────────────────────────

export type OpsFlightStatus =
    | 'SCHEDULED'
    | 'DELAYED'
    | 'BOARDING'
    | 'DEPARTED'
    | 'IN_FLIGHT'
    | 'ARRIVED'
    | 'CANCELLED'
    | 'DIVERTED';

export interface IOpsSearchFilters {
    flightNo: string;
    originIata: string;
    destinationIata: string;
    status: OpsFlightStatus | '';
    dateFrom: string;
    dateTo: string;
}

export interface IOpsPagination {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface IStatusCount {
    scheduled: number;
    delayed: number;
    boarding: number;
    inFlight: number;
    arrived: number;
    cancelled: number;
}

/**
 * Status transition graph — per operational rules:
 * A flight can only move forward through its lifecycle; no reversals except
 * DELAYED (can revert to SCHEDULED if delay is resolved).
 */
export const VALID_TRANSITIONS: Record<string, OpsFlightStatus[]> = {
    SCHEDULED: ['DELAYED', 'BOARDING', 'CANCELLED'],
    DELAYED: ['SCHEDULED', 'BOARDING', 'CANCELLED'],
    BOARDING: ['DEPARTED', 'DELAYED', 'CANCELLED'],
    DEPARTED: ['IN_FLIGHT', 'DIVERTED', 'CANCELLED'],
    IN_FLIGHT: ['ARRIVED', 'DIVERTED'],
    ARRIVED: [],                            // terminal — no transitions
    CANCELLED: [],                            // terminal — no transitions
    DIVERTED: ['ARRIVED', 'CANCELLED'],
};


export type FidsView = 'DEPARTURES' | 'ARRIVALS';

export interface IFidsFilters {
    gateFilter: string;      // free-text — exact gate code like "B12" or ''
    statusFilter: string;    // '' = all, 'BOARDING', 'ON_TIME', 'DELAYED', etc.
    airlineFilter: string;   // '' = all, partial match on airlineName
}

// ── Defaults ──────────────────────────────────────────────────────────────

function _todayIso(): string {
    return new Date().toISOString().split('T')[0];
}

function _tomorrowIso(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
}

export const DEFAULT_OPS_FILTERS: IOpsSearchFilters = {
    flightNo: '',
    originIata: '',
    destinationIata: '',
    status: '',
    dateFrom: _todayIso(),
    dateTo: _tomorrowIso(),
};

const DEFAULT_PAGINATION: IOpsPagination = {
    pageNumber: 1,
    pageSize: 25,
    totalCount: 0,
    totalPages: 0,
};

// ── Polling interval (60 seconds) ─────────────────────────────────────────
const POLL_INTERVAL_MS = 60_000;

// Module-level subscription handle (outside store state to avoid serialization)
let _pollSub: Subscription | null = null;

// ── State ─────────────────────────────────────────────────────────────────

interface OpsSurveillanceState {
    liveFlights: IFlightInstanceDto[];
    searchFilters: IOpsSearchFilters;
    pagination: IOpsPagination;
    selectedFlight: IFlightInstanceDto | null;
    isLoading: boolean;
    isUpdating: boolean;
    errorLog: string | null;
    lastRefreshed: string | null;           // ISO timestamp
    isPolling: boolean;
    // FIDS Management Console
    fidsDepartures: IFlightInstanceForFidsDto[];
    fidsArrivals: IFlightInstanceForFidsDto[];
    activeFidsView: FidsView;
    fidsFilters: IFidsFilters;
    fidsLoading: boolean;
    fidsError: string | null;
    fidsLastRefresh: string | null;     // ISO timestamp
    fidsAirportCode: string;            // current airport context
}

const initialState: OpsSurveillanceState = {
    liveFlights: [],
    searchFilters: DEFAULT_OPS_FILTERS,
    pagination: DEFAULT_PAGINATION,
    selectedFlight: null,
    isLoading: false,
    isUpdating: false,
    errorLog: null,
    lastRefreshed: null,
    isPolling: false,
    fidsDepartures: [],
    fidsArrivals: [],
    activeFidsView: 'DEPARTURES',
    fidsFilters: { gateFilter: '', statusFilter: '', airlineFilter: '' },
    fidsLoading: false,
    fidsError: null,
    fidsLastRefresh: null,
    fidsAirportCode: 'SIN',
};

// ── Store ─────────────────────────────────────────────────────────────────

export const OpsSurveillanceStore = signalStore(
    { providedIn: 'root' },

    withState<OpsSurveillanceState>(initialState),

    // ── Computed ─────────────────────────────────────────────────────────────
    withComputed(store => ({

        /** Flights with delay > 15 minutes — gets the "Ruby Glow" treatment in the grid. */
        criticallyDelayedCount: computed<number>(() => {
            const now = Date.now();
            return store.liveFlights().filter(f => {
                if (f.status !== 'DELAYED') return false;
                const scheduledDep = new Date(f.scheduledDeparture).getTime();
                return (now - scheduledDep) > 15 * 60 * 1000;
            }).length;
        }),

        /** Per-status counts for the command header badge strip. */
        liveFlightsByStatus: computed<IStatusCount>(() => {
            const list = store.liveFlights();
            const count = (s: OpsFlightStatus) =>
                list.filter(f => f.status?.toUpperCase() === s).length;
            return {
                scheduled: count('SCHEDULED'),
                delayed: count('DELAYED'),
                boarding: count('BOARDING'),
                inFlight: count('IN_FLIGHT') + count('DEPARTED'),
                arrived: count('ARRIVED'),
                cancelled: count('CANCELLED'),
            };
        }),

        hasActiveFilter: computed<boolean>(() => {
            const f = store.searchFilters();
            return !!(f.flightNo || f.originIata || f.destinationIata || f.status);
        }),

        recordLabel: computed<string>(() => {
            const p = store.pagination();
            return p.totalCount > 0
                ? `Page ${p.pageNumber} of ${p.totalPages} · ${p.totalCount.toLocaleString()} flights`
                : `${store.liveFlights().length} flights`;
        }),

        /** Human-readable "Last Updated" string for the header ticker. */
        lastRefreshedLabel: computed<string>(() => {
            const ts = store.lastRefreshed();
            if (!ts) return 'Never';
            const d = new Date(ts);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }),

        canGoPrev: computed<boolean>(() => store.pagination().pageNumber > 1),

        canGoNext: computed<boolean>(() =>
            store.pagination().pageNumber < store.pagination().totalPages
        ),

        /** Valid next statuses for the currently selected flight. */
        validNextStatuses: computed<OpsFlightStatus[]>(() => {
            const current = store.selectedFlight()?.status?.toUpperCase() ?? '';
            return VALID_TRANSITIONS[current] ?? [];
        }),

        /**
            * Currently visible FIDS rows after all filters are applied.
            * Sourced from whichever view is active (DEPARTURES or ARRIVALS).
            */
        fidsDisplayRows: computed<IFlightInstanceForFidsDto[]>(() => {
            const raw = store.activeFidsView() === 'DEPARTURES'
                ? store.fidsDepartures()
                : store.fidsArrivals();
            const filters = store.fidsFilters();

            return raw.filter(f => {
                // Gate filter — exact or partial, case-insensitive
                if (filters.gateFilter) {
                    const gate = f.gate?.toLowerCase() ?? '';
                    if (!gate.includes(filters.gateFilter.toLowerCase())) return false;
                }
                // Status filter — exact, case-insensitive
                if (filters.statusFilter) {
                    const fStatus = f.status?.toUpperCase() ?? '';
                    if (fStatus !== filters.statusFilter.toUpperCase()) return false;
                }
                // Airline filter — partial match on airlineName
                if (filters.airlineFilter) {
                    const name = f.airlineName?.toLowerCase() ?? '';
                    if (!name.includes(filters.airlineFilter.toLowerCase())) return false;
                }
                return true;
            });
        }),

        /** Count of flights in the critical boarding state — for the header badge. */
        boardingCount: computed<number>(() =>
            store.fidsDepartures().filter(f => f.status?.toUpperCase() === 'BOARDING').length
        ),

        /** Count of delayed flights across both departure and arrival sets. */
        fidsDelayedCount: computed<number>(() => {
            const deps = store.fidsDepartures().filter(f => f.status?.toUpperCase() === 'DELAYED').length;
            const arrs = store.fidsArrivals().filter(f => f.status?.toUpperCase() === 'DELAYED').length;
            return deps + arrs;
        }),

        /** Human-readable last refresh time for the console ticker. */
        fidsLastRefreshLabel: computed<string>(() => {
            const ts = store.fidsLastRefresh();
            if (!ts) return 'Never';
            return new Date(ts).toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        }),

        /** True when any filter is active. */
        hasFidsFilter: computed<boolean>(() => {
            const f = store.fidsFilters();
            return !!(f.gateFilter || f.statusFilter || f.airlineFilter);
        }),


    })),

    // ── Methods ───────────────────────────────────────────────────────────────
    withMethods((store,
        svc = inject(FlightOperationsService),
        dashSvc = inject(DashboardService),
    ) => ({
        // ── Core Fetch ────────────────────────────────────────────────────────

        /**
         * Fetch live flights with current filters.
         * 300ms debounce + distinctUntilChanged prevents thrashing during rapid
         * filter typing. Called directly and by the polling interval.
         */
        fetchLiveFlights: rxMethod<{ page?: number; silent?: boolean }>(
            pipe(
                debounceTime(300),
                distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
                tap(({ silent, page }) => {
                    if (!silent) {
                        patchState(store, { isLoading: true, errorLog: null });
                    }
                    patchState(store, {
                        pagination: { ...store.pagination(), pageNumber: page ?? store.pagination().pageNumber },
                    });
                }),
                switchMap(({ page }) => {
                    const f = store.searchFilters();
                    const filter: IFlightInstanceFilterDto = {
                        flightNo: f.flightNo || undefined,
                        originIata: f.originIata || undefined,
                        destinationIata: f.destinationIata || undefined,
                        status: f.status || undefined,
                        startDate: f.dateFrom || undefined,
                        endDate: f.dateTo || undefined,
                    };

                    return svc.searchFlightInstances(
                        filter,
                        page ?? store.pagination().pageNumber,
                        store.pagination().pageSize
                    ).pipe(
                        tapResponse({
                            next: result =>
                                patchState(store, {
                                    liveFlights: result.items ?? [],
                                    pagination: {
                                        pageNumber: result.pageNumber,
                                        pageSize: result.pageSize,
                                        totalCount: result.totalCount,
                                        totalPages: result.totalPages,
                                    },
                                    isLoading: false,
                                    lastRefreshed: new Date().toISOString(),
                                }),
                            error: (err: unknown) =>
                                patchState(store, {
                                    isLoading: false,
                                    errorLog: _opsError(err, 'Failed to load live operations data.'),
                                }),
                        })
                    );
                })
            )
        ),

        // ── Filter Management ─────────────────────────────────────────────────

        updateFilters(partial: Partial<IOpsSearchFilters>): void {
            patchState(store, {
                searchFilters: { ...store.searchFilters(), ...partial },
                pagination: { ...store.pagination(), pageNumber: 1 },
            });
        },

        resetFilters(): void {
            patchState(store, { searchFilters: DEFAULT_OPS_FILTERS, pagination: DEFAULT_PAGINATION });
        },

        goToPage(page: number): void {
            patchState(store, { pagination: { ...store.pagination(), pageNumber: page } });
        },

        // ── Flight Selection ──────────────────────────────────────────────────

        selectFlight(flight: IFlightInstanceDto | null): void {
            patchState(store, { selectedFlight: flight, errorLog: null });
        },

        clearSelection(): void {
            patchState(store, { selectedFlight: null });
        },

        // ── Status Update — Optimistic UI ─────────────────────────────────────

        /**
         * Change flight status with optimistic UI update.
         *
         * Constraint: only transitions listed in VALID_TRANSITIONS are allowed.
         * The UI enforces this via status-update-dropdown disabled states, but
         * the store double-validates as a safety net.
         *
         * Optimistic flow: immediate UI update → API call → rollback on error.
         * Returns Promise<{ success; error? }> for toast handling.
         */
        async changeStatus(
            instanceId: number,
            newStatus: OpsFlightStatus,
            reason?: string
        ): Promise<{ success: boolean; error?: string }> {
            const prevFlights = store.liveFlights();
            const prevSelected = store.selectedFlight();

            // Validate transition before optimistic update
            const current = prevFlights.find(f => f.instanceId === instanceId);
            const validNext = VALID_TRANSITIONS[current?.status?.toUpperCase() ?? ''] ?? [];
            if (!validNext.includes(newStatus)) {
                const msg = `Invalid Transition: Cannot move from ${current?.status} to ${newStatus}.`;
                patchState(store, { errorLog: msg });
                return { success: false, error: msg };
            }

            // Optimistic update
            const updated = (f: IFlightInstanceDto): IFlightInstanceDto =>
                f.instanceId === instanceId ? { ...f, status: newStatus } : f;

            patchState(store, {
                liveFlights: prevFlights.map(updated),
                selectedFlight: prevSelected?.instanceId === instanceId
                    ? { ...prevSelected, status: newStatus }
                    : prevSelected,
                isUpdating: true,
                errorLog: null,
            });

            const dto: IUpdateFlightStatusDto = { status: newStatus, reason };

            try {
                await firstValueFrom(svc.updateFlightStatus(instanceId, dto));
                patchState(store, {
                    isUpdating: false,
                    lastRefreshed: new Date().toISOString(),
                });
                return { success: true };
            } catch (err) {
                // Full rollback
                const msg = _opsError(err, `Failed to update status for flight #${instanceId}.`);
                patchState(store, {
                    liveFlights: prevFlights,
                    selectedFlight: prevSelected,
                    isUpdating: false,
                    errorLog: msg,
                });
                return { success: false, error: msg };
            }
        },

        // ── Time Adjustment ───────────────────────────────────────────────────

        /**
         * Adjust actual departure / arrival times for a flight instance.
         *
         * Maps to IUpdateFlightTimesDto: { actualDepartureTime?, actualArrivalTime? }
         * Note: estimatedDepartureTime / estimatedArrivalTime are commented out in
         * the uploaded model — only actual times are supported by this API.
         *
         * Optimistic: updates local state immediately, refreshes from server on success.
         */
        async adjustFlightTimes(
            instanceId: number,
            newTimes: IUpdateFlightTimesDto
        ): Promise<{ success: boolean; error?: string }> {
            const prevFlights = store.liveFlights();
            const prevSelected = store.selectedFlight();

            // Optimistic update with the new times
            const updatedFlight = (f: IFlightInstanceDto): IFlightInstanceDto => {
                if (f.instanceId !== instanceId) return f;
                return {
                    ...f,
                    actualDeparture: newTimes.actualDeparture ?? f.actualDeparture,
                    actualArrival: newTimes.actualArrival ?? f.actualArrival,
                };
            };

            patchState(store, {
                liveFlights: prevFlights.map(updatedFlight),
                selectedFlight: prevSelected?.instanceId === instanceId
                    ? updatedFlight(prevSelected)
                    : prevSelected,
                isUpdating: true,
                errorLog: null,
            });

            try {
                const refreshed = await firstValueFrom(
                    svc.updateFlightTimes(instanceId, newTimes)
                );

                // Replace optimistic with server-confirmed data
                patchState(store, {
                    liveFlights: prevFlights.map(f => f.instanceId === instanceId ? refreshed : f),
                    selectedFlight: prevSelected?.instanceId === instanceId ? refreshed : prevSelected,
                    isUpdating: false,
                    lastRefreshed: new Date().toISOString(),
                });

                return { success: true };
            } catch (err) {
                const msg = _opsError(err, `Failed to adjust times for flight #${instanceId}.`);
                patchState(store, {
                    liveFlights: prevFlights,
                    selectedFlight: prevSelected,
                    isUpdating: false,
                    errorLog: msg,
                });
                return { success: false, error: msg };
            }
        },

        // ── Polling ───────────────────────────────────────────────────────────

        /** Start 60-second silent polling. Call from Smart Page ngOnInit. */
        startPolling(): void {
            if (_pollSub) return;
            patchState(store, { isPolling: true });
            _pollSub = interval(POLL_INTERVAL_MS).subscribe(() => {
                // Skip poll during active updates to prevent race conditions
                if (store.isUpdating()) return;
                // Silent refresh: no loading spinner, no error banner reset
                // We call the rxMethod-backed fetch via a manual trigger approach.
                // The signal update triggers the rxMethod input pipe.
                const f = store.searchFilters();
                const filter: IFlightInstanceFilterDto = {
                    flightNo: f.flightNo || undefined,
                    originIata: f.originIata || undefined,
                    destinationIata: f.destinationIata || undefined,
                    status: f.status || undefined,
                    startDate: f.dateFrom || undefined,
                    endDate: f.dateTo || undefined,
                };

                svc.searchFlightInstances(
                    filter,
                    store.pagination().pageNumber,
                    store.pagination().pageSize
                ).pipe(
                    catchError(() => of(null))
                ).subscribe(result => {
                    if (!result) return;
                    patchState(store, {
                        liveFlights: result.items ?? [],
                        pagination: {
                            pageNumber: result.pageNumber,
                            pageSize: result.pageSize,
                            totalCount: result.totalCount,
                            totalPages: result.totalPages,
                        },
                        lastRefreshed: new Date().toISOString(),
                    });
                });
            });
        },

        /** Stop polling. Call from Smart Page ngOnDestroy. */
        stopPolling(): void {
            _pollSub?.unsubscribe();
            _pollSub = null;
            patchState(store, { isPolling: false });
        },

        // ── Error Management ──────────────────────────────────────────────────

        clearError(): void {
            patchState(store, { errorLog: null });
        },

        handleError(err: unknown): string {
            const msg = _opsError(err, 'An unexpected operations error occurred.');
            patchState(store, { errorLog: msg });
            return msg;
        },

        // ══════════════════════════════════════════════════════════════════════════
        // FIDS MANAGEMENT CONSOLE METHODS
        // ══════════════════════════════════════════════════════════════════════════

        /**
         * Load FIDS data for the active view and current airport context.
         *
         * Strategy: always load BOTH departures AND arrivals in parallel using
         * forkJoin so the toggle between views is instantaneous (no reload lag).
         * Each branch is individually catch-wrapped for partial resilience.
         *
         * `silent = true` suppresses the loading spinner during polling cycles.
         */
        loadFidsData: rxMethod<{ airportCode?: string; silent?: boolean }>(
            pipe(
                tap(({ silent }) => {
                    if (!silent) patchState(store, { fidsLoading: true, fidsError: null });
                }),
                switchMap(({ airportCode }) => {
                    const code = airportCode ?? store.fidsAirportCode();
                    if (airportCode) patchState(store, { fidsAirportCode: code });

                    return forkJoin({
                        departures: dashSvc.getFidsDepartures(code).pipe(
                            catchError(() => of([] as IFlightInstanceForFidsDto[]))
                        ),
                        arrivals: dashSvc.getFidsArrivals(code).pipe(
                            catchError(() => of([] as IFlightInstanceForFidsDto[]))
                        ),
                    }).pipe(
                        tapResponse({
                            next: ({ departures, arrivals }) =>
                                patchState(store, {
                                    fidsDepartures: departures,
                                    fidsArrivals: arrivals,
                                    fidsLoading: false,
                                    fidsLastRefresh: new Date().toISOString(),
                                    fidsError: null,
                                }),
                            error: (err: unknown) =>
                                patchState(store, {
                                    fidsLoading: false,
                                    fidsError: _fidsError(err, 'FIDS data synchronisation failed. Reconnecting…'),
                                }),
                        })
                    );
                })
            )
        ),

        /**
         * Toggle between DEPARTURES and ARRIVALS views.
         * Data is already loaded — this is an instant client-side switch.
         */
        toggleFidsView(view: FidsView): void {
            patchState(store, {
                activeFidsView: view,
                // Reset filters when switching boards — avoids confusing gate-only views
                fidsFilters: { ...store.fidsFilters(), gateFilter: '', statusFilter: '' },
            });
        },

        /** Apply / update filter criteria. Data re-filters via computed signal. */
        updateFidsFilters(partial: Partial<IFidsFilters>): void {
            patchState(store, {
                fidsFilters: { ...store.fidsFilters(), ...partial },
            });
        },

        /** Reset all FIDS filters to empty. */
        clearFidsFilters(): void {
            patchState(store, {
                fidsFilters: { gateFilter: '', statusFilter: '', airlineFilter: '' },
            });
        },

        /** Update the airport context and reload. */
        setFidsAirport(code: string): void {
            patchState(store, { fidsAirportCode: code.toUpperCase() });
        },

        /** Clear the FIDS connectivity error banner. */
        clearFidsError(): void {
            patchState(store, { fidsError: null });
        },


    }))
);

// ── Private Error Mapper ──────────────────────────────────────────────────

function _opsError(err: unknown, fallback: string): string {
    if (!err || typeof err !== 'object') return fallback;
    const e = err as Record<string, unknown>;
    const body = e?.['error'] as Record<string, unknown> | undefined;
    const status = e?.['status'] as number | undefined;

    if (status === 409) {
        const msg = body?.['message'] as string | undefined;
        if (msg?.toLowerCase().includes('transition') || msg?.toLowerCase().includes('status'))
            return `Invalid Status Transition: ${msg ?? 'The requested status change violates operational rules. Verify the current state before proceeding.'}`;
        if (msg?.toLowerCase().includes('airborne') || msg?.toLowerCase().includes('in_flight'))
            return 'Safety Lock: This flight is currently airborne. Time adjustments require ATC coordination.';
        return msg ?? 'Operational Conflict: A constraint violation was detected. Review the flight state.';
    }

    if (status === 422)
        return (body?.['message'] as string) ??
            'Validation Error: The update parameters failed operational validation. Verify times and status.';

    if (status === 403)
        return 'Authorization Denied: You do not have clearance to modify this flight operation.';

    if (status === 404)
        return 'Flight instance not found. It may have been archived or resolved.';

    if (status === 400) {
        if (body?.['errors'] && typeof body['errors'] === 'object') {
            return Object.entries(body['errors'] as Record<string, string | string[]>)
                .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`)
                .join(' · ');
        }
        return (body?.['message'] as string) ?? 'Invalid update request. Review input parameters.';
    }

    if (status === 0 || status === undefined)
        return 'Network Error: Unable to reach the Operations Registry. Verify connectivity.';

    return (body?.['message'] as string) ?? (e?.['message'] as string) ?? fallback;
}

function _fidsError(err: unknown, fallback: string): string {
    if (!err || typeof err !== 'object') return fallback;
    const e = err as Record<string, unknown>;
    const body = e?.['error'] as Record<string, unknown> | undefined;
    const status = e?.['status'] as number | undefined;

    if (status === 403)
        return 'Authorization Denied: You do not have clearance to access FIDS display data.';

    if (status === 404)
        return 'Airport Not Found: The selected airport IATA code is not registered in the FIDS registry. Verify the airport code.';

    if (status === 0 || status === undefined)
        return 'System Connectivity Alert: FIDS data feed is unreachable. Reconnecting automatically every 60 seconds.';

    return (body?.['message'] as string) ?? (e?.['message'] as string) ?? fallback;
}