

import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
    Subject, switchMap, tap, catchError, of, debounceTime, EMPTY,
} from 'rxjs';

import { AircraftService } from '@shared-core';
import {
    IAircraftDto,
    IAircraftFilterDto,
    IAircraftDetailDto,
    IAircraftConfigDto,
    ICreateAircraftConfigDto,
    ICabinClassDto,
    ICreateCabinClassDto,
    ICreateSeatDto, IUpdateSeatDto,
} from '@shared-core';
import { IPaginatedResult } from '@shared-core';

// ── Route base path ────────────────────────────────────────────────────────
const LCC_BASE = 'aoms/fleet-configuration/cabin-configuration-designer';

// ── Supporting types ────────────────────────────────────────────────────────

export interface ILopaFleetFilters {
    tailNumber: string;
    status: string;
    aircraftTypeId: string;
}

export interface ILopaPagination {
    total: number;
    page: number;
    size: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/** KPI metrics derived from the currently loaded page. */
export interface ILopaKpiStats {
    /** Sum of `totalSeatsCount` across all configurations on this page. */
    totalSeatCapacity: number;
    /** Count of aircraft that have ≥ 1 configuration. */
    activeConfigurations: number;
    /** Count of aircraft with 0 configurations (need a LOPA). */
    maintenancePending: number;
    /** % of fleet with ≥ 1 config — "Network Readiness". */
    networkReadinessPct: number;
}

/** Per-row enriched view model that the dumb table consumes. */
export interface ILopaAircraftRow extends IAircraftDto {
    /** Pulled from the detail call or the fleet list. */
    configurations: IAircraftConfigDto[];
    /** Derived: total seats across all configs. */
    totalPaxCapacity: number;
    /** Derived: short display label for the "primary" config. */
    primaryConfigLabel: string;
}



/**
 * Extended config view model used by the Config Explorer.
 * Derives additional display fields from IAircraftConfigDto.
 */
export interface IConfigViewModel {
    configId: number;
    configurationName: string;
    totalSeatsCount: number;
    cabinClasses: ICabinClassViewItem[];
    /** Derived: sum of all class seat counts. */
    totalDerivedSeats: number;
    /** Derived: class distribution bars (percentage of total per class). */
    classDistribution: IClassBar[];
    /** Derived: whether this is the "primary" / first-added config. */
    isPrimary: boolean;
}

export interface ICabinClassViewItem {
    cabinClassId: number;
    name: string;
    seatCount: number;
}

/** Single bar in the cabin class distribution visualizer. */
export interface IClassBar {
    className: string;
    seats: number;
    pct: number;     // 0-100
    variant: 'first' | 'business' | 'premium' | 'economy' | 'other';
}


/** Full view model for a cabin class zone, ready for the UI. */
export interface ICabinClassViewModel {
    cabinClassId: number;
    configId: number;
    name: string;
    /** Parsed class type from the name using the predefined type map. */
    classType: CabinClassType;
    seatCount: number;
    /** Visual metadata derived from the classType. */
    visual: ICabinVisual;
}

export type CabinClassType =
    | 'suites'
    | 'first'
    | 'business'
    | 'premium-economy'
    | 'economy'
    | 'custom';

/** Visual identity metadata for each class type. */
export interface ICabinVisual {
    label: string;     // Display name e.g. "The Suites"
    badgeColor: string;     // CSS hex for the badge background
    textColor: string;     // CSS hex for the badge text
    iconPath: string;     // SVG path for the class icon
    sortOrder: number;     // Front-to-back sort (Suites = 0)
}

export const CABIN_CLASS_VISUALS: Record<CabinClassType, ICabinVisual> = {
    suites: {
        label: 'The Suites',
        badgeColor: '#B68F24',
        textColor: '#ffffff',
        iconPath: 'M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3',
        sortOrder: 0,
    },
    first: {
        label: 'First Class',
        badgeColor: '#1E3A5F',
        textColor: '#E2C780',
        iconPath: 'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5z',
        sortOrder: 1,
    },
    business: {
        label: 'Business Class',
        badgeColor: '#1E40AF',
        textColor: '#ffffff',
        iconPath: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006-3.75 4.5M4.5 11.131a48.114 48.114 0 0 0-3.413-.387C.04 10.706-.001 10.36-.001 10.003V6.489c0-1.081.769-2.014 1.837-2.174A48.09 48.09 0 0 1 12 4.5c2.291 0 4.545.16 6.797.459a2.25 2.25 0 0 1 1.703 2.174v3.543',
        sortOrder: 2,
    },
    'premium-economy': {
        label: 'Premium Economy',
        badgeColor: '#5B21B6',
        textColor: '#ffffff',
        iconPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z',
        sortOrder: 3,
    },
    economy: {
        label: 'Economy Class',
        badgeColor: '#374151',
        textColor: '#D1D5DB',
        iconPath: 'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0z',
        sortOrder: 4,
    },
    custom: {
        label: 'Custom Zone',
        badgeColor: '#4B5563',
        textColor: '#E5E7EB',
        iconPath: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z',
        sortOrder: 5,
    },
};

/** The 5 predefined cabin class types offered in the form dropdown. */
export const PREDEFINED_CABIN_TYPES: { value: CabinClassType; label: string }[] = [
    { value: 'suites', label: 'The Suites' },
    { value: 'first', label: 'First Class' },
    { value: 'business', label: 'Business Class' },
    { value: 'premium-economy', label: 'Premium Economy' },
    { value: 'economy', label: 'Economy Class' },
];

/**
 * Full seat view model with derived display state for the architect canvas.
 * Backend `ICreateSeatDto.seatId` is a string on some endpoints.
 */
export interface ISeatViewModel {
    seatId: string;
    seatNumber: string;
    cabinClassId: number;
    isWindow: boolean;
    isExitRow: boolean;
    isAisle: boolean;
    /** Row number extracted from seatNumber (e.g. "12A" → 12) */
    rowNumber: number;
    /** Column letter extracted from seatNumber (e.g. "12A" → "A") */
    colLetter: string;
    /** Current edit state on the canvas */
    editState: SeatEditState;
}

export type SeatEditState = 'default' | 'selected' | 'modified' | 'new' | 'pending-delete';

/** 2D grid row for the visual canvas */
export interface ISeatGridRow {
    rowNumber: number;
    /** null = aisle spacer */
    cells: (ISeatViewModel | null)[];
    isExitRow: boolean;
}

/** What columns the canvas detected + where aisles sit */
export interface ISeatGridLayout {
    columnLetters: string[];         // e.g. ["A","B","C","D","E","F"]
    aisleAfterIndices: number[];     // e.g. [2] for 3+3 layout
    rows: ISeatGridRow[];
}

// ── Load trigger payload ─────────────────────────────────────────────────
interface ILoadPayload {
    filters: ILopaFleetFilters;
    page: number;
    size: number;
}

const DEFAULT_FILTERS: ILopaFleetFilters = {
    tailNumber: '', status: '', aircraftTypeId: '',
};

const DEFAULT_PAGINATION: ILopaPagination = {
    total: 0, page: 1, size: 15,
    totalPages: 0, hasNext: false, hasPrev: false,
};

@Injectable({ providedIn: 'root' })
export class CabinDesignerStore {
    private readonly aircraftService = inject(AircraftService);
    private readonly router = inject(Router);

