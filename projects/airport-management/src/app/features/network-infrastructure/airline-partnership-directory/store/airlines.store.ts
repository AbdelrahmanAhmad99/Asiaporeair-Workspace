
import { inject } from '@angular/core';
import {
    patchState,
    signalStore,
    withComputed,
    withMethods,
    withState,

} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { computed } from '@angular/core';
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

import { AirlinesService } from '@shared-core';
import { IAirlineDto } from '@shared-core';

import { IAircraftDto } from '@shared-core';

import { AirportsService } from '@shared-core';
import {
    IAirportDto,
    ICreateAirlineDto,
    IUpdateAirlineDto,
} from '@shared-core';

// ── Supporting Shapes ─────────────────────────────────────────────────────

export interface IAirlineFilter {
    searchName: string;
    region: string;
}

export interface IAirlinePagination {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface IAirlineSummaryMetrics {
    totalActivePartners: number;
    uniqueRegions: number;
    uniqueBaseAirports: number;
}

export type AirlineViewMode = 'list' | 'search' | 'region';

// ── Default Values ────────────────────────────────────────────────────────

const DEFAULT_FILTER: IAirlineFilter = {
    searchName: '',
    region: '',
};

const DEFAULT_PAGINATION: IAirlinePagination = {
    pageNumber: 1,
    pageSize: 15,
    totalCount: 0,
    totalPages: 0,
};

// ── Known operating regions (used as dropdown options) ────────────────────
export const OPERATING_REGIONS: string[] = [
    'Southeast Asia',
    'Northeast Asia',
    'South Asia',
    'Middle East',
    'Europe',
    'North America',
    'South America',
    'Africa',
    'Oceania',
];

export type AirlineAuditFilter = 'all' | 'active' | 'deactivated';

// ── State Shape ───────────────────────────────────────────────────────────

interface AirlinesState {
    airlines: IAirlineDto[];
    searchResults: IAirlineDto[];
    regionResults: IAirlineDto[];
    filter: IAirlineFilter;
    pagination: IAirlinePagination;
    viewMode: AirlineViewMode;
    loading: boolean;
    error: string | null;

    // Details view
    selectedAirline: IAirlineDto | null;
    selectedAirlineFleet: IAircraftDto[];
    detailsLoading: boolean;
    detailsError: string | null;

    // Management Form view
    formProcessing: boolean;
    formError: string | null;
    formSuccess: boolean;          // one-shot flag for save confirmation
    baseAirportOptions: IAirportDto[];   // autocomplete results for hub selection
    airportSearching: boolean;         // spinner for the airport search field

