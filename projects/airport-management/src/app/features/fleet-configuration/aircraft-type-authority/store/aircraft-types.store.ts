

import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, tap, catchError, EMPTY, of } from 'rxjs';
import { AircraftTypesService } from '@shared-core';
import {
    IAircraftTypeDto,
    ICreateAircraftTypeDto,
    IUpdateAircraftTypeDto,
} from '@shared-core';


// ── Filter Shape ──────────────────────────────────────────────────────────────
export interface IAircraftTypeFilters {
    searchQuery: string;
    manufacturer: string;
    minRangeKm: number | null;
    maxRangeKm: number | null;
    includeArchived: boolean;
}

// ── Stats Shape ───────────────────────────────────────────────────────────────
export interface IAircraftTypeStats {
    totalActiveTypes: number;
    averageRangeKm: number;
    manufacturerCount: number;
    manufacturerDistribution: Record<string, number>;
    avgSeatingCapacity: number;
}

// ── Save Result ───────────────────────────────────────────────────────────────
export type SaveResult =
    | { success: true; type: IAircraftTypeDto }
    | { success: false; error: string };

// ── Detail Action Types ───────────────────────────────────────────────────────
export type DetailAction = 'edit' | 'delete' | 'reactivate';


// ── 2. ADD these interfaces alongside the existing ones ───────────────────

/**
 * Mirrors ICreateAircraftTypeDto / IUpdateAircraftTypeDto but makes all
 * fields optional so the wizard can build the payload incrementally.
 */
export interface IFormDraft {
    model: string;
    manufacturer: string;
    rangeKm: number | null;
    maxSeats: number | null;
    cargoCapacity: number | null;
    cruisingVelocity: number | null;
}

/** Server-side or cross-field validation errors keyed by field name. */
export type ValidationErrors = Record<string, string>;

/** Distinguishes between New Registry mode and Modification mode. */
export type EditorMode = 'create' | 'edit';



// ── 4. ADD this constant at module scope (before the class) ───────────────

export const BLANK_DRAFT: IFormDraft = {
    model: '',
    manufacturer: '',
    rangeKm: null,
    maxSeats: null,
    cargoCapacity: null,
    cruisingVelocity: null,
};


/** ETOPS mode extends effective range by the configured multiplier. */
export type RangeMode = 'direct' | 'etops';

/** Efficiency classification for a route/aircraft pairing. */
export type EfficiencyTier =
    | 'optimal'      // aircraft range is 110–200% of target distance
    | 'capable'      // aircraft range is 100–110% (close but viable)
    | 'near-limit'   // aircraft range is 100–105% (operationally marginal)
    | 'inefficient'; // aircraft range is >200% (over-specified for route)

/** Enriched result model for the suitability list. */
export interface ISuitabilityResult {
    type: IAircraftTypeDto;
    /** True if rangeKm >= targetDistance */
    isSuitable: boolean;
    /** Coverage ratio: rangeKm / targetDistance (may exceed 1.0) */
    coverageRatio: number;
    /** Capped coverage percentage for the progress bar (0–100) */
    barPercent: number;
    efficiency: EfficiencyTier;
    /** How many km of margin remains above the target distance */
    marginKm: number;
}

export interface IRangeAnalyzerState {
    targetDistanceKm: number;
    mode: RangeMode;
}

// ── 2. ADD this constant at module scope ──────────────────────────────────

/** Effective range multiplier when ETOPS is enabled. */
export const ETOPS_MULTIPLIER = 1.2;

/** Default analyzer state. */
export const DEFAULT_ANALYZER_STATE: IRangeAnalyzerState = {
    targetDistanceKm: 5000,
    mode: 'direct',
};


/**
 * Extended DTO returned by the all-including-deleted endpoint.
 * Fields marked with `?` may not always be present depending on backend maturity.
 */
export interface IAircraftTypeAuditDto {
    // Core fields (same as IAircraftTypeDto)
    typeId: number;
    model: string;
    manufacturer: string;
    rangeKm?: number;
    maxSeats?: number;
    cargoCapacity?: number;
    cruisingVelocity?: number;

