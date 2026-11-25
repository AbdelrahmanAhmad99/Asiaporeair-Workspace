
import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, switchMap, tap, catchError, of, debounceTime, distinctUntilChanged, EMPTY } from 'rxjs';
import { AircraftService } from '@shared-core';
import {
    IAircraftDto,
    IAircraftFilterDto, IAircraftDetailDto,
} from '@shared-core';
import { IPaginatedResult } from '@shared-core';


import { AircraftTypesService } from '@shared-core';
import { IAircraftTypeDto, IUpdateAircraftDto, ICreateAircraftDto } from '@shared-core';
import { Router } from '@angular/router';


// ── Aircraft Operational Status constants ─────────────────────────────────
export const AIRCRAFT_STATUS = {
    ACTIVE: 'ACTIVE',
    MAINTENANCE: 'MAINTENANCE',
    GROUNDED: 'GROUNDED',
    AOG: 'AOG',
    RESERVE: 'RESERVE',
} as const;

export type AircraftStatus = typeof AIRCRAFT_STATUS[keyof typeof AIRCRAFT_STATUS];

// ── Filter shape ──────────────────────────────────────────────────────────
export interface IFleetFilters {
    tailNumber: string;
    status: string;
    typeId: string;
    airlineIataCode: string;
    minFlightHours: number | null;
    maxFlightHours: number | null;
}

// ── Pagination shape ──────────────────────────────────────────────────────
export interface IFleetPagination {
    total: number;
    page: number;
    size: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// ── KPI stats derived from current page ───────────────────────────────────
export interface IFleetStats {
    total: number;
    active: number;
    maintenance: number;
    grounded: number;
    aog: number;
    reserve: number;
}


/** Structured save result returned to Smart Components. */
export interface IRegistrationResult {
    success: boolean;
    tailNumber?: string;
    error?: string;
    /** True if failure was due to an external dependency (e.g., active flight assignment). */
    isConstraint?: boolean;
}

/**
 * Extended audit record — the archive endpoint may return additional
 * soft-delete metadata alongside the base IAircraftDto fields.
 */
export interface IArchivedAircraftDto {
    tailNumber: string;
    airlineIataCode: string;
    airlineName: string;
    aircraftTypeModel?: string;
    aircraftTypeId: number;
    /** Will typically be 'DELETED', 'DECOMMISSIONED', or similar. */
    status: string;
    totalFlightHours?: number;
    acquisitionDate?: string | Date;

    // Archive-specific metadata (may not always be present)
    decommissionedAt?: string;       // ISO 8601 date
    decommissionedByUser?: string;   // Employee ID / username
    archiveReason?: string;          // Free-text reason captured at decommission
    lastFlightDate?: string;         // ISO 8601 date of last recorded operation
}

/** Result shape for reactivation operations. */
export interface IRestoreResult {
    success: boolean;
    tailNumber?: string;
    error?: string;
    /** True when failure is due to a regulatory/data conflict — drives distinct UI state. */
    isConflict?: boolean;
}

// ── Defaults ──────────────────────────────────────────────────────────────
const DEFAULT_FILTERS: IFleetFilters = {
    tailNumber: '',
    status: '',
    typeId: '',
    airlineIataCode: '',
    minFlightHours: null,
    maxFlightHours: null,
};

const DEFAULT_PAGINATION: IFleetPagination = {
    total: 0,
    page: 1,
    size: 20,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
};

// ── Load trigger payload ───────────────────────────────────────────────────
interface ILoadPayload {
    filters: IFleetFilters;
    page: number;
    size: number;
}

@Injectable({ providedIn: 'root' })
export class FleetInventoryStore {
    private readonly aircraftService = inject(AircraftService);

    // ── Private Writable Signals ──────────────────────────────────────────────
    private readonly _aircraftList = signal<IAircraftDto[]>([]);
    private readonly _pagination = signal<IFleetPagination>(DEFAULT_PAGINATION);
    private readonly _filters = signal<IFleetFilters>(DEFAULT_FILTERS);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    // ── Aircraft Profile Hub State ────────────────────────────────────────
    private readonly _selectedAircraftDetails = signal<IAircraftDetailDto | null>(null);
    private readonly _isLoadingProfile = signal<boolean>(false);
    private readonly _profileError = signal<string | null>(null);
    private readonly _isActionProcessing = signal<boolean>(false);
    private readonly _actionError = signal<string | null>(null);
    private readonly _actionSuccess = signal<string | null>(null);