    // Audit Center view
    auditRecords: IAirlineDto[];  // full history including deactivated airlines
    auditFilter: AirlineAuditFilter; // 'all' | 'active' | 'deactivated'
    auditSearch: string;         // instant search within the audit list
    isRestoring: boolean;        // true while reactivateAirline is in-flight
    restoringIataCode: string | null; // which specific airline is being restored
    backendError: string | null;  // structured API error (e.g. dependency conflict)
    auditLoading: boolean;        // isolated from the list `loading` flag
}

const initialState: AirlinesState = {
    airlines: [],
    searchResults: [],
    regionResults: [],
    filter: DEFAULT_FILTER,
    pagination: DEFAULT_PAGINATION,
    viewMode: 'list',
    loading: false,
    error: null,
    selectedAirline: null,
    selectedAirlineFleet: [],
    detailsLoading: false,
    detailsError: null,
    formProcessing: false,
    formError: null,
    formSuccess: false,
    baseAirportOptions: [],
    airportSearching: false,
    auditRecords: [],
    auditFilter: 'all',
    auditSearch: '',
    isRestoring: false,
    restoringIataCode: null,
    backendError: null,
    auditLoading: false,
};

// ── Store ─────────────────────────────────────────────────────────────────

export const AirlinesStore = signalStore(
    { providedIn: 'root' },

    withState<AirlinesState>(initialState),

    // ── Computed signals ─────────────────────────────────────────────────────
    withComputed(store => ({

        /**
         * The active dataset for the data grid.
         * Switches based on `viewMode`.
         */
        displayedAirlines: computed<IAirlineDto[]>(() => {
            switch (store.viewMode()) {
                case 'search': return store.searchResults();
                case 'region': return store.regionResults();
                default: return store.airlines();
            }
        }),

        /** Total active partner count — surfaced by pagination metadata. */
        totalActive: computed<number>(() => store.pagination().totalCount),

        /** Unique operating regions derived from the loaded list. */
        uniqueRegionList: computed<string[]>(() => {
            const all = [
                ...store.airlines(),
                ...store.searchResults(),
                ...store.regionResults(),
            ];
            return [...new Set(all.map(a => a.operatingRegion))].sort();
        }),

        /** Aggregate metrics for the 3 executive summary widgets. */
        summaryMetrics: computed<IAirlineSummaryMetrics>(() => {
            const list = store.airlines();
            const regions = new Set(list.map(a => a.operatingRegion));
            const airports = new Set(list.map(a => a.baseAirportIataCode));

            return {
                totalActivePartners: store.pagination().totalCount || list.length,
                uniqueRegions: regions.size,
                uniqueBaseAirports: airports.size,
            };
        }),

        /** True if there is an active search or region filter. */
        hasActiveFilter: computed<boolean>(() => {
            const f = store.filter();
            return !!(f.searchName || f.region);
        }),

        /** Human-readable record count for the grid footer. */
        recordLabel: computed<string>(() => {
            switch (store.viewMode()) {
                case 'search':
                    return `${store.searchResults().length} results for "${store.filter().searchName}"`;
                case 'region':
                    return `${store.regionResults().length} partners in ${store.filter().region}`;
                default: {
                    const p = store.pagination();
                    return p.totalCount > 0
                        ? `Page ${p.pageNumber} of ${p.totalPages} · ${p.totalCount} total partners`
                        : `${store.airlines().length} active partners`;
                }
            }
        }),


        /**
         * Fleet size for the selected airline.
         * Zero until `loadAirlineDeepDetails` completes successfully.
         */
        fleetSize: computed<number>(() => store.selectedAirlineFleet().length),

        /**
         * Quick aircraft-status breakdown for the profile header.
         * Returns { active, maintenance, retired } counts.
         */
        fleetStatusBreakdown: computed<{ active: number; maintenance: number; retired: number }>(() => {
            const fleet = store.selectedAirlineFleet();
            // IAircraftDto carries a `status` field ('Active' | 'Maintenance' | 'Retired')
            return {
                active: fleet.filter(a => a.status === 'Active').length,
                maintenance: fleet.filter(a => a.status === 'Maintenance').length,
                retired: fleet.filter(a => a.status === 'Retired' || a.status === 'Decommissioned').length,
            };
        }),

        /**
     * Filtered + instant-searched audit records.
     *
     * Deletion status is derived by cross-referencing `auditRecords` against
     * `airlines` (the active list). A record is considered "deactivated" if
     * its iataCode is absent from the active airlines set.
     *
     * Returns a sorted list: deactivated records first, then active, within
     * each group sorted by name ascending.
     */
        filteredAuditRecords: computed<IAirlineDto[]>(() => {
            const activeSet = new Set(store.airlines().map(a => a.iataCode));
            const all = store.auditRecords();
            const filter = store.auditFilter();
            const query = (store.auditSearch() ?? '').toLowerCase().trim();

            let list: IAirlineDto[];

            switch (filter) {
                case 'deactivated':
                    list = all.filter(a => !activeSet.has(a.iataCode));
                    break;
                case 'active':
                    list = all.filter(a => activeSet.has(a.iataCode));
                    break;
                default:
                    list = all;
            }

            if (query) {
                list = list.filter(a =>
                    a.iataCode.toLowerCase().includes(query) ||
                    a.name.toLowerCase().includes(query) ||
                    a.callsign.toLowerCase().includes(query) ||
                    a.operatingRegion.toLowerCase().includes(query)
                );
            }

            // Sort: deactivated first, then by name
            return [...list].sort((a, b) => {
                const aActive = activeSet.has(a.iataCode) ? 1 : 0;
                const bActive = activeSet.has(b.iataCode) ? 1 : 0;
                if (aActive !== bActive) return aActive - bActive;
                return a.name.localeCompare(b.name);
            });
        }),

        /** Quick count of how many records are currently deactivated. */
        deactivatedAirlineCount: computed<number>(() => {
            const activeSet = new Set(store.airlines().map(a => a.iataCode));
            return store.auditRecords().filter(a => !activeSet.has(a.iataCode)).length;
        }),

        /** Derived active set from the live airlines list — passed to the dumb list. */
        activeAirlineSet: computed<Set<string>>(
            () => new Set(store.airlines().map(a => a.iataCode))
        ),


    })),

    // ── Methods ───────────────────────────────────────────────────────────────
    withMethods((store,
        airlinesService = inject(AirlinesService),
        airportsService = inject(AirportsService),
    ) => ({

        // ══════════════════════════════════════════════════════════════════════════
        // LIST / PAGINATION
        // ══════════════════════════════════════════════════════════════════════════

        /**
         * Load the paginated active airlines list.
         * Resets to 'list' viewMode.
         */
        loadAirlines: rxMethod<{ page?: number; region?: string }>(
            pipe(
                tap(({ page }) =>
                    patchState(store, {
                        loading: true,
                        error: null,
                        viewMode: 'list',
                        pagination: { ...store.pagination(), pageNumber: page ?? 1 },
                    })
                ),
                switchMap(({ page, region }) =>
                    airlinesService
                        .getPaginatedAirlines(
                            page ?? store.pagination().pageNumber,
                            store.pagination().pageSize,
                            region
                        )
                        .pipe(
                            tapResponse({
                                next: result =>
                                    patchState(store, {
                                        airlines: result.items ?? [],
                                        pagination: {
                                            pageNumber: result.pageNumber,
                                            pageSize: result.pageSize,
                                            totalCount: result.totalCount,
                                            totalPages: result.totalPages,
                                        },
                                        loading: false,
                                    }),
                                error: (err: unknown) =>
                                    patchState(store, {
                                        loading: false,
                                        error: _extractMsg(err, 'Failed to load partner airlines.'),
                                    }),
                            })
                        )
                )
            )
        ),

        /**
         * Search by airline name with 300ms debounce.
         * Switches viewMode to 'search'.
         */
        search: rxMethod<string>(
            pipe(
                debounceTime(300),
                distinctUntilChanged(),
                tap(name =>
                    patchState(store, {
                        loading: true,
                        error: null,
                        filter: { ...store.filter(), searchName: name },
                        viewMode: name ? 'search' : 'list',
                    })
                ),
                switchMap(name => {
                    if (!name.trim()) {
                        patchState(store, { searchResults: [], loading: false });
                        return of(null);
                    }

                    return airlinesService.findAirlinesByName(name).pipe(
                        tapResponse({
                            next: results =>
                                patchState(store, { searchResults: results, loading: false }),
                            error: (err: unknown) =>
                                patchState(store, {
                                    loading: false,
                                    error: _extractMsg(err, 'Search failed.'),
                                }),
                        })
                    );
                })
            )
        ),

        /**
         * Filter by operating region with 300ms debounce.
         * Switches viewMode to 'region'.
         */
        filterByRegion: rxMethod<string>(
            pipe(
                debounceTime(300),
                distinctUntilChanged(),
                tap(region =>
                    patchState(store, {
                        loading: true,
                        error: null,
                        filter: { ...store.filter(), region },
                        viewMode: region ? 'region' : 'list',
                    })
                ),
                switchMap(region => {
                    if (!region.trim()) {
                        patchState(store, { regionResults: [], loading: false });
                        return of(null);
                    }

                    return airlinesService.getAirlinesByOperatingRegion(region).pipe(
                        tapResponse({
                            next: results =>
                                patchState(store, { regionResults: results, loading: false }),
                            error: (err: unknown) =>
                                patchState(store, {
                                    loading: false,
                                    error: _extractMsg(err, 'Region filter failed.'),
                                }),
                        })
                    );
                })
            )
        ),



        /** Reset all filters and return to the paginated list. */
        clearFilters(): void {
            patchState(store, {
                filter: DEFAULT_FILTER,
                searchResults: [],
                regionResults: [],
                viewMode: 'list',
            });
        },

        /** Advance to a specific page in the paginated list. */
        goToPage(page: number): void {
            patchState(store, {
                pagination: { ...store.pagination(), pageNumber: page },
            });
        },

        /**
             * Load the full airline profile and its registered fleet concurrently.
             *
             * Strategy:
             *  • `getAirlineByIataCode` + `getAirlineWithFleet` fire in parallel via forkJoin.
             *  • Both results are written to the store in a single `patchState` call
             *    for atomic, flicker-free state transitions.
             *  • Each inner call is individually error-trapped: if the fleet call fails
             *    (e.g. no fleet registered yet) the profile still renders.
             *  • `detailsLoading` is isolated from the list `loading` flag so the
             *    dashboard and details views never interfere.
             */
        loadAirlineDeepDetails: rxMethod<string>(
            pipe(
                tap(() =>
                    patchState(store, {
                        detailsLoading: true,
                        detailsError: null,
                        selectedAirline: null,
                        selectedAirlineFleet: [],
                    })
                ),
                switchMap((iataCode: string) =>
                    forkJoin({
                        profile: airlinesService.getAirlineByIataCode(iataCode).pipe(
                            catchError(err => {
                                patchState(store, {
                                    detailsLoading: false,
                                    detailsError:
                                        (err as { status?: number })?.status === 404
                                            ? `Partner airline "${iataCode}" was not found.`
                                            : ((err as Error)?.message ?? 'Failed to load airline profile.'),
                                });
                                return of(null);
                            })
                        ),
                        detail: airlinesService.getAirlineWithFleet(iataCode).pipe(
                            catchError(() => of(null))
                        ),
                    }).pipe(
                        tapResponse({
                            next: ({ profile, detail }) => {
                                // Atomic single patchState — prevents partial renders
                                patchState(store, {
                                    selectedAirline: profile,
                                    selectedAirlineFleet: detail?.fleet ?? [],
                                    detailsLoading: false,
                                });
                            },
                            error: (err: unknown) =>
                                patchState(store, {
                                    detailsLoading: false,
                                    detailsError: _extractMsg(err, 'Failed to load airline details.'),
                                }),
                        })
                    )
                )
            )
        ),

        /**
         * Clear all details-view state when navigating away.
         * Prevents stale data if the user revisits a different airline.
         */
        clearAirlineDetails(): void {
            patchState(store, {
                selectedAirline: null,
                selectedAirlineFleet: [],
                detailsLoading: false,
                detailsError: null,
            });
        },

        /** Set a transient details-level error. */
        setDetailsError(message: string | null): void {
            patchState(store, { detailsError: message });
        },

        // ══════════════════════════════════════════════════════════════════════════
        // DEACTIVATION (Soft Delete)
        // ══════════════════════════════════════════════════════════════════════════

        /**
         * Soft-delete an airline with optimistic UI update.
         * Returns a Promise so the Smart Component can await and display the result.
         *
         * Optimistic strategy:
         *  1. Remove from all three cached lists immediately.
         *  2. Call the API.
         *  3. On failure: roll back all three lists and set an error.
         */
        requestDeactivation(
            iataCode: string
        ): Promise<{ success: boolean; error?: string }> {
            // Snapshot all three lists for rollback
            const prevAirlines = store.airlines();
            const prevSearch = store.searchResults();
            const prevRegion = store.regionResults();

            const remove = (list: IAirlineDto[]) =>
                list.filter(a => a.iataCode !== iataCode);

            patchState(store, {
                loading: true,
                airlines: remove(prevAirlines),
                searchResults: remove(prevSearch),
                regionResults: remove(prevRegion),
                pagination: {
                    ...store.pagination(),
                    totalCount: Math.max(0, store.pagination().totalCount - 1),
                },
            });

            return new Promise(resolve => {
                airlinesService.deleteAirline(iataCode).pipe(
                    catchError(err => {
                        const msg = _extractMsg(err, `Failed to deactivate ${iataCode}.`);
                        // Full rollback
                        patchState(store, {
                            airlines: prevAirlines,
                            searchResults: prevSearch,
                            regionResults: prevRegion,
                            loading: false,
                            error: msg,
                            pagination: {
                                ...store.pagination(),
                                totalCount: store.pagination().totalCount + 1,
                            },
                        });
                        resolve({ success: false, error: msg });
                        return of(undefined);
                    })
                ).subscribe(result => {
                    if (result === undefined && store.error()) return; // catchError path
                    patchState(store, { loading: false });
                    resolve({ success: true });
                });
            });
        },

        /** Set a transient error (e.g., from Smart Component operations). */
        setError(message: string | null): void {
            patchState(store, { error: message });
        },


        // ══════════════════════════════════════════════════════════════════════════
        // FORM VIEW METHODS — Management Form Additions
        // ══════════════════════════════════════════════════════════════════════════

        /**
         * Search for valid operational airports to populate the "Strategic Hub
         * Selection" autocomplete.
         *
         * Design:
         *  - 250ms debounce + distinctUntilChanged to prevent thrashing
         *  - Searches by name fragment using AirportsService.searchAirports()
         *  - Results stored in `baseAirportOptions` — bounded to 20 items max
         *  - Short-circuits on empty query (clears the list)
         *  - `airportSearching` flag drives the spinner inside the input
         */
        searchBaseAirports: rxMethod<string>(
            pipe(
                debounceTime(250),
                distinctUntilChanged(),
                tap(query => {
                    if (!query.trim()) {
                        patchState(store, { baseAirportOptions: [], airportSearching: false });
                    } else {
                        patchState(store, { airportSearching: true });
                    }
                }),
                switchMap(query => {
                    if (!query.trim()) return of(null);

                    const filter = { nameContains: query };

                    return airportsService.searchAirports(filter, 1, 20).pipe(
                        tapResponse({
                            next: result =>
                                patchState(store, {
                                    baseAirportOptions: result.items ?? [],
                                    airportSearching: false,
                                }),
                            error: () =>
                                patchState(store, { airportSearching: false }),
                        })
                    );
                })
            )
        ),

        /**
         * Clear the airport autocomplete list (called when the field loses focus
         * after a valid selection, or when the form is reset).
         */
        clearAirportOptions(): void {
            patchState(store, { baseAirportOptions: [], airportSearching: false });
        },

        submitAirlineForm(
            data: ICreateAirlineDto | IUpdateAirlineDto,
            isEdit: boolean,
            iataCode?: string
        ): Promise<{ success: boolean; iataCode?: string; error?: string }> {
            patchState(store, {
                formProcessing: true,
                formError: null,
                formSuccess: false,
            });

            const call$ = isEdit && iataCode
                ? airlinesService.updateAirline(iataCode, data as IUpdateAirlineDto)
                : airlinesService.createAirline(data as ICreateAirlineDto);

            return new Promise(resolve => {
                call$.pipe(
                    catchError(err => {
                        const msg = _extractMsg(err, `Failed to ${isEdit ? 'update' : 'create'} airline.`);
                        patchState(store, { formProcessing: false, formError: msg });
                        resolve({ success: false, error: msg });
                        return of(null as unknown as IAirlineDto);
                    })
                ).subscribe(result => {
                    if (!result) return; // catchError path already resolved

                    if (isEdit) {
                        // Replace in all three caches atomically
                        const replace = (list: IAirlineDto[]) =>
                            list.map(a => (a.iataCode === result.iataCode ? result : a));

                        patchState(store, {
                            airlines: replace(store.airlines()),
                            searchResults: replace(store.searchResults()),
                            regionResults: replace(store.regionResults()),
                            // Also refresh the details view if currently open
                            selectedAirline:
                                store.selectedAirline()?.iataCode === result.iataCode
                                    ? result
                                    : store.selectedAirline(),
                            formProcessing: false,
                            formSuccess: true,
                        });
                    } else {
                        patchState(store, {
                            airlines: [result, ...store.airlines()],
                            formProcessing: false,
                            formSuccess: true,
                            pagination: {
                                ...store.pagination(),
                                totalCount: store.pagination().totalCount + 1,
                            },
                        });
                    }

                    resolve({ success: true, iataCode: result.iataCode });
                });
            });
        },

        /** Clear form-level error (e.g. when user starts editing again). */
        clearFormError(): void {
            patchState(store, { formError: null, formSuccess: false });
        },


        // ══════════════════════════════════════════════════════════════════════════
        // AUDIT CENTER METHODS
        // ══════════════════════════════════════════════════════════════════════════

        /**
         * Load the complete airline history including all soft-deleted records.
         * Runs two parallel fetches to ensure both the audit log and the active
         * list are fresh — deletion status derivation requires both to be accurate.
         *
         * `auditLoading` is isolated from the dashboard `loading` flag so running
         * this method never triggers a loading state in the main grid.
         */
        fetchAuditHistory: rxMethod<void>(
            pipe(
                tap(() =>
                    patchState(store, {
                        auditLoading: true,
                        backendError: null,
                    })
                ),
                switchMap(() =>
                    forkJoin({
                        all: airlinesService.getAllAirlinesIncludingDeleted().pipe(catchError(() => of([]))),
                        active: airlinesService.getAllActiveAirlines().pipe(catchError(() => of([]))),
                    }).pipe(
                        tapResponse({
                            next: ({ all, active }) =>
                                patchState(store, {
                                    auditRecords: all,
                                    airlines: active,    // refresh active list in sync
                                    auditLoading: false,
                                }),
                            error: (err: unknown) =>
                                patchState(store, {
                                    auditLoading: false,
                                    backendError: _mapBackendError(err, 'Failed to load audit history.'),
                                }),
                        })
                    )
                )
            )
        ),

        /**
         * Restore (reactivate) a deactivated airline.
         *
         * Optimistic strategy:
         *  1. Add the airline back to the `airlines` active list immediately.
         *  2. Call `reactivateAirline`.
         *  3. On success: nothing more needed — the active set is already updated.
         *  4. On failure:
         *     - Roll back the optimistic add.
         *     - Set `backendError` with a structured, human-readable message.
         *       Dependency conflicts get a specific message rather than a raw 500.
         *
         * Returns a Promise<{ success: boolean; iataCode: string; error?: string }>
         * so the Smart Component can display a toast notification.
         */
        restoreAirline(
            iataCode: string
        ): Promise<{ success: boolean; iataCode: string; error?: string }> {
            patchState(store, {
                isRestoring: true,
                restoringIataCode: iataCode,
                backendError: null,
            });

            // Optimistic: add back to the active airlines list
            const record = store.auditRecords().find(a => a.iataCode === iataCode);
            const prevAirlines = store.airlines();

            if (record && !prevAirlines.some(a => a.iataCode === iataCode)) {
                patchState(store, { airlines: [...prevAirlines, record] });
            }

            return new Promise(resolve => {
                airlinesService.reactivateAirline(iataCode).pipe(
                    catchError(err => {
                        const msg = _mapBackendError(err, `Failed to restore partner ${iataCode}.`);

                        // Full rollback
                        patchState(store, {
                            airlines: prevAirlines,
                            isRestoring: false,
                            restoringIataCode: null,
                            backendError: msg,
                        });

                        resolve({ success: false, iataCode, error: msg });
                        return of(undefined);
                    })
                ).subscribe(result => {
                    if (result === undefined && store.backendError()) return; // catchError path

                    patchState(store, {
                        isRestoring: false,
                        restoringIataCode: null,
                        pagination: {
                            ...store.pagination(),
                            totalCount: store.pagination().totalCount + 1,
                        },
                    });

                    resolve({ success: true, iataCode });
                });
            });
        },

        /** Set the audit view filter. */
        setAuditFilter(filter: AirlineAuditFilter): void {
            patchState(store, { auditFilter: filter });
        },

        /** Update the instant-search query. */
        setAuditSearch(query: string): void {
            patchState(store, { auditSearch: query });
        },

        /** Reset all audit state on navigate-away. */
        clearAuditCenter(): void {
            patchState(store, {
                auditRecords: [],
                auditFilter: 'all',
                auditSearch: '',
                isRestoring: false,
                restoringIataCode: null,
                backendError: null,
                auditLoading: false,
            });
        },

        /** Dismiss the backend error banner. */
        clearBackendError(): void {
            patchState(store, { backendError: null });
        },


    }))


);

// ── Private helpers ────────────────────────────────────────────────────────

function _extractMsg(err: unknown, fallback: string): string {
    const e = err as Record<string, unknown>;
    const body = e?.['error'] as Record<string, unknown> | undefined;
    if (body?.['errors'] && typeof body['errors'] === 'object') {
        return Object.entries(body['errors'] as Record<string, string | string[]>)
            .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`)
            .join(' · ');
    }
    return (body?.['message'] as string) ?? (e?.['message'] as string) ?? fallback;
}


function _mapBackendError(err: unknown, fallback: string): string {
    const e = err as Record<string, unknown>;
    const status = e?.['status'] as number | undefined;
    const body = e?.['error'] as Record<string, unknown> | undefined;

    // Dependency-conflict scenario (e.g. active routes still assigned)
    if (status === 409) {
        return (
            (body?.['message'] as string) ??
            'Dependency Conflict: This partner has active route assignments or fleet records. Resolve all dependencies before restoring.'
        );
    }

    if (status === 404) {
        return 'Registry Error: Airline record not found in the audit log. It may have been permanently removed.';
    }

    if (status === 403) {
        return 'Access Denied: You do not have the required clearance to restore this partner record.';
    }

    if (status === 0 || status === undefined) {
        return 'Network Error: Unable to reach the Aviation Registry. Check connectivity and retry.';
    }

    // Fall back to the general extractor
    const msg = (body?.['message'] as string) ?? (e?.['message'] as string) ?? fallback;
    return msg;
}
