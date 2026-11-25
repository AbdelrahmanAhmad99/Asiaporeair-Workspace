
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

import { RoutesService } from '@shared-core';
import { IRouteDto, IRouteDetailDto, IRouteFilterDto } from '@shared-core';
// Update the routes model import:
import {
    IRouteOperatorDto, IAssignOperatorDto, IUpdateOperatorDto,
} from '@shared-core';
import { AirportsService } from '@shared-core';
import { IAirportDto } from '@shared-core';
// Add new service & model imports:
import { AirlinesService } from '@shared-core';
import { IAirlineDto } from '@shared-core';

// ── Supporting Shapes ─────────────────────────────────────────────────────

export interface IRouteSearchCriteria {
    originIata: string;
    destinationIata: string;
    isActive: boolean | null; // null = all statuses
}

export interface IRoutePagination {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface IRouteStatistics {
    totalRoutes: number;
    activeRoutes: number;
    uniqueHubs: number;
    totalKm: number;
}


export type AuditViewFilter = 'all' | 'inactive';

// ── Default Values ────────────────────────────────────────────────────────

const DEFAULT_CRITERIA: IRouteSearchCriteria = {
    originIata: '',
    destinationIata: '',
    isActive: null,
};

const DEFAULT_PAGINATION: IRoutePagination = {
    pageNumber: 1,
    pageSize: 15,
    totalCount: 0,
    totalPages: 0,
};

// ── State ─────────────────────────────────────────────────────────────────

interface RoutesState {
    routes: IRouteDto[];
    searchCriteria: IRouteSearchCriteria;
    pagination: IRoutePagination;
    loading: boolean;
    error: string | null;

    // Analysis view
    selectedRoute: IRouteDetailDto | null;
    originRelatedRoutes: IRouteDto[];
    destinationRelatedRoutes: IRouteDto[];
    analysisLoading: boolean;
    analysisError: string | null;

    selectedRouteOperators: IRouteOperatorDto[];
    availableAirlines: IAirlineDto[];
    isProcessing: boolean;
    opErrorMessage: string | null;
    opSuccessMessage: string | null;
    operatorsLoading: boolean;
    airlinesLoading: boolean;


    // Route Composer view
    activeAirports: IAirportDto[];
    airportsLoading: boolean;
    isSaving: boolean;
    composerError: string | null;
    savedRoute: IRouteDto | null;   // one-shot: last saved result for navigation