    // ── Private Writable Signals ──────────────────────────────────────────
    private readonly _aircraftList = signal<IAircraftDto[]>([]);
    private readonly _pagination = signal<ILopaPagination>(DEFAULT_PAGINATION);
    private readonly _filters = signal<ILopaFleetFilters>(DEFAULT_FILTERS);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);
    private readonly _selectedTailNumber = signal<string | null>(null);
    // ── Config Explorer State ─────────────────────────────────────────────
    private readonly _configurations = signal<IConfigViewModel[]>([]);
    private readonly _isLoadingConfigs = signal<boolean>(false);
    private readonly _configLoadError = signal<string | null>(null);
    private readonly _isDeleting = signal<boolean>(false);
    private readonly _deleteError = signal<string | null>(null);
    private readonly _activeTailNumber = signal<string | null>(null);
    private readonly _configFilterQuery = signal<string>('');

    // ── Cabin Class Builder State ─────────────────────────────────────────
    private readonly _activeCabins = signal<ICabinClassViewModel[]>([]);
    private readonly _isLoadingCabins = signal<boolean>(false);
    private readonly _cabinLoadError = signal<string | null>(null);
    private readonly _isProcessingCabin = signal<boolean>(false);
    private readonly _cabinActionError = signal<string | null>(null);
    private readonly _activeConfigId = signal<number | null>(null);

    // ── Seat Map Architect State ──────────────────────────────────────────
    private readonly _currentSeatMap = signal<ISeatViewModel[]>([]);
    private readonly _selectedSeat = signal<ISeatViewModel | null>(null);
    private readonly _isLoadingSeatMap = signal<boolean>(false);
    private readonly _seatMapLoadError = signal<string | null>(null);
    private readonly _isSavingSeat = signal<boolean>(false);
    private readonly _seatSaveError = signal<string | null>(null);
    private readonly _seatSaveSuccess = signal<string | null>(null);
    private readonly _activeCabinId = signal<number | null>(null);

    // Derived grid layout
    private readonly _seatGridLayout = signal<ISeatGridLayout | null>(null);

