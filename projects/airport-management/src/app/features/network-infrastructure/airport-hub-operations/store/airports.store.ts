
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
    forkJoin,
    of,
    catchError,
} from 'rxjs';

import { AirportsService } from '@shared-core';
import { CountriesService } from '@shared-core';
import {
    IAirportDto,
    IAirportFilterDto,
    ICreateAirportDto,
    IUpdateAirportDto,
} from '@shared-core';
import { ICountryDto } from '@shared-core';

// ── Supporting Shapes ─────────────────────────────────────────────────────

export interface IAirportSearchCriteria {
    iataCode: string;
    icaoCode: string;
    city: string;
    countryIsoCode: string;
}

export interface IAirportPagination {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface IAirportMetrics {
    totalActive: number;
    totalCountries: number;
    totalContinents: number;
    averageAltitude: number;
}

export type AirportViewMode = 'list' | 'search';

/** Payload emitted by the editor's save action. */
export interface IAirportSavePayload {
    mode: 'create' | 'update';
    iataCode?: string; // required in 'update' mode
    data: ICreateAirportDto | IUpdateAirportDto;
}

/** Result returned from saveAirport(). */
export type AirportSaveResult =
    | { success: true; airport: IAirportDto }
    | { success: false; error: string };


/**
 * Controls which subset of `allRecords` the audit table displays.
 * 'all'     → every record, active + deactivated
 * 'deleted' → only deactivated / soft-deleted nodes
 * 'active'  → only currently operational nodes
 */
export type AuditFilter = 'all' | 'deleted' | 'active';

/**
 * Toast notification pushed onto the queue by store actions.
 * The Smart Component renders and auto-dismisses these.
 */
export interface IToastNotification {
    id: string;        // UUID-style string for tracking
    type: 'success' | 'error' | 'info';
    message: string;
    iataCode?: string; // context for the toast copy
}


// ── Default Values ────────────────────────────────────────────────────────

const DEFAULT_SEARCH_CRITERIA: IAirportSearchCriteria = {
    iataCode: '',
    icaoCode: '',
    city: '',
    countryIsoCode: '',
};

const DEFAULT_PAGINATION: IAirportPagination = {
    pageNumber: 1,
    pageSize: 15,
    totalCount: 0,
    totalPages: 0,
};

// ── State Shape ───────────────────────────────────────────────────────────

interface AirportsState {
    // List / search
    airports: IAirportDto[];
    searchResults: IAirportDto[];
    searchCriteria: IAirportSearchCriteria;
    pagination: IAirportPagination;
    viewMode: AirportViewMode;
    loading: boolean;
    error: string | null;

    // Detail view
    activeAirport: IAirportDto | null;
    nearbyAirports: IAirportDto[];
    viewLoading: boolean;
    viewError: string | null;

    availableCountries: ICountryDto[];
    isProcessing: boolean;
    processingError: string | null;
    processingSuccess: boolean;