    // Route Recovery Center
    archivedRoutes: IRouteDto[];
    recoveryLoading: boolean;
    auditError: string | null;
    auditSearch: string;         // instant search within archived list
    auditFilter: AuditViewFilter; // 'all' | 'inactive'
}

const initialState: RoutesState = {
    routes: [],
    searchCriteria: DEFAULT_CRITERIA,
    pagination: DEFAULT_PAGINATION,
    loading: false,
    error: null,
    selectedRoute: null,
    originRelatedRoutes: [],
    destinationRelatedRoutes: [],
    analysisLoading: false,
    analysisError: null,
    selectedRouteOperators: [],
    availableAirlines: [],
    isProcessing: false,
    opErrorMessage: null,
    opSuccessMessage: null,
    operatorsLoading: false,
    airlinesLoading: false,
    activeAirports: [],
    airportsLoading: false,
    isSaving: false,
    composerError: null,
    savedRoute: null,

    // Route Recovery Center
    archivedRoutes: [],
    recoveryLoading: false,
    auditError: null,
    auditSearch: '',
    auditFilter: 'inactive',
};

// ── Store ─────────────────────────────────────────────────────────────────

export const RoutesStore = signalStore(
    { providedIn: 'root' },

    withState<RoutesState>(initialState),

    // ── Computed signals ─────────────────────────────────────────────────────
    withComputed(store => ({

        /** Aggregate metrics for the 3 executive stat widgets. */
        statistics: computed<IRouteStatistics>(() => {
            const list = store.routes();
            const hubs = new Set<string>();
            let km = 0;

            for (const r of list) {
                hubs.add(r.originAirportIataCode);
                hubs.add(r.destinationAirportIataCode);
                km += r.distanceKm;
            }

            return {
                totalRoutes: store.pagination().totalCount || list.length,
                activeRoutes: list.filter(r => r.isActive).length,
                uniqueHubs: hubs.size,
                totalKm: Math.round(km),
            };
        }),

        /** True when any search criterion has a value. */
        hasActiveFilter: computed<boolean>(() => {
            const c = store.searchCriteria();
            return !!(c.originIata || c.destinationIata || c.isActive !== null);
        }),

        /** Human-readable count label for the grid footer. */
        recordLabel: computed<string>(() => {
            const p = store.pagination();
            if (p.totalCount > 0) {
                return `Page ${p.pageNumber} of ${p.totalPages} · ${p.totalCount} route${p.totalCount !== 1 ? 's' : ''}`;
            }
            return `${store.routes().length} routes found`;
        }),

        /** Pagination: can go to previous page. */
        canGoPrev: computed<boolean>(() => store.pagination().pageNumber > 1),

        /** Pagination: can go to next page. */
        canGoNext: computed<boolean>(() => {
            const p = store.pagination();
            return p.pageNumber < p.totalPages;
        }),

        /**
    * Estimated flight time for the selected route.
    * Uses the standard aviation planning figure of 900 km/h cruise speed.
    * Returns a formatted string like "3h 25m" or null when no route is selected.
    */
        estimatedFlightTime: computed<string | null>(() => {
            const r = store.selectedRoute();
            if (!r) return null;
            const hours = r.distanceKm / 900;
            const h = Math.floor(hours);
            const m = Math.round((hours - h) * 60);
            return `${h}h ${m.toString().padStart(2, '0')}m`;
        }),

        /** Distance in nautical miles for the selected route. */
        distanceNm: computed<number | null>(() => {
            const r = store.selectedRoute();
            if (!r) return null;
            return Math.round(r.distanceKm * 0.53996);
        }),

        /**
         * Number of codeshare operators on the selected route.
         */
        codeshareCount: computed<number>(() =>
            store.selectedRoute()?.operators.filter(o => o.isCodeshare).length ?? 0
        ),

        /**
         * All related routes (union of origin + destination alternatives),
         * deduplicated and excluding the selected route itself.
         */
        allRelatedRoutes: computed<IRouteDto[]>(() => {
            const current = store.selectedRoute();
            const seen = new Set<number>();
            const merged: IRouteDto[] = [];

            for (const r of [
                ...store.originRelatedRoutes(),
                ...store.destinationRelatedRoutes(),
            ]) {
                if (!seen.has(r.routeId) && r.routeId !== current?.routeId) {
                    seen.add(r.routeId);
                    merged.push(r);
                }
            }

            return merged;
        }),

        assignedIataCodes: computed<Set<string>>(
            () => new Set(store.selectedRouteOperators().map(o => o.airlineIataCode))
        ),

        unassignedAirlines: computed<IAirlineDto[]>(() => {
            const assigned = new Set(store.selectedRouteOperators().map(o => o.airlineIataCode));
            return store.availableAirlines().filter(a => !assigned.has(a.iataCode));
        }),

        activeOperatorCount: computed<number>(
            () => store.selectedRouteOperators().filter(o => o.isActive).length
        ),

        codeshareOperatorCount: computed<number>(
            () => store.selectedRouteOperators().filter(o => o.isCodeshare).length
        ),

        /** Airports sorted by name for the hub selection dropdowns. */
        sortedAirports: computed<IAirportDto[]>(() =>
            [...store.activeAirports()].sort((a, b) => a.name.localeCompare(b.name))
        ),

        /** Quick IATA-keyed lookup map for validation and display enrichment. */
        airportMap: computed<Map<string, IAirportDto>>(() =>
            new Map(store.activeAirports().map(a => [a.iataCode, a]))
        ),


        /**
     * Filtered & instant-searched archived routes.
     * Matches on IATA codes, airport names, or city names.
     */
        filteredArchivedRoutes: computed<IRouteDto[]>(() => {
            const q = (store.auditSearch() ?? '').toLowerCase().trim();
            const all = store.archivedRoutes();

            if (!q) return all;

            return all.filter(r =>
                r.originAirportIataCode.toLowerCase().includes(q) ||
                r.destinationAirportIataCode.toLowerCase().includes(q) ||
                r.originAirportName.toLowerCase().includes(q) ||
                r.destinationAirportName.toLowerCase().includes(q) ||
                r.originCity.toLowerCase().includes(q) ||
                r.destinationCity.toLowerCase().includes(q)
            );
        }),

        /** Count of deactivated routes for the audit center badge. */
        archivedCount: computed<number>(() => store.archivedRoutes().length),

    })),

    // ── Methods ───────────────────────────────────────────────────────────────
    withMethods((store,
        routesService = inject(RoutesService),
        airlinesService = inject(AirlinesService),
        airportsService = inject(AirportsService),
    ) => ({
        /**
         * Search routes using the current criteria and page index.
         * 300ms debounce + distinctUntilChanged on the serialised criteria
         * prevents redundant API calls during rapid input.
         */
        performSearch: rxMethod<{ criteria: IRouteSearchCriteria; page?: number }>(
            pipe(
                debounceTime(300),
                distinctUntilChanged(
                    (a, b) => JSON.stringify(a) === JSON.stringify(b)
                ),
                tap(({ criteria, page }) =>
                    patchState(store, {
                        loading: true,
                        error: null,
                        searchCriteria: criteria,
                        pagination: {
                            ...store.pagination(),
                            pageNumber: page ?? 1,
                        },
                    })
                ),
                switchMap(({ criteria, page }) => {
                    const filter: IRouteFilterDto = {
                        originIata: criteria.originIata || undefined,
                        destinationIata: criteria.destinationIata || undefined,
                        isActive: criteria.isActive ?? undefined,
                    };

                    return routesService
                        .searchRoutes(filter, page ?? 1, store.pagination().pageSize)
                        .pipe(
                            tapResponse({
                                next: result =>
                                    patchState(store, {
                                        routes: result.items ?? [],
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
                                        error: _routeError(err, 'Failed to retrieve route network.'),
                                    }),
                            })
                        );
                })
            )
        ),

        /** Reset all search criteria and reload with default (open) query. */
        resetSearch(): void {
            patchState(store, {
                searchCriteria: DEFAULT_CRITERIA,
                pagination: DEFAULT_PAGINATION,
            });
        },

        /** Navigate to a different page in the current search result set. */
        updatePagination(newPageIndex: number): void {
            patchState(store, {
                pagination: { ...store.pagination(), pageNumber: newPageIndex },
            });
        },

        /**
         * Remove a route with optimistic UI.
         *
         * Strategy:
         *  1. Snapshot current list.
         *  2. Remove from display immediately.
         *  3. Call API.
         *  4. On failure: roll back + set error.
         *
         * Returns Promise<{ success: boolean; error?: string }> so the Smart
         * Component can show a toast without subscribing manually.
         */
        removeRoute(routeId: number): Promise<{ success: boolean; error?: string }> {
            const prev = store.routes();
            const prevPagn = store.pagination();

            patchState(store, {
                routes: prev.filter(r => r.routeId !== routeId),
                loading: true,
                error: null,
                pagination: {
                    ...prevPagn,
                    totalCount: Math.max(0, prevPagn.totalCount - 1),
                },
            });

            return new Promise(resolve => {
                routesService.deleteRoute(routeId).pipe(
                    catchError(err => {
                        const msg = _routeError(err, `Failed to deactivate route #${routeId}.`);
                        patchState(store, {
                            routes: prev,
                            pagination: prevPagn,
                            loading: false,
                            error: msg,
                        });
                        resolve({ success: false, error: msg });
                        return of(undefined);
                    })
                ).subscribe(result => {
                    if (result === undefined && store.error()) return;
                    patchState(store, { loading: false });
                    resolve({ success: true });
                });
            });
        },

        /**
         * Update a single route in the cache after an edit (called by the
         * Composer page on save). This avoids a full re-fetch.
         */
        updateRouteInCache(updated: IRouteDto): void {
            patchState(store, {
                routes: store.routes().map(r =>
                    r.routeId === updated.routeId ? updated : r
                ),
            });
        },

        /**
         * Prepend a newly created route to the top of the current list.
         * Increments totalCount for accurate footer reporting.
         */
        prependRoute(route: IRouteDto): void {
            patchState(store, {
                routes: [route, ...store.routes()],
                pagination: {
                    ...store.pagination(),
                    totalCount: store.pagination().totalCount + 1,
                },
            });
        },

        /** Dismiss the current error banner. */
        clearError(): void {
            patchState(store, { error: null });
        },


        // ══════════════════════════════════════════════════════════════════════════
        // ANALYSIS VIEW METHODS
        // ══════════════════════════════════════════════════════════════════════════

        loadRouteDeepAnalysis: rxMethod<number>(
            pipe(
                tap(() =>
                    patchState(store, {
                        analysisLoading: true,
                        analysisError: null,
                        selectedRoute: null,
                        originRelatedRoutes: [],
                        destinationRelatedRoutes: [],
                    })
                ),
                switchMap((routeId: number) =>
                    routesService.getRouteWithOperators(routeId).pipe(
                        tapResponse({
                            next: (route) => {
                                patchState(store, { selectedRoute: route });
                            },
                            error: (err: unknown) => {
                                patchState(store, {
                                    analysisLoading: false,
                                    analysisError:
                                        (err as { status?: number })?.status === 404
                                            ? `Route #${routeId} was not found in the network registry.`
                                            : ((err as Error)?.message ??
                                                'Failed to load route details.'),
                                });
                            },
                        })
                    )
                ),
                // Stage 2: once selectedRoute is set, fetch related corridors
                switchMap(() => {
                    const route = store.selectedRoute();
                    if (!route) return of({ origin: [] as IRouteDto[], destination: [] as IRouteDto[] });

                    return forkJoin({
                        origin: routesService
                            .getActiveRoutesByOrigin(route.originAirportIataCode)
                            .pipe(catchError(() => of([] as IRouteDto[]))),
                        destination: routesService
                            .getActiveRoutesByDestination(route.destinationAirportIataCode)
                            .pipe(catchError(() => of([] as IRouteDto[]))),
                    });
                }),
                tapResponse({
                    next: ({ origin, destination }) =>
                        patchState(store, {
                            originRelatedRoutes: origin,
                            destinationRelatedRoutes: destination,
                            analysisLoading: false,
                        }),
                    error: () =>
                        patchState(store, { analysisLoading: false }),
                })
            )
        ),

        /**
         * Clear all analysis state when navigating away.
         * Prevents stale data on re-entry to a different route.
         */
        clearAnalysis(): void {
            patchState(store, {
                selectedRoute: null,
                originRelatedRoutes: [],
                destinationRelatedRoutes: [],
                analysisLoading: false,
                analysisError: null,
            });
        },

        /** Set a transient analysis-level error. */
        setAnalysisError(message: string | null): void {
            patchState(store, { analysisError: message });
        },

        // ══════════════════════════════════════════════════════════════════════════
        // OPERATOR CONTROL METHODS
        // ══════════════════════════════════════════════════════════════════════════

        loadRouteOperators: rxMethod<number>(
            pipe(
                tap(() =>
                    patchState(store, {
                        operatorsLoading: true,
                        opErrorMessage: null,
                        selectedRouteOperators: [],
                    })
                ),
                switchMap((routeId: number) =>
                    routesService.getRouteWithOperators(routeId).pipe(
                        tapResponse({
                            next: (detail) => patchState(store, {
                                selectedRouteOperators: detail.operators,
                                operatorsLoading: false,
                            }),
                            error: (err: unknown) => patchState(store, {
                                operatorsLoading: false,
                                opErrorMessage: _opError(err, 'Failed to load route operators.'),
                            }),
                        })
                    )
                )
            )
        ),

        loadActiveAirlines: rxMethod<void>(
            pipe(
                tap(() => {
                    if (store.availableAirlines().length > 0) return;
                    patchState(store, { airlinesLoading: true });
                }),
                switchMap(() => {
                    if (store.availableAirlines().length > 0) return of(null);
                    return airlinesService.getAllActiveAirlines().pipe(
                        tapResponse({
                            next: (airlines) => patchState(store, {
                                availableAirlines: airlines,
                                airlinesLoading: false,
                            }),
                            error: (err: unknown) => patchState(store, {
                                airlinesLoading: false,
                                opErrorMessage: _opError(err, 'Failed to load available airlines.'),
                            }),
                        })
                    );
                })
            )
        ),

        assignOperator(dto: IAssignOperatorDto): Promise<{ success: boolean; error?: string }> {
            patchState(store, { isProcessing: true, opErrorMessage: null, opSuccessMessage: null });

            return new Promise(resolve => {
                routesService.assignOperatorToRoute(dto).pipe(
                    catchError(err => {
                        const msg = _opError(err, `Failed to assign ${dto.airlineIataCode} to route #${dto.routeId}.`);
                        patchState(store, { isProcessing: false, opErrorMessage: msg });
                        resolve({ success: false, error: msg });
                        return of(null as unknown as IRouteOperatorDto);
                    })
                ).subscribe(op => {
                    if (!op) return;
                    patchState(store, {
                        selectedRouteOperators: [op, ...store.selectedRouteOperators()],
                        isProcessing: false,
                        opSuccessMessage: `${dto.airlineIataCode} has been assigned as a corridor operator.`,
                    });
                    resolve({ success: true });
                });
            });
        },

        updateOperator(
            routeId: number,
            airlineIataCode: string,
            dto: IUpdateOperatorDto
        ): Promise<{ success: boolean; error?: string }> {
            patchState(store, { isProcessing: true, opErrorMessage: null, opSuccessMessage: null });

            return new Promise(resolve => {
                routesService.updateOperatorOnRoute(routeId, airlineIataCode, dto).pipe(
                    catchError(err => {
                        const msg = _opError(err, `Failed to update operator ${airlineIataCode}.`);
                        patchState(store, { isProcessing: false, opErrorMessage: msg });
                        resolve({ success: false, error: msg });
                        return of(null as unknown as IRouteOperatorDto);
                    })
                ).subscribe(updated => {
                    if (!updated) return;
                    patchState(store, {
                        selectedRouteOperators: store.selectedRouteOperators().map(o =>
                            o.airlineIataCode === updated.airlineIataCode ? updated : o
                        ),
                        isProcessing: false,
                        opSuccessMessage: `${airlineIataCode} operator parameters updated.`,
                    });
                    resolve({ success: true });
                });
            });
        },

        revokeOperator(
            routeId: number,
            airlineIataCode: string
        ): Promise<{ success: boolean; error?: string }> {
            const prev = store.selectedRouteOperators();

            patchState(store, {
                selectedRouteOperators: prev.filter(o => o.airlineIataCode !== airlineIataCode),
                isProcessing: true,
                opErrorMessage: null,
                opSuccessMessage: null,
            });

            return new Promise(resolve => {
                routesService.removeOperatorFromRoute(routeId, airlineIataCode).pipe(
                    catchError(err => {
                        const msg = _opError(err, `Failed to revoke ${airlineIataCode} from route #${routeId}.`);
                        patchState(store, {
                            selectedRouteOperators: prev,
                            isProcessing: false,
                            opErrorMessage: msg,
                        });
                        resolve({ success: false, error: msg });
                        return of(undefined);
                    })
                ).subscribe(result => {
                    if (result === undefined && store.opErrorMessage()) return;
                    patchState(store, {
                        isProcessing: false,
                        opSuccessMessage: `${airlineIataCode} operator rights have been revoked from this corridor.`,
                    });
                    resolve({ success: true });
                });
            });
        },

        clearOpError(): void { patchState(store, { opErrorMessage: null }); },
        clearOpSuccess(): void { patchState(store, { opSuccessMessage: null }); },

        clearOperatorControl(): void {
            patchState(store, {
                selectedRouteOperators: [],
                isProcessing: false,
                opErrorMessage: null,
                opSuccessMessage: null,
                operatorsLoading: false,
            });
        },



        /**
     * Load the active airport registry for origin / destination selection.
     *
     * Guard: short-circuits if the list is already populated (cached across
     * composer open/close cycles within the same session).
     * Uses isolated `airportsLoading` flag — never affects the explorer grid.
     */
        loadAirportRegistry: rxMethod<void>(
            pipe(
                tap(() => {
                    if (store.activeAirports().length > 0) return;
                    patchState(store, { airportsLoading: true });
                }),
                switchMap(() => {
                    if (store.activeAirports().length > 0) return of(null);

                    return airportsService.getAllActiveAirports().pipe(
                        tapResponse({
                            next: (airports) => patchState(store, {
                                activeAirports: airports,
                                airportsLoading: false,
                            }),
                            error: (err: unknown) => patchState(store, {
                                airportsLoading: false,
                                composerError: _composerError(err, 'Failed to load airport registry.'),
                            }),
                        })
                    );
                })
            )
        ),


        saveRoute(
            data: {
                originAirportIataCode: string;
                destinationAirportIataCode: string;
                distanceKm: number;
            },
            routeId?: number | null
        ): Promise<{ success: boolean; routeId?: number; error?: string }> {
            patchState(store, { isSaving: true, composerError: null, savedRoute: null });

            const isEdit = !!routeId && routeId > 0;

            const call$ = isEdit
                ? routesService.updateRoute(routeId!, { distanceKm: data.distanceKm })
                : routesService.createRoute({
                    originAirportIataCode: data.originAirportIataCode,
                    destinationAirportIataCode: data.destinationAirportIataCode,
                    distanceKm: data.distanceKm,
                });

            return new Promise(resolve => {
                call$.pipe(
                    catchError(err => {
                        const msg = _composerError(err, `Failed to ${isEdit ? 'update' : 'create'} route.`);
                        patchState(store, { isSaving: false, composerError: msg });
                        resolve({ success: false, error: msg });
                        return of(null as unknown as IRouteDto);
                    })
                ).subscribe(route => {
                    if (!route) return; // catchError path

                    if (isEdit) {
                        patchState(store, {
                            routes: store.routes().map(r => r.routeId === route.routeId ? route : r),
                            isSaving: false,
                            savedRoute: route,
                        });
                    } else {
                        patchState(store, {
                            routes: [route, ...store.routes()],
                            pagination: {
                                ...store.pagination(),
                                totalCount: store.pagination().totalCount + 1,
                            },
                            isSaving: false,
                            savedRoute: route,
                        });
                    }

                    resolve({ success: true, routeId: route.routeId });
                });
            });
        },

        /** Clear the composer error banner (called when user edits the form again). */
        clearComposerError(): void {
            patchState(store, { composerError: null });
        },

        /** Clear one-shot savedRoute reference once navigation has occurred. */
        clearSavedRoute(): void {
            patchState(store, { savedRoute: null });
        },

        /** Full composer reset on navigate-away. */
        clearComposerState(): void {
            patchState(store, {
                isSaving: false,
                composerError: null,
                savedRoute: null,
            });
            // Note: activeAirports and airportsLoading are intentionally NOT reset
            // so the airport list remains cached for the next composer open.
        },


        // ══════════════════════════════════════════════════════════════════════════
        // ROUTE RECOVERY CENTER METHODS
        // ══════════════════════════════════════════════════════════════════════════

        loadArchivedRoutes: rxMethod<void>(
            pipe(
                tap(() =>
                    patchState(store, {
                        recoveryLoading: true,
                        auditError: null,
                        archivedRoutes: [],
                    })
                ),
                switchMap(() =>
                    routesService.searchRoutes({ isActive: false }, 1, 500).pipe(
                        tapResponse({
                            next: result =>
                                patchState(store, {
                                    archivedRoutes: (result.items ?? []).sort((a, b) => b.routeId - a.routeId),
                                    recoveryLoading: false,
                                }),
                            error: (err: unknown) =>
                                patchState(store, {
                                    recoveryLoading: false,
                                    auditError: _auditError(err, 'Failed to load archived corridors.'),
                                }),
                        })
                    )
                )
            )
        ),

        restoreRoute(routeId: number): Promise<{ success: boolean; routeId: number; error?: string }> {
            const prevArchived = store.archivedRoutes();
            const target = prevArchived.find(r => r.routeId === routeId);

            // Optimistic remove from archived list
            patchState(store, {
                archivedRoutes: prevArchived.filter(r => r.routeId !== routeId),
                recoveryLoading: true,
                auditError: null,
            });

            return new Promise(resolve => {
                routesService.reactivateRoute(routeId).pipe(
                    catchError(err => {
                        const msg = _auditError(err, `Failed to restore corridor #${routeId}.`);
                        // Full rollback
                        patchState(store, {
                            archivedRoutes: prevArchived,
                            recoveryLoading: false,
                            auditError: msg,
                        });
                        resolve({ success: false, routeId, error: msg });
                        return of(undefined);
                    })
                ).subscribe(result => {
                    if (result === undefined && store.auditError()) return; // catchError path

                    // Restore to active list in the explorer cache with updated isActive flag
                    if (target) {
                        const restoredRoute: IRouteDto = { ...target, isActive: true };
                        patchState(store, {
                            routes: [restoredRoute, ...store.routes()],
                            pagination: {
                                ...store.pagination(),
                                totalCount: store.pagination().totalCount + 1,
                            },
                        });
                    }

                    patchState(store, { recoveryLoading: false });
                    resolve({ success: true, routeId });
                });
            });
        },

        /** Update the instant-search query for the audit table. */
        setAuditSearch(query: string): void {
            patchState(store, { auditSearch: query });
        },

        /** Dismiss the audit center error banner. */
        clearAuditError(): void {
            patchState(store, { auditError: null });
        },

        /** Full recovery center state reset on navigate-away. */
        clearRecoveryCenter(): void {
            patchState(store, {
                archivedRoutes: [],
                recoveryLoading: false,
                auditError: null,
                auditSearch: '',
            });
        },

    }))
);

// ── Private helpers ────────────────────────────────────────────────────────

function _routeError(err: unknown, fallback: string): string {
    const e = err as Record<string, unknown>;
    const body = e?.['error'] as Record<string, unknown> | undefined;
    const status = e?.['status'] as number | undefined;

    if (status === 409) {
        return (
            (body?.['message'] as string) ??
            'Network Link Conflict: This corridor has active schedule assignments. Remove all flight schedules before deactivating.'
        );
    }

    if (status === 404) {
        return 'Route not found in the network registry. It may have already been removed.';
    }

    if (status === 0 || status === undefined) {
        return 'Network Error: Unable to reach the Route Registry. Verify connectivity and retry.';
    }

    if (body?.['errors'] && typeof body['errors'] === 'object') {
        return Object.entries(body['errors'] as Record<string, string | string[]>)
            .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`)
            .join(' · ');
    }

    return (body?.['message'] as string) ?? (e?.['message'] as string) ?? fallback;
}


function _opError(err: unknown, fallback: string): string {
    const e = err as Record<string, unknown>;
    const body = e?.['error'] as Record<string, unknown> | undefined;
    const status = e?.['status'] as number | undefined;

    if (status === 401 || status === 403)
        return 'Authorization Denied: You do not have sufficient clearance to modify operator rights on this corridor.';

    if (status === 409)
        return (body?.['message'] as string) ??
            'Resource Locked: This operator has active flight schedules on the corridor. Resolve all conflicts before revoking rights.';

    if (status === 404)
        return 'Operator record not found. It may have already been removed from this corridor.';

    if (status === 0 || status === undefined)
        return 'Network Error: Unable to reach the Operator Registry. Verify connectivity and retry.';

    if (body?.['errors'] && typeof body['errors'] === 'object')
        return Object.entries(body['errors'] as Record<string, string | string[]>)
            .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`)
            .join(' · ');

    return (body?.['message'] as string) ?? (e?.['message'] as string) ?? fallback;
}




function _composerError(err: unknown, fallback: string): string {
    const e = err as Record<string, unknown>;
    const body = e?.['error'] as Record<string, unknown> | undefined;
    const status = e?.['status'] as number | undefined;

    // Duplicate route (same O-D pair already exists)
    if (status === 409)
        return (body?.['message'] as string) ??
            'Route Conflict: A corridor between these two hubs already exists in the network registry. Review the existing route before creating a duplicate.';

    if (status === 422)
        return (body?.['message'] as string) ??
            'Validation Error: The provided route parameters did not pass network validation. Verify hub codes and distance values.';

    if (status === 400) {
        if (body?.['errors'] && typeof body['errors'] === 'object') {
            return Object.entries(body['errors'] as Record<string, string | string[]>)
                .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`)
                .join(' · ');
        }
        return (body?.['message'] as string) ?? 'Invalid route parameters. Check hub selection and distance.';
    }

    if (status === 404)
        return 'Route record not found in the network registry. It may have been removed.';

    if (status === 403)
        return 'Authorization Denied: You do not have sufficient clearance to modify network routes.';

    if (status === 0 || status === undefined)
        return 'Network Error: Unable to reach the Route Registry. Verify connectivity and retry.';

    return (body?.['message'] as string) ?? (e?.['message'] as string) ?? fallback;
}


function _auditError(err: unknown, fallback: string): string {
    const e = err as Record<string, unknown>;
    const body = e?.['error'] as Record<string, unknown> | undefined;
    const status = e?.['status'] as number | undefined;

    if (status === 409)
        return (body?.['message'] as string) ??
            'Route Conflict: A corridor with the same hub pair is already active in the network. Deactivate the existing route before restoring this one.';

    if (status === 422)
        return (body?.['message'] as string) ??
            'Restoration Blocked: One or more hubs in this corridor are currently closed or at capacity. Verify hub operational status before restoring.';

    if (status === 403)
        return 'Authorization Denied: You do not have sufficient clearance to restore deactivated corridors.';

    if (status === 404)
        return 'Corridor record not found in the archive. It may have been permanently removed from the network registry.';

    if (status === 0 || status === undefined)
        return 'Network Error: Unable to reach the Route Registry. Verify connectivity and retry.';

    if (body?.['errors'] && typeof body['errors'] === 'object')
        return Object.entries(body['errors'] as Record<string, string | string[]>)
            .map(([f, m]) => `${f}: ${Array.isArray(m) ? m.join(', ') : m}`)
            .join(' · ');

    return (body?.['message'] as string) ?? (e?.['message'] as string) ?? fallback;
}