    // RxJS subject for seat map load
    private readonly _seatMapTrigger$ = new Subject<number>(); // cabinClassId

    // RxJS subject for cabin load
    private readonly _cabinTrigger$ = new Subject<number>(); // configId
    // RxJS subject for config load
    private readonly _configTrigger$ = new Subject<string>(); // tailNumber
    // ── RxJS Load Subject ─────────────────────────────────────────────────
    private readonly _loadTrigger$ = new Subject<ILoadPayload>();

    constructor() {
        this._loadTrigger$
            .pipe(
                debounceTime(120),
                tap(() => {
                    this._loading.set(true);
                    this._error.set(null);
                }),
                switchMap(({ filters, page, size }) => {
                    const dto: IAircraftFilterDto = {
                        ...(filters.aircraftTypeId ? { aircraftTypeId: parseInt(filters.aircraftTypeId, 10) } : {}),
                        ...(filters.status ? { status: filters.status } : {}),
                    };

                    return this.aircraftService.searchAircraft(dto, page, size).pipe(
                        catchError(err => {
                            this._error.set(
                                err?.message ??
                                'Fleet data synchronization encountered a technical barrier. Please retry.'
                            );
                            const empty: IPaginatedResult<IAircraftDto> = {
                                items: [], totalCount: 0, pageNumber: page, pageSize: size,
                                totalPages: 0, hasPreviousPage: false, hasNextPage: false,
                            };
                            return of(empty);
                        })
                    );
                }),
                tap(() => this._loading.set(false)),
                takeUntilDestroyed()
            )
            .subscribe((result: IPaginatedResult<IAircraftDto>) => {
                this._aircraftList.set(result.items ?? []);
                this._pagination.set({
                    total: result.totalCount,
                    page: result.pageNumber,
                    size: result.pageSize,
                    totalPages: result.totalPages,
                    hasNext: result.hasNextPage,
                    hasPrev: result.hasPreviousPage,
                });
            });

        this._configTrigger$
            .pipe(
                tap(() => {
                    this._isLoadingConfigs.set(true);
                    this._configLoadError.set(null);
                    this._configurations.set([]);
                }),
                switchMap(tailNumber =>
                    this.aircraftService.getConfigsForAircraft(tailNumber).pipe(
                        catchError(err => {
                            this._configLoadError.set(
                                err?.message ??
                                'Configuration data could not be retrieved. Fleet registry synchronization in progress.'
                            );
                            return of([]);
                        })
                    )
                ),
                tap(() => this._isLoadingConfigs.set(false)),
                takeUntilDestroyed()
            )
            .subscribe((configs: IAircraftConfigDto[]) => {
                const mapped = this._mapToViewModels(configs);
                this._configurations.set(mapped);
            });

        this._cabinTrigger$
            .pipe(
                tap(() => {
                    this._isLoadingCabins.set(true);
                    this._cabinLoadError.set(null);
                }),
                switchMap(configId =>
                    this.aircraftService.getCabinClassesForConfig(configId).pipe(
                        catchError(err => {
                            this._cabinLoadError.set(
                                err?.message ??
                                'Cabin zone data could not be retrieved. Configuration synchronization in progress.'
                            );
                            return of([]);
                        })
                    )
                ),
                tap(() => this._isLoadingCabins.set(false)),
                takeUntilDestroyed()
            )
            .subscribe((classes: ICabinClassDto[]) => {
                const configId = this._activeConfigId() ?? 0;
                const mapped = this._mapCabinClasses(classes, configId);
                this._activeCabins.set(mapped);
            });

        this._seatMapTrigger$
            .pipe(
                tap(() => {
                    this._isLoadingSeatMap.set(true);
                    this._seatMapLoadError.set(null);
                    this._currentSeatMap.set([]);
                    this._selectedSeat.set(null);
                }),
                switchMap(cabinClassId =>
                    this.aircraftService.getSeatMapForCabinClass(cabinClassId).pipe(
                        catchError(err => {
                            this._seatMapLoadError.set(
                                err?.message ??
                                'Seat map data could not be retrieved. Canvas synchronization in progress.'
                            );
                            return of([]);
                        })
                    )
                ),
                tap(() => this._isLoadingSeatMap.set(false)),
                takeUntilDestroyed()
            )
            .subscribe((seats: unknown[]) => {
                // The getSeatMapForCabinClass returns an array of seat objects
                // Cast and map to ISeatViewModel
                const typed = seats as Array<{
                    seatId: string; seatNumber: string;
                    cabinClassId: number; isWindow?: boolean;
                    isExitRow?: boolean; isAisle?: boolean;
                }>;
                const viewModels = typed.map(s => this._toSeatViewModel(s));
                this._currentSeatMap.set(viewModels);
                this._seatGridLayout.set(this._buildGridLayout(viewModels));
            });
    }