    // Audit fields (soft-delete metadata)
    isDeleted: boolean;
    deletedAt?: string;       // ISO 8601 date string
    deletedByUser?: string;   // Username or employee ID of who archived it
    createdAt?: string;       // ISO 8601 date string
    updatedAt?: string;       // ISO 8601 date string
    archivedReason?: string;  // Free-text reason captured at archive time
}

// ── 2. ADD these type aliases at module scope ─────────────────────────────

export type AuditFilterMode = 'all' | 'archived-only' | 'active-only';


// ── Default Filters ───────────────────────────────────────────────────────────
const DEFAULT_FILTERS: IAircraftTypeFilters = {
    searchQuery: '',
    manufacturer: '',
    minRangeKm: null,
    maxRangeKm: null,
    includeArchived: false,
};

// ── Route Base ────────────────────────────────────────────────────────────────
const ATA_BASE = 'aoms/fleet-configuration/aircraft-type-authority';

@Injectable({ providedIn: 'root' })
export class AircraftTypesStore {
    private readonly typesService = inject(AircraftTypesService);
    private readonly router = inject(Router);

    // ── Private Writable Signals ──────────────────────────────────────────────
    private readonly _aircraftTypes = signal<IAircraftTypeDto[]>([]);
    private readonly _filters = signal<IAircraftTypeFilters>(DEFAULT_FILTERS);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    // Detail-view state
    private readonly _selectedType = signal<IAircraftTypeDto | null>(null);
    private readonly _isDetailsLoading = signal<boolean>(false);
    private readonly _detailsError = signal<string | null>(null);
    /** Increments each time a successful update/reactivation happens on the selected type. */
    private readonly _activeRevision = signal<number>(0);

    // ── Editor / Wizard State ──────────────────────────────────────────────
    private readonly _editMode = signal<EditorMode>('create');
    private readonly _formDraft = signal<IFormDraft>(BLANK_DRAFT);
    private readonly _validationErrors = signal<ValidationErrors>({});
    private readonly _isDirty = signal<boolean>(false);

    // ── Range Analyzer State ──────────────────────────────────────────────
    private readonly _analyzerState = signal<IRangeAnalyzerState>(DEFAULT_ANALYZER_STATE);
    private readonly _suitableTypes = signal<IAircraftTypeDto[]>([]);
    private readonly _isAnalyzing = signal<boolean>(false);
    private readonly _analyzerError = signal<string | null>(null);

    // Save / mutate state
    private readonly _isSaving = signal<boolean>(false);
    private readonly _saveError = signal<string | null>(null);


    // ── Archive / Audit State ─────────────────────────────────────────────
    private readonly _allTypesIncludingDeleted = signal<IAircraftTypeAuditDto[]>([]);
    private readonly _isLoadingArchive = signal<boolean>(false);
    private readonly _archiveError = signal<string | null>(null);
    private readonly _isRestoring = signal<boolean>(false);
    private readonly _restoreError = signal<string | null>(null);
    private readonly _restoredTypeId = signal<number | null>(null);   // for animation trigger
    private readonly _auditFilter = signal<AuditFilterMode>('all');
    private readonly _toastMessage = signal<string | null>(null);   // success/error toast
    private readonly _toastType = signal<'success' | 'error' | null>(null);

    // ── RxJS Subjects ─────────────────────────────────────────────────────────
    private readonly _loadTrigger$ = new Subject<void>();
    private readonly _detailTrigger$ = new Subject<number>();
    // RxJS subject for the analyzer API call
    private readonly _analyzeTrigger$ = new Subject<number>();
    // RxJS subject for the archive load
    private readonly _archiveTrigger$ = new Subject<void>();