    // ── Registration Wizard State ─────────────────────────────────────────
    private readonly _availableAircraftTypes = signal<IAircraftTypeDto[]>([]);
    private readonly _isLoadingSupportData = signal<boolean>(false);
    private readonly _isSubmitting = signal<boolean>(false);
    private readonly _lastActionError = signal<string | null>(null);
    private readonly _lastActionConstraint = signal<boolean>(false);

    // ── Fleet Archival Center State ────────────────────────────────────────
    private readonly _archivedAircraft = signal<IArchivedAircraftDto[]>([]);
    private readonly _isLoadingArchive = signal<boolean>(false);
    private readonly _archiveLoadError = signal<string | null>(null);
    private readonly _isReactivating = signal<boolean>(false);
    private readonly _auditTrailError = signal<string | null>(null);
    private readonly _auditTrailConflict = signal<boolean>(false);
    private readonly _lastRestoredTail = signal<string | null>(null);   // drives success animation
    private readonly _archiveFilterQuery = signal<string>('');


    // ── the AircraftTypesService injection inside the class ────────────

    // ADD alongside the existing `aircraftService` injection:
    private readonly typesService = inject(AircraftTypesService);
    private readonly router = inject(Router);    // if not already present



    // RxJS subjects for the profile pipeline
    private readonly _profileTrigger$ = new Subject<string>(); // tailNumber
    // ── RxJS Load Trigger ─────────────────────────────────────────────────────
    private readonly _loadTrigger$ = new Subject<ILoadPayload>();
    // RxJS subject for archive load pipeline
    private readonly _archiveTrigger$ = new Subject<void>();