    // ── Public Computed Signals ───────────────────────────────────────────

    /** KPI cards derived from current page only. */
    readonly lopaKpiStats = computed<ILopaKpiStats>(() => {
        const list = this._aircraftList();
        const withConfig = list.filter(a => (a as ILopaAircraftRow).configurations?.length > 0);
        const seats = list.reduce(
            (sum, a) => sum + ((a as ILopaAircraftRow).totalPaxCapacity ?? 0),
            0
        );
        const pending = list.length - withConfig.length;
        const readiness = list.length > 0
            ? Math.round((withConfig.length / list.length) * 100)
            : 0;
        return {
            totalSeatCapacity: seats,
            activeConfigurations: withConfig.length,
            maintenancePending: pending,
            networkReadinessPct: readiness,
        };
    });

    /** Rows enriched with derived LOPA fields for the dumb table. */
    readonly lopaAircraftRows = computed<ILopaAircraftRow[]>(() =>
        this._aircraftList().map(a => {
            const row = a as ILopaAircraftRow;
            const configs = row.configurations ?? [];
            const seats = configs.reduce((s, c) => s + (c.totalSeatsCount ?? 0), 0);
            const primary = configs[0];
            return {
                ...row,
                configurations: configs,
                totalPaxCapacity: seats,
                primaryConfigLabel: primary
                    ? `${primary.configurationName}`
                    : '—',
            };
        })
    );

    // Primitive read-only signals
    readonly aircraftList = this._aircraftList.asReadonly();
    readonly pagination = this._pagination.asReadonly();
    readonly filters = this._filters.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();
    readonly selectedTailNumber = this._selectedTailNumber.asReadonly();

    /** Configs filtered by the search query. */
    readonly filteredConfigs = computed<IConfigViewModel[]>(() => {
        const all = this._configurations();
        const query = this._configFilterQuery().toLowerCase().trim();
        if (!query) return all;
        return all.filter(c =>
            c.configurationName.toLowerCase().includes(query) ||
            c.cabinClasses.some(cls => cls.name.toLowerCase().includes(query))
        );
    });

    readonly configurations = this._configurations.asReadonly();
    readonly isLoadingConfigs = this._isLoadingConfigs.asReadonly();
    readonly configLoadError = this._configLoadError.asReadonly();
    readonly isDeleting = this._isDeleting.asReadonly();
    readonly deleteError = this._deleteError.asReadonly();
    readonly activeTailNumber = this._activeTailNumber.asReadonly();
    readonly configFilterQuery = this._configFilterQuery.asReadonly();


    readonly activeCabins = this._activeCabins.asReadonly();
    readonly isLoadingCabins = this._isLoadingCabins.asReadonly();
    readonly cabinLoadError = this._cabinLoadError.asReadonly();
    readonly isProcessingCabin = this._isProcessingCabin.asReadonly();
    readonly cabinActionError = this._cabinActionError.asReadonly();
    readonly activeConfigId = this._activeConfigId.asReadonly();



    readonly currentSeatMap = this._currentSeatMap.asReadonly();
    readonly selectedSeat = this._selectedSeat.asReadonly();
    readonly isLoadingSeatMap = this._isLoadingSeatMap.asReadonly();
    readonly seatMapLoadError = this._seatMapLoadError.asReadonly();
    readonly isSavingSeat = this._isSavingSeat.asReadonly();
    readonly seatSaveError = this._seatSaveError.asReadonly();
    readonly seatSaveSuccess = this._seatSaveSuccess.asReadonly();
    readonly seatGridLayout = this._seatGridLayout.asReadonly();
    readonly activeCabinId = this._activeCabinId.asReadonly();
    readonly seatCount = computed(() => this._currentSeatMap().length);

    // ── Actions ───────────────────────────────────────────────────────────

    /** Load fleet — called on init or filter change. */
    loadFleet(filters?: Partial<ILopaFleetFilters>, page = 1): void {
        if (filters) this._filters.update(c => ({ ...c, ...filters }));
        const f = this._filters();
        this._loadTrigger$.next({ filters: f, page, size: this._pagination().size });
    }

    /** Patch filters and reload from page 1. */
    updateFilters(partial: Partial<ILopaFleetFilters>): void {
        this._filters.update(c => ({ ...c, ...partial }));
        this._loadTrigger$.next({
            filters: this._filters(), page: 1, size: this._pagination().size,
        });
    }

    /** Navigate pages. */
    nextPage(): void {
        const p = this._pagination();
        if (!p.hasNext) return;
        this._loadTrigger$.next({ filters: this._filters(), page: p.page + 1, size: p.size });
    }