    constructor() {
        // ── List pipeline ──────────────────────────────────────────────────────
        this._loadTrigger$
            .pipe(
                tap(() => {
                    this._loading.set(true);
                    this._error.set(null);
                }),
                switchMap(() =>
                    this.typesService.getAllActiveAircraftTypes().pipe(
                        catchError(err => {
                            this._error.set(err?.message ?? 'Failed to load aircraft types.');
                            return of([]);
                        })
                    )
                ),
                tap(() => this._loading.set(false)),
                takeUntilDestroyed()
            )
            .subscribe(types => this._aircraftTypes.set(types));

        // ── Detail pipeline ────────────────────────────────────────────────────
        this._detailTrigger$
            .pipe(
                tap(() => {
                    this._isDetailsLoading.set(true);
                    this._detailsError.set(null);
                    this._selectedType.set(null);
                }),
                switchMap(typeId =>
                    this.typesService.getAircraftTypeById(typeId).pipe(
                        catchError(err => {
                            const msg =
                                err?.status === 404
                                    ? `Aircraft type with ID ${typeId} was not found.`
                                    : (err?.message ?? 'Failed to load aircraft type details.');
                            this._detailsError.set(msg);
                            return of(null);
                        })
                    )
                ),
                tap(() => this._isDetailsLoading.set(false)),
                takeUntilDestroyed()
            )
            .subscribe(type => {
                if (type) this._selectedType.set(type);
            });


        // ── Range Analyzer pipeline ────────────────────────────────────────────
        this._analyzeTrigger$
            .pipe(
                tap(() => {
                    this._isAnalyzing.set(true);
                    this._analyzerError.set(null);
                }),
                switchMap(distanceKm =>
                    this.typesService.getAircraftTypesSuitableForRoute(distanceKm).pipe(
                        catchError(err => {
                            this._analyzerError.set(
                                err?.message ?? 'Failed to load route suitability data.'
                            );
                            return of([]);
                        })
                    )
                ),
                tap(() => this._isAnalyzing.set(false)),
                takeUntilDestroyed()
            )
            .subscribe(types => this._suitableTypes.set(types));


        // ── Archive load pipeline ─────────────────────────────────────────────
        this._archiveTrigger$
            .pipe(
                tap(() => {
                    this._isLoadingArchive.set(true);
                    this._archiveError.set(null);
                }),
                switchMap(() =>
                    this.typesService.getAllAircraftTypesIncludingDeleted().pipe(
                        catchError(err => {
                            this._archiveError.set(
                                err?.message ?? 'Failed to load archive records.'
                            );
                            return of([]);
                        })
                    )
                ),
                tap(() => this._isLoadingArchive.set(false)),
                takeUntilDestroyed()
            )
            .subscribe(types => {
                // Cast to IAircraftTypeAuditDto[] — the service returns IAircraftTypeDto[]
                // but the all-including-deleted endpoint includes audit fields.
                // If the backend does not supply isDeleted, we mark everything from
                // the active list as active and the rest as deleted.
                const activeIds = new Set(this._aircraftTypes().map(t => t.typeId));
                const enriched = (types as IAircraftTypeAuditDto[]).map(t => ({
                    ...t,
                    isDeleted: t.isDeleted ?? !activeIds.has(t.typeId),
                }));
                this._allTypesIncludingDeleted.set(enriched);
            });
    }

    // ── Public READ-ONLY Signals ──────────────────────────────────────────────

    /** All types after applying current filters. */
    readonly filteredTypes = computed<IAircraftTypeDto[]>(() => {
        const all = this._aircraftTypes();
        const f = this._filters();
        const query = f.searchQuery.toLowerCase().trim();
        const mfr = f.manufacturer.trim().toLowerCase();

        return all.filter(t => {
            const matchesSearch =
                !query ||
                t.model.toLowerCase().includes(query) ||
                t.manufacturer.toLowerCase().includes(query);

            const matchesMfr =
                !mfr || t.manufacturer.toLowerCase().includes(mfr);

            const matchesMinRange =
                f.minRangeKm == null || (t.rangeKm ?? 0) >= f.minRangeKm;

            const matchesMaxRange =
                f.maxRangeKm == null || (t.rangeKm ?? Infinity) <= f.maxRangeKm;

            return matchesSearch && matchesMfr && matchesMinRange && matchesMaxRange;
        });
    });