    allRecords: IAirportDto[];           // full spectrum including deleted nodes
    auditFilter: AuditFilter;           // 'all' | 'deleted' | 'active'
    auditSearch: string;                // instant search within the audit list
    isRestoring: boolean;               // true while reactivateAirport is in-flight
    restoringIataCode: string | null;   // which node is being restored (for per-row spinner)
    auditError: string | null;          // errors from the audit pipeline
    toastQueue: IToastNotification[];   // notifications rendered by Smart Component

}

const initialState: AirportsState = {
    airports: [],
    searchResults: [],
    searchCriteria: DEFAULT_SEARCH_CRITERIA,
    pagination: DEFAULT_PAGINATION,
    viewMode: 'list',
    loading: false,
    error: null,

    activeAirport: null,
    nearbyAirports: [],
    viewLoading: false,
    viewError: null,

    // Editor defaults
    availableCountries: [],
    isProcessing: false,
    processingError: null,
    processingSuccess: false,

    // Audit defaults
    allRecords: [],
    auditFilter: 'all',
    auditSearch: '',
    isRestoring: false,
    restoringIataCode: null,
    auditError: null,
    toastQueue: [],
};

// ── Store ─────────────────────────────────────────────────────────────────

export const AirportsStore = signalStore(
    { providedIn: 'root' },

    withState<AirportsState>(initialState),
    // ── Computed signals ─────────────────────────────────────────────────────
    withComputed(store => ({

        /** Active dataset for the master table. */
        displayedAirports: computed<IAirportDto[]>(() =>
            store.viewMode() === 'search' ? store.searchResults() : store.airports()
        ),

        /** Aggregate metrics from the full active list. */
        metrics: computed<IAirportMetrics>(() => {
            const list = store.airports();
            const countries = new Set(list.map(a => a.countryIsoCode));
            const withAlt = list.filter(a => a.altitude !== undefined && a.altitude !== null);
            const avgAlt =
                withAlt.length > 0
                    ? Math.round(withAlt.reduce((sum, a) => sum + (a.altitude ?? 0), 0) / withAlt.length)
                    : 0;

            return {
                totalActive: list.length,
                totalCountries: countries.size,
                totalContinents: Math.min(7, Math.ceil(countries.size / 10)),
                averageAltitude: avgAlt,
            };
        }),

        hasActiveSearch: computed<boolean>(() => {
            const c = store.searchCriteria();
            return !!(c.iataCode || c.icaoCode || c.city || c.countryIsoCode);
        }),

        recordCountLabel: computed<string>(() => {
            if (store.viewMode() === 'search') {
                const p = store.pagination();
                return `${store.searchResults().length} of ${p.totalCount} results`;
            }
            return `${store.airports().length} active airports`;
        }),

        nearbyAirportsSorted: computed<IAirportDto[]>(() => {
            const active = store.activeAirport();
            const nearby = store.nearbyAirports();
            if (!active) return nearby;

            return [...nearby]
                .filter(a => a.iataCode !== active.iataCode)
                .sort((a, b) => {
                    const aCity = a.city === active.city ? 0 : 1;
                    const bCity = b.city === active.city ? 0 : 1;
                    if (aCity !== bCity) return aCity - bCity;
                    return a.name.localeCompare(b.name);
                });
        }),

        /**
   * Filtered + searched audit records.
   * Runs purely from state — no side-effects.
   * 'deleted' filter shows nodes not present in the active `airports` list.
   * 'active'  filter shows nodes present in the active `airports` list.
   *
   * NOTE: The API's getAllAirportsIncludingDeleted does not return an
   * `isDeleted` flag in `IAirportDto`. We derive deletion status by
   * cross-referencing the iataCode against the active `airports` set.
   */
        filteredAuditRecords: computed<IAirportDto[]>(() => {
            const all = store.allRecords();
            const active = new Set(store.airports().map(a => a.iataCode));
            const filter = store.auditFilter();
            const query = (store.auditSearch() ?? '').toLowerCase().trim();

            let list: IAirportDto[];

            switch (filter) {
                case 'deleted':
                    list = all.filter(a => !active.has(a.iataCode));
                    break;
                case 'active':
                    list = all.filter(a => active.has(a.iataCode));
                    break;
                default: // 'all'
                    list = all;
            }

            if (!query) return list;

            return list.filter(a =>
                a.iataCode.toLowerCase().includes(query) ||
                a.icaoCode.toLowerCase().includes(query) ||
                a.name.toLowerCase().includes(query) ||
                a.city.toLowerCase().includes(query) ||
                a.countryName.toLowerCase().includes(query)
            );
        }),

        /** Quick metric: how many records in allRecords are currently deactivated. */
        deactivatedCount: computed<number>(() => {
            const active = new Set(store.airports().map(a => a.iataCode));
            return store.allRecords().filter(a => !active.has(a.iataCode)).length;
        }),

        /** Quick metric: total records in the audit log. */
        auditTotalCount: computed<number>(() => store.allRecords().length),

        /**
         * Countries sorted alphabetically for the dropdown.
         * Continent is included as a grouping label in the form.
         */
        countriesSorted: computed<ICountryDto[]>(() =>
            [...store.availableCountries()].sort((a, b) => a.name.localeCompare(b.name))
        ),
    })),





    // ── Methods ───────────────────────────────────────────────────────────────
    withMethods((
        store,
        airportsService = inject(AirportsService),
        countriesService = inject(CountriesService),
    ) => ({

        // ══════════════════════════════════════════════════════════════════════════
        // LIST / SEARCH METHODS
        // ══════════════════════════════════════════════════════════════════════════

        loadAllActive: rxMethod<void>(
            pipe(
                tap(() => patchState(store, { loading: true, error: null })),
                switchMap(() =>
                    airportsService.getAllActiveAirports().pipe(
                        tapResponse({
                            next: (airports: IAirportDto[]) =>
                                patchState(store, { airports, viewMode: 'list', loading: false }),
                            error: (err: any) =>
                                patchState(store, {
                                    loading: false,
                                    error: err?.message ?? 'Failed to load airports.',
                                }),
                        })
                    )
                )
            )
        ),

        performSearch: rxMethod<{ criteria: IAirportSearchCriteria; page?: number }>(
            pipe(
                debounceTime(250),
                tap(({ criteria, page }) =>
                    patchState(store, {
                        loading: true,
                        error: null,
                        searchCriteria: criteria,
                        viewMode: 'search',
                        pagination: { ...store.pagination(), pageNumber: page ?? 1 },
                    })
                ),
                switchMap(({ criteria, page }) => {
                    const filter: IAirportFilterDto = {
                        city: criteria.city || undefined,
                        countryIsoCode: criteria.countryIsoCode || undefined,
                    };
                    return airportsService
                        .searchAirports(filter, page ?? 1, store.pagination().pageSize)
                        .pipe(
                            tapResponse({
                                next: result =>
                                    patchState(store, {
                                        searchResults: result.items ?? [],
                                        pagination: {
                                            pageNumber: result.pageNumber,
                                            pageSize: result.pageSize,
                                            totalCount: result.totalCount,
                                            totalPages: result.totalPages,
                                        },
                                        loading: false,
                                    }),
                                error: (err: any) =>
                                    patchState(store, {
                                        loading: false,
                                        error: err?.message ?? 'Search failed.',
                                    }),
                            })
                        );
                })
            )
        ),

        clearSearch(): void {
            patchState(store, {
                searchResults: [],
                searchCriteria: DEFAULT_SEARCH_CRITERIA,
                pagination: DEFAULT_PAGINATION,
                viewMode: 'list',
            });
        },

        optimisticRemove(iataCode: string): IAirportDto[] {
            const prev = store.airports();
            patchState(store, {
                airports: prev.filter(a => a.iataCode !== iataCode),
                searchResults: store.searchResults().filter(a => a.iataCode !== iataCode),
            });
            return prev;
        },

        rollbackRemove(prev: IAirportDto[]): void {
            patchState(store, { airports: prev });
        },

        updateStoreAfterAction(updated: IAirportDto): void {
            patchState(store, {
                airports: store.airports().map(a =>
                    a.iataCode === updated.iataCode ? updated : a
                ),
                searchResults: store.searchResults().map(a =>
                    a.iataCode === updated.iataCode ? updated : a
                ),
            });
        },

        goToPage(page: number): void {
            patchState(store, { pagination: { ...store.pagination(), pageNumber: page } });
        },

        setError(message: string | null): void {
            patchState(store, { error: message });
        },

        // ══════════════════════════════════════════════════════════════════════════
        // DETAIL VIEW METHODS
        // ══════════════════════════════════════════════════════════════════════════

        loadAirportDeepDetails: rxMethod<string>(
            pipe(
                tap(() =>
                    patchState(store, {
                        viewLoading: true,
                        viewError: null,
                        activeAirport: null,
                        nearbyAirports: [],
                    })
                ),
                switchMap(iataCode =>
                    airportsService.getAirportByIataCode(iataCode).pipe(
                        tapResponse({
                            next: (airport: IAirportDto) => {
                                patchState(store, { activeAirport: airport });
                            },
                            error: (err: any) => {
                                patchState(store, {
                                    viewLoading: false,
                                    viewError:
                                        err?.status === 404
                                            ? `Airport "${iataCode}" was not found.`
                                            : (err?.message ?? 'Failed to load airport details.'),
                                });
                            },
                        })
                    )
                ),
                switchMap(() => {
                    const airport = store.activeAirport();
                    if (!airport) return of({ city: [] as IAirportDto[], country: [] as IAirportDto[] });

                    return forkJoin({
                        city: airportsService.getAirportsByCity(airport.city).pipe(catchError(() => of([] as IAirportDto[]))),
                        country: airportsService.getAirportsByCountry(airport.countryIsoCode).pipe(catchError(() => of([] as IAirportDto[]))),
                    });
                }),
                tapResponse({
                    next: ({ city, country }) => {
                        const seen = new Set<string>();
                        const merged: IAirportDto[] = [];
                        for (const a of [...city, ...country]) {
                            if (!seen.has(a.iataCode)) {
                                seen.add(a.iataCode);
                                merged.push(a);
                            }
                        }
                        patchState(store, { nearbyAirports: merged, viewLoading: false });
                    },
                    error: () => patchState(store, { viewLoading: false }),
                })
            )
        ),

        clearActiveAirport(): void {
            patchState(store, {
                activeAirport: null,
                nearbyAirports: [],
                viewLoading: false,
                viewError: null,
            });
        },

        deactivateActiveAirport(): IAirportDto[] {
            const iataCode = store.activeAirport()?.iataCode ?? '';
            const prev = store.airports();
            patchState(store, {
                airports: prev.filter(a => a.iataCode !== iataCode),
                searchResults: store.searchResults().filter(a => a.iataCode !== iataCode),
            });
            return prev;
        },

        reactivateAirport: rxMethod<string>(
            pipe(
                tap(() => patchState(store, { viewLoading: true, viewError: null })),
                switchMap(iataCode =>
                    airportsService.reactivateAirport(iataCode).pipe(
                        tapResponse({
                            next: () => patchState(store, { viewLoading: false }),
                            error: (err: any) =>
                                patchState(store, {
                                    viewLoading: false,
                                    viewError: err?.message ?? 'Failed to reactivate airport.',
                                }),
                        })
                    )
                )
            )
        ),

        setViewError(message: string | null): void {
            patchState(store, { viewError: message });
        },

        // ══════════════════════════════════════════════════════════════════════════
        // EDITOR METHODS — NEW v3
        // ══════════════════════════════════════════════════════════════════════════

        /**
         * Load all active countries for the Country Selection dropdown.
         * Runs when the editor page initializes (both Create and Edit mode).
         */
        loadSelectionData: rxMethod<void>(
            pipe(
                tap(() => patchState(store, { isProcessing: false, processingError: null })),
                switchMap(() =>
                    countriesService.getAllActiveCountries().pipe(
                        tapResponse({
                            next: (countries: ICountryDto[]) =>
                                patchState(store, { availableCountries: countries }),
                            error: (err: any) =>
                                patchState(store, {
                                    processingError: err?.message ?? 'Failed to load countries for selection.',
                                }),
                        })
                    )
                )
            )
        ),


        saveAirport(payload: IAirportSavePayload): Promise<AirportSaveResult> {
            patchState(store, {
                isProcessing: true,
                processingError: null,
                processingSuccess: false,
            });

            const call$ =
                payload.mode === 'create'
                    ? airportsService.createAirport(payload.data as ICreateAirportDto)
                    : airportsService.updateAirport(
                        payload.iataCode!,
                        payload.data as IUpdateAirportDto
                    );

            return new Promise(resolve => {
                call$
                    .pipe(
                        catchError(err => {
                            const msg = _extractApiError(err, `Failed to ${payload.mode} airport.`);
                            patchState(store, { isProcessing: false, processingError: msg });
                            resolve({ success: false, error: msg });
                            return of(null as unknown as IAirportDto);
                        })
                    )
                    .subscribe(airport => {
                        if (!airport) return; // catchError already resolved

                        if (payload.mode === 'create') {
                            patchState(store, {
                                airports: [airport, ...store.airports()],
                            });
                        } else {
                            patchState(store, {
                                airports: store
                                    .airports()
                                    .map(a => (a.iataCode === airport.iataCode ? airport : a)),
                                searchResults: store
                                    .searchResults()
                                    .map(a => (a.iataCode === airport.iataCode ? airport : a)),
                                activeAirport:
                                    store.activeAirport()?.iataCode === airport.iataCode
                                        ? airport
                                        : store.activeAirport(),
                            });
                        }

                        patchState(store, { isProcessing: false, processingSuccess: true });
                        resolve({ success: true, airport });
                    });
            });
        },

        /**
         * Delete (deactivate) an airport from the editor page.
         * Uses optimistic removal: removes from lists immediately, rolls back on failure.
         * Returns a Promise so the Smart Component can await and navigate.
         */
        removeAirport(iataCode: string): Promise<{ success: boolean; error?: string }> {
            patchState(store, {
                isProcessing: true,
                processingError: null,
            });

            const prev = store.airports();
            // Optimistic remove from both caches
            patchState(store, {
                airports: prev.filter(a => a.iataCode !== iataCode),
                searchResults: store.searchResults().filter(a => a.iataCode !== iataCode),
            });

            return new Promise(resolve => {
                airportsService
                    .deleteAirport(iataCode)
                    .pipe(
                        catchError(err => {
                            const msg = _extractApiError(err, `Failed to deactivate ${iataCode}.`);
                            // Rollback
                            patchState(store, {
                                airports: prev,
                                isProcessing: false,
                                processingError: msg,
                            });
                            resolve({ success: false, error: msg });
                            return of(undefined);
                        })
                    )
                    .subscribe(result => {
                        if (result === undefined && store.processingError()) return; // catchError path
                        patchState(store, { isProcessing: false });
                        resolve({ success: true });
                    });
            });
        },


        /**
             * Fetch the complete airport registry including all soft-deleted nodes.
             * Populates `allRecords` for the audit table.
             * Also refreshes `airports` (active list) so the deleted-status derivation
             * in `filteredAuditRecords` is always accurate.
             */
        fetchFullAuditLog: rxMethod<void>(
            pipe(
                tap(() => patchState(store, { loading: true, auditError: null })),
                switchMap(() =>
                    forkJoin({
                        all: airportsService.getAllAirportsIncludingDeleted().pipe(catchError(() => of([]))),
                        active: airportsService.getAllActiveAirports().pipe(catchError(() => of([]))),
                    }).pipe(
                        tapResponse({
                            next: ({ all, active }) =>
                                patchState(store, {
                                    allRecords: all,
                                    airports: active,
                                    loading: false,
                                }),
                            error: (err: any) =>
                                patchState(store, {
                                    loading: false,
                                    auditError: err?.message ?? 'Failed to load audit log.',
                                }),
                        })
                    )
                )
            )
        ),

        /**
         * Restore (reactivate) a deactivated airport.
         *
         * Strategy:
         *  1. Optimistically move the record from "deleted" to "active" in the
         *     store's `airports` list so the audit table immediately shows it
         *     as active — instant UI feedback.
         *  2. Call the API.
         *  3. On success: push a success toast, refresh both lists.
         *  4. On failure: roll back the optimistic add, push an error toast.
         */
        restoreHub: rxMethod<string>(
            pipe(
                tap((iataCode: string) => {
                    patchState(store, {
                        isRestoring: true,
                        restoringIataCode: iataCode,
                        auditError: null,
                    });

                    // Optimistic: add back to the active airports list
                    const record = store.allRecords().find(a => a.iataCode === iataCode);
                    if (record && !store.airports().some(a => a.iataCode === iataCode)) {
                        patchState(store, { airports: [...store.airports(), record] });
                    }
                }),
                switchMap((iataCode: string) =>
                    airportsService.reactivateAirport(iataCode).pipe(
                        tapResponse({
                            next: () => {
                                patchState(store, {
                                    isRestoring: false,
                                    restoringIataCode: null,
                                    toastQueue: [
                                        ...store.toastQueue(),
                                        {
                                            id: _genId(),
                                            type: 'success' as const,
                                            message: `Airport ${iataCode} has been restored to the network.`,
                                            iataCode,
                                        },
                                    ],
                                });
                            },
                            error: (err: any) => {
                                // Rollback: remove the optimistically added record
                                patchState(store, {
                                    airports: store.airports().filter(a => a.iataCode !== iataCode),
                                    isRestoring: false,
                                    restoringIataCode: null,
                                    auditError: err?.message ?? `Failed to restore ${iataCode}.`,
                                    toastQueue: [
                                        ...store.toastQueue(),
                                        {
                                            id: _genId(),
                                            type: 'error' as const,
                                            message: `Failed to restore ${iataCode}. Please try again.`,
                                            iataCode,
                                        },
                                    ],
                                });
                            },
                        })
                    )
                )
            )
        ),

        /** Set the audit filter (all / deleted / active). */
        setAuditFilter(filter: AuditFilter): void {
            patchState(store, { auditFilter: filter });
        },

        /** Set the instant search query for the audit list. */
        setAuditSearch(query: string): void {
            patchState(store, { auditSearch: query });
        },

        /** Reset all audit view state when navigating away. */
        clearAuditView(): void {
            patchState(store, {
                allRecords: [],
                auditFilter: 'all',
                auditSearch: '',
                isRestoring: false,
                restoringIataCode: null,
                auditError: null,
            });
        },

        /** Remove a toast from the queue after it has been displayed/dismissed. */
        dismissToast(id: string): void {
            patchState(store, {
                toastQueue: store.toastQueue().filter(t => t.id !== id),
            });
        },

        /** Clear editor-level error (e.g., on form reopen). */
        clearProcessingError(): void {
            patchState(store, { processingError: null, processingSuccess: false });
        },
    }))
);

// ── Private helpers ────────────────────────────────────────────────────────

function _extractApiError(err: unknown, fallback: string): string {
    const e = err as Record<string, unknown>;
    const errorBody = e?.['error'] as Record<string, unknown> | undefined;

    if (errorBody?.['errors'] && typeof errorBody['errors'] === 'object') {
        return Object.entries(errorBody['errors'] as Record<string, string | string[]>)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' · ');
    }

    return (
        (errorBody?.['message'] as string) ??
        (e?.['message'] as string) ??
        fallback
    );
}

// Helper — generate a simple unique ID
function _genId(): string {
    return Math.random().toString(36).slice(2, 10);
}