    prevPage(): void {
        const p = this._pagination();
        if (!p.hasPrev) return;
        this._loadTrigger$.next({ filters: this._filters(), page: p.page - 1, size: p.size });
    }

    goToPage(page: number): void {
        const p = this._pagination();
        if (page < 1 || page > p.totalPages) return;
        this._loadTrigger$.next({ filters: this._filters(), page, size: p.size });
    }

    refreshData(): void {
        const p = this._pagination();
        this._loadTrigger$.next({ filters: this._filters(), page: p.page, size: p.size });
    }

    resetFilters(): void {
        this._filters.set({ ...DEFAULT_FILTERS });
        this._loadTrigger$.next({
            filters: DEFAULT_FILTERS, page: 1, size: this._pagination().size,
        });
    }

    /**
     * Selects an aircraft and navigates to its Config Explorer page.
     * The Config Explorer is responsible for loading `getConfigsForAircraft`.
     */
    selectAircraftForLOPA(tailNumber: string): void {
        this._selectedTailNumber.set(tailNumber);
        this.router.navigate([LCC_BASE, 'config-explorer', tailNumber]);
    }


    // ===========================================================================
    // CONFIG EXPLORER ACTIONS
    // ===========================================================================

    /**
     * Loads all configurations for a specific aircraft tail number.
     * Sets activeTailNumber and triggers the reactive pipeline.
     */
    getConfigs(tailNumber: string): void {
        this._activeTailNumber.set(tailNumber);
        this._configTrigger$.next(tailNumber);
    }

    /** Updates the client-side config search filter. */
    setConfigFilter(query: string): void {
        this._configFilterQuery.set(query);
    }

    /** Clears all config explorer state — call from ngOnDestroy. */
    clearConfigState(): void {
        this._configurations.set([]);
        this._configLoadError.set(null);
        this._deleteError.set(null);
        this._configFilterQuery.set('');
        this._activeTailNumber.set(null);
    }

    clearDeleteError(): void {
        this._deleteError.set(null);
    }

    /**
     * Removes a configuration by ID.
     * On success: removes it from the local list.
     * On 409/412: captures a dependency conflict message.
     */
    removeConfig(configId: number): Promise<{ success: boolean; error?: string }> {
        this._isDeleting.set(true);
        this._deleteError.set(null);

        return new Promise(resolve => {
            this.aircraftService.deleteAircraftConfig(configId).pipe(
                catchError(err => {
                    const code = err?.status;
                    let msg: string;

                    if (code === 409 || code === 412) {
                        msg = `Deactivation blocked — this layout is assigned to one or more active flights. Release all flight assignments before deactivating.`;
                    } else if (code === 404) {
                        msg = `Configuration record could not be located. It may have already been removed.`;
                    } else {
                        msg = err?.error?.message ?? err?.message ??
                            `Configuration deactivation encountered a technical barrier.`;
                    }

                    this._deleteError.set(msg);
                    this._isDeleting.set(false);
                    resolve({ success: false, error: msg });
                    return EMPTY;
                })
            ).subscribe(() => {
                this._configurations.update(list =>
                    list.filter(c => c.configId !== configId)
                );
                this._isDeleting.set(false);
                resolve({ success: true });
            });
        });
    }

    /**
     * Duplicates a configuration by creating a new one with a "(Copy)" suffix.
     * Uses createAircraftConfig — requires the active tailNumber.
     */
    duplicateConfig(configId: number): Promise<{ success: boolean }> {
        const tailNumber = this._activeTailNumber();
        if (!tailNumber) return Promise.resolve({ success: false });

        const source = this._configurations().find(c => c.configId === configId);
        if (!source) return Promise.resolve({ success: false });

        this._isDeleting.set(true); // reuse the processing signal

        const dto: ICreateAircraftConfigDto = {
            configurationName: `${source.configurationName} (Copy)`,
            totalSeatsCount: source.totalSeatsCount,
        };

        return new Promise(resolve => {
            this.aircraftService.createAircraftConfig(tailNumber, dto).pipe(
                catchError(() => {
                    this._isDeleting.set(false);
                    resolve({ success: false });
                    return EMPTY;
                })
            ).subscribe(newConfig => {
                const mapped = this._mapToViewModels([newConfig]);
                this._configurations.update(list => [...list, ...mapped]);
                this._isDeleting.set(false);
                resolve({ success: true });
            });
        });
    }

    /**
     * Navigates to the Config Workspace Manager for a given configId.
     */
    openWorkspace(configId: number): void {
        const tail = this._activeTailNumber();
        this.router.navigate([LCC_BASE, 'cabin-builder', configId], {
            queryParams: tail ? { tail } : {},
        });
    }