    /** Aggregate stats derived from the full (unfiltered) dataset. */
    readonly stats = computed<IAircraftTypeStats>(() => {
        const all = this._aircraftTypes();

        const manufacturerDistribution = all.reduce<Record<string, number>>((acc, t) => {
            acc[t.manufacturer] = (acc[t.manufacturer] ?? 0) + 1;
            return acc;
        }, {});

        const withRange = all.filter(t => t.rangeKm != null);
        const averageRangeKm =
            withRange.length > 0
                ? Math.round(withRange.reduce((sum, t) => sum + (t.rangeKm ?? 0), 0) / withRange.length)
                : 0;

        const withSeats = all.filter(t => t.maxSeats != null);
        const avgSeatingCapacity =
            withSeats.length > 0
                ? Math.round(withSeats.reduce((sum, t) => sum + (t.maxSeats ?? 0), 0) / withSeats.length)
                : 0;

        return {
            totalActiveTypes: all.length,
            averageRangeKm,
            manufacturerCount: Object.keys(manufacturerDistribution).length,
            manufacturerDistribution,
            avgSeatingCapacity,
        };
    });

    /** Unique manufacturer list for the filter dropdown. */
    readonly manufacturers = computed<string[]>(() =>
        [...new Set(this._aircraftTypes().map(t => t.manufacturer))].sort()
    );

    // Primitive read-only signals
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();
    readonly filters = this._filters.asReadonly();
    readonly aircraftTypes = this._aircraftTypes.asReadonly();

    // Detail signals
    /** The currently loaded aircraft type for the detail view. */
    readonly selectedAircraftType = this._selectedType.asReadonly();
    /** True while the detail API call is in-flight. */
    readonly isLoadingDetails = this._isDetailsLoading.asReadonly();
    readonly detailsError = this._detailsError.asReadonly();
    /** Monotonically increments on each successful technical update; use with `effect()` to react to profile changes. */
    readonly activeRevision = this._activeRevision.asReadonly();

    // Save / mutate signals
    readonly isSaving = this._isSaving.asReadonly();
    readonly saveError = this._saveError.asReadonly();


    // Editor / Wizard signals
    readonly editMode = this._editMode.asReadonly();
    readonly formDraft = this._formDraft.asReadonly();
    readonly validationErrors = this._validationErrors.asReadonly();
    /** True once the user has edited any field, enabling the CanDeactivate guard. */
    readonly isDirty = this._isDirty.asReadonly();



    // ── Range Analyzer Computed Signals ───────────────────────────────────

    /**
     * Enriches each result with coverage ratio, bar percent, and efficiency tier.
     * Derived entirely from _suitableTypes + _analyzerState (no extra API call).
     */
    readonly suitabilityResults = computed<ISuitabilityResult[]>(() => {
        const target = this._analyzerState().targetDistanceKm;
        const mode = this._analyzerState().mode;
        const all = this._aircraftTypes();

        if (target <= 0) return [];

        return all
            .filter(t => t.rangeKm != null)
            .map(t => {
                const effectiveRange = mode === 'etops'
                    ? (t.rangeKm! * ETOPS_MULTIPLIER)
                    : t.rangeKm!;

                const isSuitable = effectiveRange >= target;
                const coverageRatio = effectiveRange / target;
                const barPercent = Math.min(Math.round(coverageRatio * 100), 100);
                const marginKm = Math.round(effectiveRange - target);

                let efficiency: EfficiencyTier;
                if (!isSuitable) {
                    efficiency = 'near-limit'; // shown in list as incapable
                } else if (coverageRatio > 2.0) {
                    efficiency = 'inefficient';
                } else if (coverageRatio > 1.1) {
                    efficiency = 'optimal';
                } else {
                    efficiency = 'capable';
                }

                return { type: t, isSuitable, coverageRatio, barPercent, efficiency, marginKm };
            })
            .sort((a, b) => {
                // Suitable types first, sorted by ascending margin (tightest fit first)
                if (a.isSuitable !== b.isSuitable) return a.isSuitable ? -1 : 1;
                return a.coverageRatio - b.coverageRatio;
            });
    });