    constructor() {
        this._loadTrigger$
            .pipe(
                debounceTime(150),
                tap(() => {
                    this._loading.set(true);
                    this._error.set(null);
                }),
                switchMap(({ filters, page, size }) => {
                    const dto: IAircraftFilterDto = {
                        ...(filters.airlineIataCode ? { airlineIataCode: filters.airlineIataCode } : {}),
                        ...(filters.typeId ? { aircraftTypeId: parseInt(filters.typeId, 10) } : {}),
                        ...(filters.status ? { status: filters.status } : {}),
                        ...(filters.minFlightHours != null ? { minFlightHours: filters.minFlightHours } : {}),
                        ...(filters.maxFlightHours != null ? { maxFlightHours: filters.maxFlightHours } : {}),
                    };

                    return this.aircraftService.searchAircraft(dto, page, size).pipe(
                        catchError(err => {
                            this._error.set(err?.message ?? 'Failed to load fleet data.');
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

        // ── Aircraft Full Profile pipeline ─────────────────────────────────────
        this._profileTrigger$
            .pipe(
                tap(() => {
                    this._isLoadingProfile.set(true);
                    this._profileError.set(null);
                    this._selectedAircraftDetails.set(null);
                }),
                switchMap(tailNumber =>
                    this.aircraftService.getAircraftDetails(tailNumber).pipe(
                        catchError(err => {
                            const code = err?.status;
                            const msg = code === 404
                                ? `Aircraft with tail number "${tailNumber}" could not be located in the fleet registry.`
                                : (err?.error?.message ?? err?.message ?? 'Technical synchronization failure — fleet profile unavailable.');
                            this._profileError.set(msg);
                            return of(null);
                        })
                    )
                ),
                tap(() => this._isLoadingProfile.set(false)),
                takeUntilDestroyed()
            )
            .subscribe(details => {
                if (details) this._selectedAircraftDetails.set(details);
            });


        // ── Archive load pipeline ──────────────────────────────────────────────
        this._archiveTrigger$
            .pipe(
                tap(() => {
                    this._isLoadingArchive.set(true);
                    this._archiveLoadError.set(null);
                }),
                switchMap(() => {
                    // Fetch aircraft with includeDeleted flag
                    return this.aircraftService.searchAircraft(
                        { includeDeleted: true },
                        1,
                        200    // large page size — archive is rarely >200 records
                    ).pipe(
                        catchError(err => {
                            this._archiveLoadError.set(
                                err?.message ?? 'Archival records could not be retrieved. Fleet history is temporarily unavailable.'
                            );
                            return of({ items: [], totalCount: 0, pageNumber: 1, pageSize: 200, totalPages: 0, hasPreviousPage: false, hasNextPage: false } as IPaginatedResult<IAircraftDto>);
                        })
                    );
                }),
                tap(() => this._isLoadingArchive.set(false)),
                takeUntilDestroyed()
            )
            .subscribe(result => {
                // Filter to only decommissioned/deleted records
                const archived = result.items.filter(a =>
                    a.status?.toUpperCase() !== 'ACTIVE' &&
                    a.status?.toUpperCase() !== 'MAINTENANCE' &&
                    a.status?.toUpperCase() !== 'RESERVE' &&
                    a.status?.toUpperCase() !== 'AOG'
                );
                this._archivedAircraft.set(archived as IArchivedAircraftDto[]);
            });
    }

    // ── Public READ-ONLY Computed Signals ──────────────────────────────────────

    /** KPI stats derived from the currently loaded page. */
    readonly fleetStats = computed<IFleetStats>(() => {
        const list = this._aircraftList();
        return {
            total: list.length,
            active: list.filter(a => a.status?.toUpperCase() === AIRCRAFT_STATUS.ACTIVE).length,
            maintenance: list.filter(a => a.status?.toUpperCase() === AIRCRAFT_STATUS.MAINTENANCE).length,
            grounded: list.filter(a => a.status?.toUpperCase() === AIRCRAFT_STATUS.GROUNDED ||
                a.status?.toUpperCase() === AIRCRAFT_STATUS.AOG).length,
            aog: list.filter(a => a.status?.toUpperCase() === AIRCRAFT_STATUS.AOG).length,
            reserve: list.filter(a => a.status?.toUpperCase() === AIRCRAFT_STATUS.RESERVE).length,
        };
    });




    /** Archived records filtered by the current search query. */
    readonly filteredArchivedAircraft = computed<IArchivedAircraftDto[]>(() => {
        const all = this._archivedAircraft();
        const query = this._archiveFilterQuery().toLowerCase().trim();
        if (!query) return all;
        return all.filter(a =>
            a.tailNumber.toLowerCase().includes(query) ||
            (a.aircraftTypeModel ?? '').toLowerCase().includes(query) ||
            (a.airlineName ?? '').toLowerCase().includes(query) ||
            (a.archiveReason ?? '').toLowerCase().includes(query)
        );
    });


    // Primitive read-only signals
    readonly aircraftList = this._aircraftList.asReadonly();
    readonly pagination = this._pagination.asReadonly();
    readonly filters = this._filters.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly error = this._error.asReadonly();

    readonly selectedAircraftDetails = this._selectedAircraftDetails.asReadonly();
    readonly isLoadingProfile = this._isLoadingProfile.asReadonly();
    readonly profileError = this._profileError.asReadonly();
    readonly isActionProcessing = this._isActionProcessing.asReadonly();
    readonly actionError = this._actionError.asReadonly();
    readonly actionSuccess = this._actionSuccess.asReadonly();


    readonly availableAircraftTypes = this._availableAircraftTypes.asReadonly();
    readonly isLoadingSupportData = this._isLoadingSupportData.asReadonly();
    readonly isSubmitting = this._isSubmitting.asReadonly();
    readonly lastActionError = this._lastActionError.asReadonly();
    readonly lastActionConstraint = this._lastActionConstraint.asReadonly();

    /** Total count for the header badge. */
    readonly archivedCount = computed(() => this._archivedAircraft().length);

    // Primitive signals
    readonly archivedAircraft = this._archivedAircraft.asReadonly();
    readonly isLoadingArchive = this._isLoadingArchive.asReadonly();
    readonly archiveLoadError = this._archiveLoadError.asReadonly();
    readonly isReactivating = this._isReactivating.asReadonly();
    readonly auditTrailError = this._auditTrailError.asReadonly();
    readonly auditTrailConflict = this._auditTrailConflict.asReadonly();
    readonly lastRestoredTail = this._lastRestoredTail.asReadonly();
    readonly archiveFilterQuery = this._archiveFilterQuery.asReadonly();
    // ── Actions ───────────────────────────────────────────────────────────────

    /** Initial load — called from the Smart Component on ngOnInit. */
    loadFleet(filters?: Partial<IFleetFilters>, page = 1): void {
        if (filters) {
            this._filters.update(current => ({ ...current, ...filters }));
        }
        const current = this._filters();
        this._loadTrigger$.next({ filters: current, page, size: this._pagination().size });
    }

    /** Patches the filter state and re-triggers the search from page 1. */
    updateFilters(partial: Partial<IFleetFilters>): void {
        this._filters.update(current => ({ ...current, ...partial }));
        const updated = this._filters();
        this._loadTrigger$.next({ filters: updated, page: 1, size: this._pagination().size });
    }

    /** Navigates to the next page. */
    nextPage(): void {
        const p = this._pagination();
        if (!p.hasNext) return;
        this._loadTrigger$.next({ filters: this._filters(), page: p.page + 1, size: p.size });
        this._pagination.update(s => ({ ...s, page: s.page + 1 }));
    }

    /** Navigates to the previous page. */
    prevPage(): void {
        const p = this._pagination();
        if (!p.hasPrev) return;
        this._loadTrigger$.next({ filters: this._filters(), page: p.page - 1, size: p.size });
        this._pagination.update(s => ({ ...s, page: s.page - 1 }));
    }

    /** Goes directly to a specific page. */
    goToPage(page: number): void {
        const p = this._pagination();
        if (page < 1 || page > p.totalPages) return;
        this._loadTrigger$.next({ filters: this._filters(), page, size: p.size });
        this._pagination.update(s => ({ ...s, page }));
    }

    /** Reloads the current view (same page + same filters). */
    refreshData(): void {
        const { page, size } = this._pagination();
        this._loadTrigger$.next({ filters: this._filters(), page, size });
    }

    /** Resets filters to defaults and reloads from page 1. */
    resetFilters(): void {
        this._filters.set({ ...DEFAULT_FILTERS });
        this._loadTrigger$.next({
            filters: DEFAULT_FILTERS,
            page: 1,
            size: this._pagination().size,
        });
    }

    /** Updates the page size and reloads from page 1. */
    setPageSize(size: number): void {
        this._pagination.update(s => ({ ...s, size, page: 1 }));
        this._loadTrigger$.next({ filters: this._filters(), page: 1, size });
    }



    // ===========================================================================
    // AIRCRAFT PROFILE HUB ACTIONS
    // ===========================================================================

    /**
     * Triggers a full profile load for the given tail number.
     * Populates `selectedAircraftDetails`.
     */
    loadAircraftFullProfile(tailNumber: string): void {
        this._profileTrigger$.next(tailNumber);
    }

    /**
     * Clears all profile state — call in ngOnDestroy of the Profile Hub.
     */
    clearAircraftProfile(): void {
        this._selectedAircraftDetails.set(null);
        this._profileError.set(null);
        this._actionError.set(null);
        this._actionSuccess.set(null);
        this._isActionProcessing.set(false);
    }

    /** Clear action feedback messages (for manual dismissal). */
    clearActionFeedback(): void {
        this._actionError.set(null);
        this._actionSuccess.set(null);
    }

    /**
     * Logs additional flight hours to the aircraft record.
     * On success: refreshes the full profile and fires a success toast.
     * On error: sets a user-readable `actionError` message.
     */
    logFlightHours(tailNumber: string, hoursToAdd: number): Promise<boolean> {
        this._isActionProcessing.set(true);
        this._actionError.set(null);
        this._actionSuccess.set(null);

        return new Promise(resolve => {
            this.aircraftService.addFlightHours(tailNumber, { hoursToAdd }).pipe(
                catchError(err => {
                    const msg = this._extractProfileApiError(
                        err,
                        'Flight-hour synchronization could not be completed. Please verify the entry and retry.'
                    );
                    this._actionError.set(msg);
                    this._isActionProcessing.set(false);
                    resolve(false);
                    return EMPTY;
                })
            ).subscribe(result => {
                const newTotal = result?.newTotalHours ?? 0;
                // Update the local cached detail without a full round-trip if possible
                this._selectedAircraftDetails.update(d =>
                    d ? { ...d, totalFlightHours: newTotal } : d
                );
                this._actionSuccess.set(
                    `Operational records synchronized — ${hoursToAdd.toFixed(1)} hours logged. Total: ${newTotal.toLocaleString()} hrs.`
                );
                this._isActionProcessing.set(false);
                // Re-load full profile in background to pick up any server-side changes
                this.loadAircraftFullProfile(tailNumber);
                resolve(true);
            });
        });
    }

    /**
     * Updates the operational status of an aircraft.
     * On success: refreshes the full profile.
     * On error: provides a concierge-tone error description.
     */
    updateAircraftStatus(tailNumber: string, status: string, reason?: string): Promise<boolean> {
        this._isActionProcessing.set(true);
        this._actionError.set(null);
        this._actionSuccess.set(null);

        return new Promise(resolve => {
            this.aircraftService.updateAircraftStatus(tailNumber, { status }).pipe(
                catchError(err => {
                    const code = err?.status;
                    let msg: string;

                    if (code === 409) {
                        msg = 'Operational constraint detected — the requested status change conflicts with an active flight assignment. Resolve the scheduling conflict before proceeding.';
                    } else if (code === 422) {
                        msg = 'Status transition validation failed — the specified configuration is not permitted for this aircraft class.';
                    } else {
                        msg = this._extractProfileApiError(
                            err,
                            'Status update could not be completed. A technical synchronization failure occurred.'
                        );
                    }

                    this._actionError.set(msg);
                    this._isActionProcessing.set(false);
                    resolve(false);
                    return EMPTY;
                })
            ).subscribe(() => {
                this._selectedAircraftDetails.update(d =>
                    d ? { ...d, status } : d
                );
                this._actionSuccess.set(
                    `Operational status updated to "${status}"${reason ? ` — Reason recorded` : ''}. Fleet registry synchronized.`
                );
                this._isActionProcessing.set(false);
                this.loadAircraftFullProfile(tailNumber);
                resolve(true);
            });
        });
    }

    // ===========================================================================
    // AIRCRAFT REGISTRATION WIZARD ACTIONS
    // ===========================================================================

    /**
     * Fetches all active aircraft types to populate the Type dropdown.
     * Safe to call multiple times — checks cache before loading.
     */
    loadSupportData(): void {
        if (this._availableAircraftTypes().length > 0) return; // already cached

        this._isLoadingSupportData.set(true);
        this.typesService.getAllActiveAircraftTypes().pipe(
            catchError(err => {
                this._lastActionError.set(
                    err?.message ?? 'Failed to load aircraft type catalogue. Support data unavailable.'
                );
                return of([]);
            }),
            tap(() => this._isLoadingSupportData.set(false))
        ).subscribe(types => this._availableAircraftTypes.set(types));
    }

    /**
     * Clears wizard-related error state.
     * Call when re-opening the form or on dismiss of error banners.
     */
    clearWizardErrors(): void {
        this._lastActionError.set(null);
        this._lastActionConstraint.set(false);
    }

    /**
     * Creates a new aircraft record.
     * On success: navigates to the fleet inventory dashboard.
     * On error: populates `lastActionError` with a concierge-tone message.
     */
    registerAircraft(dto: ICreateAircraftDto): Promise<IRegistrationResult> {
        this._isSubmitting.set(true);
        this._lastActionError.set(null);
        this._lastActionConstraint.set(false);

        return new Promise(resolve => {
            this.aircraftService.createAircraft(dto).pipe(
                catchError(err => {
                    const code = err?.status;
                    let msg: string;
                    let isConstraint = false;

                    if (code === 409) {
                        msg = `A registration conflict was detected — tail number "${dto.tailNumber}" is already assigned to an existing fleet record.`;
                        isConstraint = true;
                    } else if (code === 422) {
                        msg = this._extractWizardApiError(err, 'The submitted registration data failed validation. Please review all fields and retry.');
                    } else {
                        msg = this._extractWizardApiError(err, 'Aircraft registration could not be completed. A technical barrier was encountered during submission.');
                    }

                    this._lastActionError.set(msg);
                    this._lastActionConstraint.set(isConstraint);
                    this._isSubmitting.set(false);
                    resolve({ success: false, error: msg, isConstraint });
                    return EMPTY;
                })
            ).subscribe(aircraft => {
                this._aircraftList.update(list => [aircraft, ...list]);
                this._isSubmitting.set(false);
                resolve({ success: true, tailNumber: aircraft.tailNumber });
            });
        });
    }

    /**
     * Updates an existing aircraft record.
     * On success: refreshes the local list and the profile cache.
     */
    updateAircraftRecords(tailNumber: string, dto: IUpdateAircraftDto): Promise<IRegistrationResult> {
        this._isSubmitting.set(true);
        this._lastActionError.set(null);
        this._lastActionConstraint.set(false);

        return new Promise(resolve => {
            this.aircraftService.updateAircraft(tailNumber, dto).pipe(
                catchError(err => {
                    const msg = this._extractWizardApiError(
                        err,
                        'Aircraft record update could not be completed. Verify the submitted data and retry.'
                    );
                    this._lastActionError.set(msg);
                    this._isSubmitting.set(false);
                    resolve({ success: false, error: msg });
                    return EMPTY;
                })
            ).subscribe(aircraft => {
                // Update local list in-place
                this._aircraftList.update(list =>
                    list.map(a => a.tailNumber === tailNumber ? aircraft : a)
                );
                // Re-sync the profile detail if it is the currently viewed aircraft
                if (this._selectedAircraftDetails()?.tailNumber === tailNumber) {
                    this._selectedAircraftDetails.update(d => d ? { ...d, ...aircraft } : d);
                }
                this._isSubmitting.set(false);
                resolve({ success: true, tailNumber });
            });
        });
    }

    /**
     * Soft-deletes (decommissions) an aircraft.
     * HTTP 409/412 = active assignment constraint — captured and surfaced.
     * On success: triggers a full fleet reload.
     */
    decommissionAircraft(tailNumber: string): Promise<IRegistrationResult> {
        this._isSubmitting.set(true);
        this._lastActionError.set(null);
        this._lastActionConstraint.set(false);

        return new Promise(resolve => {
            this.aircraftService.deleteAircraft(tailNumber).pipe(
                catchError(err => {
                    const code = err?.status;
                    let msg: string;
                    let isConstraint = false;

                    if (code === 409 || code === 412) {
                        msg = `Decommissioning was blocked — technical barrier detected. Aircraft "${tailNumber}" has active flight assignments or scheduled maintenance records. Resolve all dependencies before proceeding.`;
                        isConstraint = true;
                    } else if (code === 404) {
                        msg = `Tail number "${tailNumber}" could not be located in the active fleet registry.`;
                    } else {
                        msg = this._extractProfileApiError(
                            err,
                            `Aircraft decommissioning encountered an unexpected failure. The operation could not be completed for tail number "${tailNumber}".`
                        );
                    }

                    this._lastActionError.set(msg);
                    this._lastActionConstraint.set(isConstraint);
                    this._isSubmitting.set(false);
                    resolve({ success: false, error: msg, isConstraint });
                    return EMPTY;
                })
            ).subscribe(() => {
                this._isSubmitting.set(false);
                this.loadFleet(); // Refresh the parent list
                resolve({ success: true, tailNumber });
            });
        });
    }

    // ===========================================================================
    // FLEET ARCHIVAL CENTER ACTIONS
    // ===========================================================================

    /**
     * Loads all decommissioned aircraft for the archive view.
     * Safe to call multiple times — triggers the reactive pipeline.
     */
    loadArchivedFleet(): void {
        this._archiveTrigger$.next();
    }

    /**
     * Filters the archived list client-side (instant UX — no API call).
     */
    setArchiveFilter(query: string): void {
        this._archiveFilterQuery.set(query);
    }

    /** Clears archive-specific error state. */
    clearAuditTrailError(): void {
        this._auditTrailError.set(null);
        this._auditTrailConflict.set(false);
    }

    /** Clear the last restored tail number (dismiss success animation). */
    clearRestoredTail(): void {
        this._lastRestoredTail.set(null);
    }

    /** Clears all archival center state — call from ngOnDestroy. */
    clearArchivalState(): void {
        this._archivedAircraft.set([]);
        this._archiveLoadError.set(null);
        this._auditTrailError.set(null);
        this._auditTrailConflict.set(false);
        this._lastRestoredTail.set(null);
        this._archiveFilterQuery.set('');
    }


    restoreAircraft(tailNumber: string): Promise<IRestoreResult> {
        this._isReactivating.set(true);
        this._auditTrailError.set(null);
        this._auditTrailConflict.set(false);

        return new Promise(resolve => {
            this.aircraftService.reactivateAircraft(tailNumber).pipe(
                catchError(err => {
                    const code = err?.status;
                    let msg: string;
                    let isConflict = false;

                    if (code === 409) {
                        msg = `Sync Failure: Aircraft "${tailNumber}" is already associated with an active fleet record. Verify registry integrity before proceeding.`;
                        isConflict = true;
                    } else if (code === 422) {
                        msg = `Regulatory Compliance Pending: Aircraft "${tailNumber}" cannot be re-entered into service — outstanding certification or maintenance obligations must be resolved first.`;
                        isConflict = true;
                    } else if (code === 404) {
                        msg = `Archive record for "${tailNumber}" could not be located. The entry may have already been removed from the system.`;
                    } else {
                        msg = this._extractArchiveApiError(
                            err,
                            `Service restoration for "${tailNumber}" encountered an unexpected operational barrier. Contact fleet administration if this issue persists.`
                        );
                    }

                    this._auditTrailError.set(msg);
                    this._auditTrailConflict.set(isConflict);
                    this._isReactivating.set(false);
                    resolve({ success: false, error: msg, isConflict });
                    return EMPTY;
                })
            ).subscribe(() => {
                // Remove from local archive list
                this._archivedAircraft.update(list =>
                    list.filter(a => a.tailNumber !== tailNumber)
                );
                // Re-sync the active fleet
                this.loadFleet();
                // Signal success for animation
                this._lastRestoredTail.set(tailNumber);
                this._isReactivating.set(false);
                resolve({ success: true, tailNumber });
            });
        });
    }

    // Private helper — profile-specific error extractor with concierge tone
    private _extractProfileApiError(err: unknown, fallback: string): string {
        const e = err as { status?: number; error?: { message?: string; errors?: Record<string, string | string[]> }; message?: string };
        if (e?.error?.errors && typeof e.error.errors === 'object') {
            return Object.entries<string | string[]>(e.error.errors)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                .join(' · ');
        }
        return e?.error?.message ?? e?.message ?? fallback;
    }


    // Private helper — concierge-tone API error extraction
    private _extractWizardApiError(err: unknown, fallback: string): string {
        const e = err as {
            status?: number;
            error?: { message?: string; errors?: Record<string, string | string[]> };
            message?: string;
        };
        if (e?.error?.errors && typeof e.error.errors === 'object') {
            return Object.entries<string | string[]>(e.error.errors)
                .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                .join(' · ');
        }
        return e?.error?.message ?? e?.message ?? fallback;
    }


    // Private helper — concierge-tone error extraction
    private _extractArchiveApiError(err: unknown, fallback: string): string {
        const e = err as {
            error?: { message?: string; errors?: Record<string, string | string[]> };
            message?: string;
        };
        if (e?.error?.errors && typeof e.error.errors === 'object') {
            return Object.entries<string | string[]>(e.error.errors)
                .map(([f, msgs]) => `${f}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                .join(' · ');
        }
        return e?.error?.message ?? e?.message ?? fallback;
    }
}