    // Private mapper — converts IAircraftConfigDto[] → IConfigViewModel[]
    private _mapToViewModels(configs: IAircraftConfigDto[]): IConfigViewModel[] {
        const CLASS_VARIANT_MAP: Record<string, IClassBar['variant']> = {
            first: 'first',
            suites: 'first',
            business: 'business',
            premium: 'premium',
            economy: 'economy',
        };

        return configs.map((c, idx) => {
            const classes = c.cabinClasses ?? [];
            const total = classes.reduce((s, cl) => s + cl.seatCount, 0) ||
                (c.totalSeatsCount ?? 0);

            const distribution: IClassBar[] = classes.map(cl => {
                const key = cl.name.toLowerCase();
                const variant = Object.entries(CLASS_VARIANT_MAP).find(([k]) => key.includes(k))?.[1] ?? 'other';
                return {
                    className: cl.name,
                    seats: cl.seatCount,
                    pct: total > 0 ? Math.round((cl.seatCount / total) * 100) : 0,
                    variant,
                };
            });

            return {
                configId: c.configId,
                configurationName: c.configurationName,
                totalSeatsCount: c.totalSeatsCount ?? 0,
                cabinClasses: classes.map(cl => ({
                    cabinClassId: cl.cabinClassId,
                    name: cl.name,
                    seatCount: cl.seatCount,
                })),
                totalDerivedSeats: total,
                classDistribution: distribution,
                isPrimary: idx === 0,
            };
        });
    }



    // ===========================================================================
    // CABIN CLASS BUILDER ACTIONS
    // ===========================================================================

    /** Loads all cabin classes for the specified configuration. */
    loadCabins(configId: number): void {
        this._activeConfigId.set(configId);
        this._cabinTrigger$.next(configId);
    }

    clearCabinActionError(): void {
        this._cabinActionError.set(null);
    }

    clearCabinState(): void {
        this._activeCabins.set([]);
        this._cabinLoadError.set(null);
        this._cabinActionError.set(null);
        this._activeConfigId.set(null);
    }

    /**
     * Creates a new cabin class for the active configuration.
     * On success: re-fetches the full list (ordering from backend is authoritative).
     */
    addCabin(configId: number, name: string): Promise<boolean> {
        this._isProcessingCabin.set(true);
        this._cabinActionError.set(null);

        const dto: ICreateCabinClassDto = { configId, name };

        return new Promise(resolve => {
            this.aircraftService.createCabinClass(dto).pipe(
                catchError(err => {
                    const code = err?.status;
                    let msg: string;

                    if (code === 409) {
                        msg = `Configuration Locked — a cabin zone with a similar designation already exists. Use a distinct zone code or name.`;
                    } else {
                        msg = err?.error?.message ?? err?.message ??
                            'Cabin zone could not be added. Technical barrier encountered.';
                    }

                    this._cabinActionError.set(msg);
                    this._isProcessingCabin.set(false);
                    resolve(false);
                    return EMPTY;
                })
            ).subscribe(() => {
                this._isProcessingCabin.set(false);
                // Re-fetch from backend to get server-assigned IDs + ordering
                this.loadCabins(configId);
                resolve(true);
            });
        });
    }

    /**
     * Removes a cabin class zone.
     * HTTP 409 = zone has associated seat maps/active configurations.
     */
    removeCabin(cabinClassId: number): Promise<boolean> {
        this._isProcessingCabin.set(true);
        this._cabinActionError.set(null);

        return new Promise(resolve => {
            this.aircraftService.deleteCabinClass(cabinClassId).pipe(
                catchError(err => {
                    const code = err?.status;
                    let msg: string;

                    if (code === 409 || code === 412) {
                        msg = `Zone Removal Blocked — this cabin class contains active seat configurations. Purge all seat assignments before decommissioning this zone.`;
                    } else if (code === 404) {
                        msg = `Cabin zone record not found. It may have already been removed.`;
                    } else {
                        msg = err?.error?.message ?? err?.message ??
                            'Cabin zone decommission encountered an unexpected technical barrier.';
                    }

                    this._cabinActionError.set(msg);
                    this._isProcessingCabin.set(false);
                    resolve(false);
                    return EMPTY;
                })
            ).subscribe(() => {
                // Remove from local list immediately
                this._activeCabins.update(list =>
                    list.filter(c => c.cabinClassId !== cabinClassId)
                );
                this._isProcessingCabin.set(false);
                resolve(true);
            });
        });
    }

    /**
     * Navigates to the Seat Map Architect for a specific cabin class.
     */
    openSeatMapArchitect(cabinClassId: number): void {
        this.router.navigate([LCC_BASE, 'seat-map', cabinClassId]);
    }