    /** Only the aircraft that CAN fly the target distance. */
    readonly suitableCount = computed(() =>
        this.suitabilityResults().filter(r => r.isSuitable).length
    );

    /** Read-only accessor for the current analyzer state object. */
    readonly analyzerState = this._analyzerState.asReadonly();

    readonly isAnalyzing = this._isAnalyzing.asReadonly();
    readonly analyzerError = this._analyzerError.asReadonly();


    // ── Archive Computed Signals ──────────────────────────────────────────

    /** Records filtered by the current auditFilter selection. */
    readonly filteredAuditRecords = computed<IAircraftTypeAuditDto[]>(() => {
        const all = this._allTypesIncludingDeleted();
        const filter = this._auditFilter();
        switch (filter) {
            case 'archived-only': return all.filter(t => t.isDeleted);
            case 'active-only': return all.filter(t => !t.isDeleted);
            default: return all;
        }
    });

    /** Only the soft-deleted records — for badge counts. */
    readonly archivedTypesOnly = computed<IAircraftTypeAuditDto[]>(() =>
        this._allTypesIncludingDeleted().filter(t => t.isDeleted)
    );

    /** Aggregate audit statistics for the summary bar. */
    readonly auditStats = computed(() => {
        const all = this._allTypesIncludingDeleted();
        const archived = all.filter(t => t.isDeleted);
        const active = all.filter(t => !t.isDeleted);
        return {
            total: all.length,
            activeCount: active.length,
            archivedCount: archived.length,
            archivedPct: all.length > 0
                ? Math.round((archived.length / all.length) * 100)
                : 0,
        };
    });

    // Public read-only signals
    readonly allTypesIncludingDeleted = this._allTypesIncludingDeleted.asReadonly();
    readonly isLoadingArchive = this._isLoadingArchive.asReadonly();
    readonly archiveError = this._archiveError.asReadonly();
    readonly isRestoring = this._isRestoring.asReadonly();
    readonly restoreError = this._restoreError.asReadonly();
    readonly restoredTypeId = this._restoredTypeId.asReadonly();
    readonly auditFilter = this._auditFilter.asReadonly();
    readonly toastMessage = this._toastMessage.asReadonly();
    readonly toastType = this._toastType.asReadonly();


    // ── Actions ───────────────────────────────────────────────────────────────

    /** Trigger a full reload of the aircraft types list. */
    loadActiveTypes(): void {
        this._loadTrigger$.next();
    }

    /**
     * Load detailed data for a specific aircraft type by its numeric ID.
     * Populates `selectedAircraftType` and bumps `isLoadingDetails`.
     */
    loadTypeDetails(typeId: number): void {
        this._detailTrigger$.next(typeId);
    }

    /**
     * Reset the detail view state — call this in ngOnDestroy of the detail page
     * to avoid stale data when re-entering the route.
     */
    clearSelection(): void {
        this._selectedType.set(null);
        this._detailsError.set(null);
        this._isDetailsLoading.set(false);
        this._activeRevision.set(0);
    }

    /** Clear any persisted save error (e.g., when the editor is re-opened). */
    clearSaveError(): void {
        this._saveError.set(null);
    }

    /** Merge partial filter changes; recomputes `filteredTypes` on next read. */
    applyFilters(partial: Partial<IAircraftTypeFilters>): void {
        this._filters.update(current => ({ ...current, ...partial }));
    }

    /** Reset all filters to defaults. */
    resetFilters(): void {
        this._filters.set(DEFAULT_FILTERS);
    }

    /**
     * Orchestrates navigation and service calls for the three detail-page actions.
     * Called by the Smart Component in response to toolbar output events.
     *
     * @param typeId  Numeric PK of the aircraft type.
     * @param action  `'edit'` | `'delete'` | `'reactivate'`
     */
    handleAction(typeId: number, action: DetailAction): void {
        switch (action) {
            case 'edit':
                this.router.navigate([ATA_BASE, 'editor', typeId]);
                break;

            case 'delete':
                this._archiveAndNavigate(typeId);
                break;

            case 'reactivate':
                this._reactivateAndRefresh(typeId);
                break;
        }
    }

    /**
     * Create a new aircraft type.
     * On success, appends it to the local list and returns a SaveResult.
     */
    createType(dto: ICreateAircraftTypeDto): Promise<SaveResult> {
        this._isSaving.set(true);
        this._saveError.set(null);

        return new Promise(resolve => {
            this.typesService.createAircraftType(dto).pipe(
                catchError(err => {
                    const msg = this._extractApiError(err, 'Failed to create aircraft type.');
                    this._saveError.set(msg);
                    this._isSaving.set(false);
                    resolve({ success: false, error: msg });
                    return EMPTY;
                })
            ).subscribe(type => {
                this._aircraftTypes.update(list => [...list, type]);
                this._isSaving.set(false);
                resolve({ success: true, type });
            });
        });
    }

    /**
     * Update an existing aircraft type.
     * On success, splices the updated record into the local list, refreshes the
     * detail view, and bumps `activeRevision`.
     */
    updateType(typeId: number, dto: IUpdateAircraftTypeDto): Promise<SaveResult> {
        this._isSaving.set(true);
        this._saveError.set(null);

        return new Promise(resolve => {
            this.typesService.updateAircraftType(typeId, dto).pipe(
                catchError(err => {
                    const msg = this._extractApiError(err, 'Failed to update aircraft type.');
                    this._saveError.set(msg);
                    this._isSaving.set(false);
                    resolve({ success: false, error: msg });
                    return EMPTY;
                })
            ).subscribe(type => {
                this._aircraftTypes.update(list =>
                    list.map(t => (t.typeId === typeId ? type : t))
                );
                // Refresh the detail signal and bump the revision counter
                this._selectedType.set(type);
                this._activeRevision.update(n => n + 1);
                this._isSaving.set(false);
                resolve({ success: true, type });
            });
        });
    }

    /**
     * Soft-delete (archive) an aircraft type.
     * Optimistically removes from local state; navigates back to catalog.
     */
    archiveType(typeId: number): void {
        this._archiveAndNavigate(typeId);
    }

    /**
     * Reactivate a soft-deleted aircraft type.
     * Triggers a full list reload on success.
     */
    reactivateType(typeId: number): void {
        this._reactivateAndRefresh(typeId);
    }



    /*
        // ===========================================================================
        // EDITOR WIZARD ACTIONS
        // ===========================================================================
     
        /**
         * Initialises the editor in the correct mode.
         *   - `null` → Create mode: resets the draft to a blank template.
         *   - numeric id → Edit mode: loads the type from cache or fetches from API.
         */
    setEditMode(typeId: number | null): void {
        this._validationErrors.set({});
        this._isDirty.set(false);

        if (typeId == null) {
            this._editMode.set('create');
            this._formDraft.set({ ...BLANK_DRAFT });
        } else {
            this._editMode.set('edit');

            // Try the local cache first to avoid a redundant network call
            const cached = this._aircraftTypes().find(t => t.typeId === typeId);
            if (cached) {
                this._formDraft.set({
                    model: cached.model,
                    manufacturer: cached.manufacturer,
                    rangeKm: cached.rangeKm ?? null,
                    maxSeats: cached.maxSeats ?? null,
                    cargoCapacity: cached.cargoCapacity ?? null,
                    cruisingVelocity: cached.cruisingVelocity ?? null,
                });
            } else {
                // Not in cache — load from API and seed the draft when it arrives
                this.loadTypeDetails(typeId);
                // The detail pipeline will set _selectedType; an effect() in the
                // Smart Component can watch selectedAircraftType to seed the form
                // once it arrives (see TypeEditorWizardComponent).
            }
        }
    }