    // Private mapper — converts ICabinClassDto[] → ICabinClassViewModel[]
    private _mapCabinClasses(classes: ICabinClassDto[], configId: number): ICabinClassViewModel[] {
        return classes
            .map(c => {
                const classType = this._inferClassType(c.name);
                return {
                    cabinClassId: c.cabinClassId,
                    configId,
                    name: c.name,
                    classType,
                    seatCount: c.seatCount,
                    visual: CABIN_CLASS_VISUALS[classType],
                };
            })
            .sort((a, b) => a.visual.sortOrder - b.visual.sortOrder);
    }

    private _inferClassType(name: string): CabinClassType {
        const lower = name.toLowerCase();
        if (lower.includes('suite')) return 'suites';
        if (lower.includes('first')) return 'first';
        if (lower.includes('business')) return 'business';
        if (lower.includes('premium')) return 'premium-economy';
        if (lower.includes('economy') || lower.includes('eco')) return 'economy';
        return 'custom';
    }


    // ===========================================================================
    // SEAT MAP ARCHITECT ACTIONS
    // ===========================================================================

    /** Loads the seat map for a given cabin class. */
    fetchSeatMap(cabinClassId: number): void {
        this._activeCabinId.set(cabinClassId);
        this._seatMapTrigger$.next(cabinClassId);
    }

    /** Selects a seat for editing in the property editor sidebar. */
    selectSeat(seat: ISeatViewModel | null): void {
        this._selectedSeat.set(seat);
        this._seatSaveError.set(null);
        this._seatSaveSuccess.set(null);
    }

    clearSeatSaveMessages(): void {
        this._seatSaveError.set(null);
        this._seatSaveSuccess.set(null);
    }

    clearSeatMapState(): void {
        this._currentSeatMap.set([]);
        this._selectedSeat.set(null);
        this._seatMapLoadError.set(null);
        this._seatSaveError.set(null);
        this._seatSaveSuccess.set(null);
        this._seatGridLayout.set(null);
        this._activeCabinId.set(null);
    }

    /**
     * Adds a new seat to the cabin.
     * `location` provides a hint for the seat number — final number is
     * `${row}${col}` e.g. row=5, col="C" → "5C".
     */
    addNewSeat(cabinClassId: number, location: { row: number; col: string }): Promise<boolean> {
        this._isSavingSeat.set(true);
        this._seatSaveError.set(null);

        const dto: ICreateSeatDto = {
            seatNumber: `${location.row}${location.col}`,
            cabinClassId,
            isWindow: location.col === 'A' || location.col === 'F',
            isExitRow: false,
            isAisle: false,
        };

        return new Promise(resolve => {
            this.aircraftService.createSeat(dto).pipe(
                catchError(err => {
                    const msg = err?.error?.message ?? err?.message ??
                        `Seat ${dto.seatNumber} could not be added — position conflict detected.`;
                    this._seatSaveError.set(msg);
                    this._isSavingSeat.set(false);
                    resolve(false);
                    return EMPTY;
                })
            ).subscribe(() => {
                this._isSavingSeat.set(false);
                this.fetchSeatMap(cabinClassId); // reload to get authoritative state
                resolve(true);
            });
        });
    }

    /**
     * Updates seat properties (window / exit / aisle flags).
     * Optimistic UI: patch local state immediately, reconcile on success.
     */
    commitSeatUpdate(seatId: string, updates: Partial<{
        isWindow: boolean; isExitRow: boolean; isAisle: boolean; cabinClassId: number;
    }>): Promise<boolean> {
        this._isSavingSeat.set(true);
        this._seatSaveError.set(null);
        this._seatSaveSuccess.set(null);

        // Optimistic: mark as modified
        this._currentSeatMap.update(list =>
            list.map(s => s.seatId === seatId ? { ...s, ...updates, editState: 'modified' as SeatEditState } : s)
        );
        if (this._selectedSeat()?.seatId === seatId) {
            this._selectedSeat.update(s => s ? { ...s, ...updates, editState: 'modified' } : s);
        }
        this._seatGridLayout.set(this._buildGridLayout(this._currentSeatMap()));

        const dto: IUpdateSeatDto = {
            cabinClassId: updates.cabinClassId || this._selectedSeat()?.cabinClassId || this._activeCabinId() || 0,
            isWindow: updates.isWindow ?? false,
            isExitRow: updates.isExitRow ?? false,
            isAisle: updates.isAisle ?? false,
        };

        return new Promise(resolve => {
            this.aircraftService.updateSeat(seatId, dto).pipe(
                catchError(err => {
                    // Rollback optimistic update
                    this._currentSeatMap.update(list =>
                        list.map(s => s.seatId === seatId ? { ...s, editState: 'default' as SeatEditState } : s)
                    );
                    const code = err?.status;
                    const msg = code === 409
                        ? `Seat update blocked — this seat is assigned to an active booking. Unassign before modifying.`
                        : (err?.error?.message ?? 'Seat specification update encountered a technical barrier.');
                    this._seatSaveError.set(msg);
                    this._isSavingSeat.set(false);
                    resolve(false);
                    return EMPTY;
                })
            ).subscribe(() => {
                this._currentSeatMap.update(list =>
                    list.map(s => s.seatId === seatId ? { ...s, editState: 'default' as SeatEditState } : s)
                );
                this._seatSaveSuccess.set('Seat specifications committed to the layout registry.');
                this._isSavingSeat.set(false);
                resolve(true);

                // Auto-dismiss success after 3s
                setTimeout(() => this._seatSaveSuccess.set(null), 3000);
            });
        });
    }