    /**
     * Persists the wizard payload.
     * Orchestrates createAircraftType or updateAircraftType based on editMode.
     * Returns a SaveResult Promise so the Smart Component can react.
     */
    saveAircraftType(
        data: ICreateAircraftTypeDto | IUpdateAircraftTypeDto,
        typeId?: number
    ): Promise<SaveResult> {
        this._isSaving.set(true);
        this._saveError.set(null);
        this._validationErrors.set({});

        const isEdit = this._editMode() === 'edit' && typeId != null;

        const request$ = isEdit
            ? this.typesService.updateAircraftType(typeId!, data as IUpdateAircraftTypeDto)
            : this.typesService.createAircraftType(data as ICreateAircraftTypeDto);

        return new Promise(resolve => {
            request$.pipe(
                catchError(err => {
                    const msg = this._extractApiError(err, isEdit
                        ? 'Failed to update aircraft type.'
                        : 'Failed to create aircraft type.');
                    this._saveError.set(msg);

                    // Attempt to parse structured field-level errors
                    if (err?.error?.errors && typeof err.error.errors === 'object') {
                        this._validationErrors.set(err.error.errors);
                    }

                    this._isSaving.set(false);
                    resolve({ success: false, error: msg });
                    return EMPTY;
                })
            ).subscribe(type => {
                if (isEdit) {
                    this._aircraftTypes.update(list =>
                        list.map(t => (t.typeId === type.typeId ? type : t))
                    );
                    this._selectedType.set(type);
                    this._activeRevision.update(n => n + 1);
                } else {
                    this._aircraftTypes.update(list => [...list, type]);
                }

                this._isSaving.set(false);
                this._isDirty.set(false);
                resolve({ success: true, type });
            });
        });
    }

    /**
     * Updates the in-memory draft as the user types.
     * Also marks the form as dirty to enable the CanDeactivate guard.
     */
    patchDraft(partial: Partial<IFormDraft>): void {
        this._formDraft.update(current => ({ ...current, ...partial }));
        this._isDirty.set(true);
    }

    /**
     * Resets the wizard state and navigates back to the type catalog.
     * Called by the "Discard Changes" action or the CanDeactivate guard.
     */
    discardChanges(): void {
        this._formDraft.set({ ...BLANK_DRAFT });
        this._validationErrors.set({});
        this._saveError.set(null);
        this._isDirty.set(false);
        this.router.navigate([ATA_BASE]);
    }

    // ===========================================================================
    // FLEET RANGE ANALYZER ACTIONS
    // ===========================================================================

    /**
     * Sets the target distance and triggers the suitability API call.
     * The computed `suitabilityResults` will automatically refresh.
     */
    setDistance(distanceKm: number): void {
        if (distanceKm <= 0) return;
        this._analyzerState.update(s => ({ ...s, targetDistanceKm: distanceKm }));
        this._analyzeTrigger$.next(distanceKm);
    }

    /**
     * Toggles between Direct and ETOPS mode.
     * No API call needed — `suitabilityResults` recomputes from local state.
     */
    setRangeMode(mode: RangeMode): void {
        this._analyzerState.update(s => ({ ...s, mode }));
    }

    /**
     * Primary entry point — called by the Smart Component on distance change.
     * Debouncing is handled in the component; this method fires immediately.
     */
    analyzeRange(distanceKm: number): void {
        this.setDistance(distanceKm);
    }

    /**
     * Resets the analyzer to default state without navigation.
     */
    clearAnalysis(): void {
        this._analyzerState.set({ ...DEFAULT_ANALYZER_STATE });
        this._suitableTypes.set([]);
        this._analyzerError.set(null);
        this._isAnalyzing.set(false);
    }

    /**
     * Clears all editor-specific state without navigation.
     * Call from ngOnDestroy of the wizard component.
     */
    clearEditorState(): void {
        this._formDraft.set({ ...BLANK_DRAFT });
        this._validationErrors.set({});
        this._saveError.set(null);
        this._isDirty.set(false);
    }

    // ===========================================================================
    // TYPE ARCHIVE MANAGER ACTIONS
    // ===========================================================================

    /**
     * Loads the full audit history (active + archived types).
     * Safe to call multiple times; debouncing handled in the pipeline.
     */
    loadArchiveData(): void {
        this._archiveTrigger$.next();
    }

    /**
     * Sets the audit table filter mode.
     * Instantly recomputes `filteredAuditRecords` via computed().
     */
    setAuditFilter(mode: AuditFilterMode): void {
        this._auditFilter.set(mode);
    }

    /**
     * Reactivates a soft-deleted aircraft type.
     * On success:
     *   - Updates the local audit list to mark the type as active.
     *   - Bumps activeRevision (for downstream detail views).
     *   - Triggers a success toast.
     *   - Sets restoredTypeId to drive the "slide-in" animation.
     */
    reactivateFromArchive(typeId: number): Promise<{ success: boolean; error?: string }> {
        this._isRestoring.set(true);
        this._restoreError.set(null);
        this._restoredTypeId.set(null);

        return new Promise(resolve => {
            this.typesService.reactivateAircraftType(typeId).pipe(
                catchError(err => {
                    const msg = err?.message ?? 'Failed to reactivate aircraft type.';
                    this._restoreError.set(msg);
                    this._isRestoring.set(false);
                    this._showToast(msg, 'error');
                    resolve({ success: false, error: msg });
                    return EMPTY;
                })
            ).subscribe(success => {
                if (success) {
                    // Mark the type as active in the local audit list
                    this._allTypesIncludingDeleted.update(list =>
                        list.map(t =>
                            t.typeId === typeId
                                ? { ...t, isDeleted: false, deletedAt: undefined }
                                : t
                        )
                    );
                    // Re-sync the active list (full reload)
                    this.loadActiveTypes();
                    this._activeRevision?.update(n => n + 1);
                    this._restoredTypeId.set(typeId);
                    this._showToast(
                        `Aircraft type successfully restored to the active fleet.`,
                        'success'
                    );
                }
                this._isRestoring.set(false);
                resolve({ success });
            });
        });
    }

    /**
     * Clears the archive state when navigating away.
     */
    clearArchiveState(): void {
        this._allTypesIncludingDeleted.set([]);
        this._archiveError.set(null);
        this._restoreError.set(null);
        this._restoredTypeId.set(null);
        this._auditFilter.set('all');
        this._toastMessage.set(null);
        this._toastType.set(null);
    }



    // ── Private Helpers ───────────────────────────────────────────────────────

    private _archiveAndNavigate(typeId: number): void {
        const prev = this._aircraftTypes();
        this._aircraftTypes.update(list => list.filter(t => t.typeId !== typeId));

        this.typesService.deleteAircraftType(typeId).pipe(
            tap(() => this.router.navigate([ATA_BASE])),
            catchError(err => {
                this._aircraftTypes.set(prev);
                this._error.set(err?.message ?? 'Failed to archive aircraft type.');
                return EMPTY;
            })
        ).subscribe();
    }

    private _reactivateAndRefresh(typeId: number): void {
        this.typesService.reactivateAircraftType(typeId).pipe(
            tap(() => {
                this.loadActiveTypes();
                this._activeRevision.update(n => n + 1);
            }),
            catchError(err => {
                this._error.set(err?.message ?? 'Failed to reactivate aircraft type.');
                return EMPTY;
            })
        ).subscribe();
    }

    private _extractApiError(err: unknown, fallback: string): string {
        const e = err as { error?: { errors?: Record<string, string | string[]>; message?: string }; message?: string };
        if (e?.error?.errors && typeof e.error.errors === 'object') {
            return Object.entries<string | string[]>(e.error.errors)
                .map(([field, msgs]) =>
                    `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`
                )
                .join(' · ');
        }
        return e?.error?.message ?? e?.message ?? fallback;
    }


    // Private toast helper
    private _showToast(message: string, type: 'success' | 'error'): void {
        this._toastMessage.set(message);
        this._toastType.set(type);
        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            this._toastMessage.set(null);
            this._toastType.set(null);
        }, 4000);
    }





}