    /**
     * Removes a seat from the cabin.
     * Marks as pending-delete optimistically, then removes on success.
     */
    removeSeat(seatId: string): Promise<boolean> {
        this._isSavingSeat.set(true);
        this._seatSaveError.set(null);

        // Optimistic: mark as pending-delete
        this._currentSeatMap.update(list =>
            list.map(s => s.seatId === seatId ? { ...s, editState: 'pending-delete' as SeatEditState } : s)
        );
        this._seatGridLayout.set(this._buildGridLayout(this._currentSeatMap()));

        return new Promise(resolve => {
            this.aircraftService.deleteSeat(seatId).pipe(
                catchError(err => {
                    // Rollback
                    this._currentSeatMap.update(list =>
                        list.map(s => s.seatId === seatId ? { ...s, editState: 'default' as SeatEditState } : s)
                    );
                    this._seatGridLayout.set(this._buildGridLayout(this._currentSeatMap()));
                    const code = err?.status;
                    const msg = code === 409
                        ? `Seat removal blocked — this position is part of an active booking reservation.`
                        : (err?.error?.message ?? 'Seat could not be removed. Technical barrier detected.');
                    this._seatSaveError.set(msg);
                    this._isSavingSeat.set(false);
                    resolve(false);
                    return EMPTY;
                })
            ).subscribe(() => {
                this._currentSeatMap.update(list => list.filter(s => s.seatId !== seatId));
                if (this._selectedSeat()?.seatId === seatId) this._selectedSeat.set(null);
                this._seatGridLayout.set(this._buildGridLayout(this._currentSeatMap()));
                this._isSavingSeat.set(false);
                resolve(true);
            });
        });
    }


    // ── Private helpers ───────────────────────────────────────────────────

    private _toSeatViewModel(raw: {
        seatId: string; seatNumber: string; cabinClassId: number;
        isWindow?: boolean; isExitRow?: boolean; isAisle?: boolean;
    }): ISeatViewModel {
        const match = raw.seatNumber.match(/^(\d+)([A-Z]+)$/i);
        return {
            seatId: raw.seatId,
            seatNumber: raw.seatNumber,
            cabinClassId: raw.cabinClassId || this._activeCabinId() || 0,
            isWindow: raw.isWindow ?? false,
            isExitRow: raw.isExitRow ?? false,
            isAisle: raw.isAisle ?? false,
            rowNumber: match ? parseInt(match[1], 10) : 0,
            colLetter: match ? match[2].toUpperCase() : '?',
            editState: 'default',
        };
    }

    private _buildGridLayout(seats: ISeatViewModel[]): ISeatGridLayout {
        if (!seats.length) return { columnLetters: [], aisleAfterIndices: [], rows: [] };

        // All unique column letters, sorted
        const colSet = new Set(seats.map(s => s.colLetter));
        const columnLetters = [...colSet].sort();

        // Detect aisle: standard heuristic — split at half
        const half = Math.floor(columnLetters.length / 2);
        const aisleAfterIndices = [half - 1]; // ABC | DEF → after index 2

        // Build row map
        const rowMap = new Map<number, ISeatViewModel[]>();
        for (const s of seats) {
            if (!rowMap.has(s.rowNumber)) rowMap.set(s.rowNumber, []);
            rowMap.get(s.rowNumber)!.push(s);
        }

        const rows: ISeatGridRow[] = [...rowMap.keys()].sort((a, b) => a - b).map(rn => {
            const rowSeats = rowMap.get(rn)!;
            const byCol = new Map(rowSeats.map(s => [s.colLetter, s]));
            const cells: (ISeatViewModel | null)[] = [];

            columnLetters.forEach((col, i) => {
                cells.push(byCol.get(col) ?? null);
                if (aisleAfterIndices.includes(i)) cells.push(null); // aisle
            });

            return {
                rowNumber: rn,
                cells,
                isExitRow: rowSeats.some(s => s.isExitRow),
            };
        });

        return { columnLetters, aisleAfterIndices, rows };
    }
}