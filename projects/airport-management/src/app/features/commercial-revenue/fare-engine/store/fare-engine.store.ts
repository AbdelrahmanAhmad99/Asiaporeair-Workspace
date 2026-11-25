
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { FaresService } from '@shared-core';
import {
    IFareBasisCodeDto,
    ICreateFareBasisCodeDto,
    IUpdateFareBasisCodeDto,
} from '@shared-core';
import { IPaginatedResult } from '@shared-core';



// ── Search criteria contract ───────────────────────────────────────────────
export interface IFareSearchCriteria {
    description: string;
    cabinClass: string;
    pageNumber: number;
    pageSize: number;
}

const DEFAULT_CRITERIA: IFareSearchCriteria = {
    description: '',
    cabinClass: '',
    pageNumber: 1,
    pageSize: 20,
};

// ── Pagination metadata ────────────────────────────────────────────────────
export interface IFarePagination {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

const DEFAULT_PAGINATION: IFarePagination = {
    currentPage: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
};

// ── Base route ─────────────────────────────────────────────────────────────
const FARE_ENGINE_BASE = '/aoms/commercial-revenue/fare-engine';

@Injectable({ providedIn: 'root' })
export class FareEngineStore {
    private readonly faresSvc = inject(FaresService);
    private readonly router = inject(Router);

    // ── Private writable signals ───────────────────────────────────────────
    private readonly _fares = signal<IFareBasisCodeDto[]>([]);
    private readonly _pagination = signal<IFarePagination>(DEFAULT_PAGINATION);
    private readonly _searchFilters = signal<IFareSearchCriteria>(DEFAULT_CRITERIA);
    private readonly _isLoading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);
    private readonly _actionProcessing = signal<boolean>(false);
    private readonly _actionSuccess = signal<string | null>(null);
    private readonly _focusedCode = signal<string | null>(null);

    // ── Public read-only signals ───────────────────────────────────────────
    readonly fares = this._fares.asReadonly();
    readonly pagination = this._pagination.asReadonly();
    readonly searchFilters = this._searchFilters.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly error = this._error.asReadonly();
    readonly actionProcessing = this._actionProcessing.asReadonly();
    readonly actionSuccess = this._actionSuccess.asReadonly();
    readonly focusedCode = this._focusedCode.asReadonly();

    // ── Computed signals ───────────────────────────────────────────────────
    readonly hasActiveFares = computed(() => this._fares().length > 0);
    readonly hasActiveSearch = computed(
        () =>
            this._searchFilters().description.trim().length > 0 ||
            this._searchFilters().cabinClass.trim().length > 0
    );
    readonly recordCountLabel = computed(() => {
        const { total, currentPage, pageSize } = this._pagination();
        if (total === 0) return 'No fare codes found';
        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, total);
        return `Showing ${start}–${end} of ${total} fare codes`;
    });

    // ── Configurator private signals ──────────────────────────────────────
    private readonly _selectedFare = signal<IFareBasisCodeDto | null>(null);
    private readonly _isSaving = signal<boolean>(false);
    private readonly _isFetchingFare = signal<boolean>(false);
    private readonly _configuratorError = signal<string | null>(null);
    private readonly _saveSuccess = signal<string | null>(null);

    // ── Configurator public read-only signals ──────────────────────────────
    readonly selectedFare = this._selectedFare.asReadonly();
    readonly isSaving = this._isSaving.asReadonly();
    readonly isFetchingFare = this._isFetchingFare.asReadonly();
    readonly configuratorError = this._configuratorError.asReadonly();
    readonly saveSuccess = this._saveSuccess.asReadonly();

    // ── Configurator computed signals ──────────────────────────────────────
    /** True when editing an existing fare (as opposed to creating a new one). */
    readonly isEditMode = computed(() => this._selectedFare() !== null);

    // ── Subscriptions registry ────────────────────────────────────────────
    private _activeSub: Subscription | null = null;

    // ══════════════════════════════════════════════════════════════════════
    // Actions
    // ══════════════════════════════════════════════════════════════════════

    /** Load the full active inventory (no search params). */
    loadAllActiveFares(): void {
        this._cancelActiveSub();
        this._isLoading.set(true);
        this._error.set(null);

        this._activeSub = this.faresSvc
            .getAllActiveFares()
            .pipe(
                catchError(err => {
                    this._handleError(err, 'loadAllActiveFares');
                    return EMPTY;
                }),
                finalize(() => this._isLoading.set(false))
            )
            .subscribe(fares => {
                this._fares.set(fares);
                this._pagination.set({
                    currentPage: 1,
                    pageSize: DEFAULT_CRITERIA.pageSize,
                    total: fares.length,
                    totalPages: Math.ceil(fares.length / DEFAULT_CRITERIA.pageSize),
                });
                this._searchFilters.set(DEFAULT_CRITERIA);
            });
    }

    /** Execute a paginated search against the API. */
    searchFares(criteria: Partial<IFareSearchCriteria>): void {
        const merged: IFareSearchCriteria = {
            ...this._searchFilters(),
            ...criteria,
            pageNumber: criteria.pageNumber ?? 1, // reset to page 1 on new criteria
        };
        this._searchFilters.set(merged);
        this._cancelActiveSub();
        this._isLoading.set(true);
        this._error.set(null);

        this._activeSub = this.faresSvc
            .searchFares(merged.pageNumber, merged.pageSize, merged.description || undefined)
            .pipe(
                catchError(err => {
                    this._handleError(err, 'searchFares');
                    return EMPTY;
                }),
                finalize(() => this._isLoading.set(false))
            )
            .subscribe((result: IPaginatedResult<IFareBasisCodeDto>) => {
                this._fares.set(result.items ?? []);
                this._pagination.set({
                    currentPage: result.pageNumber ?? merged.pageNumber,
                    pageSize: result.pageSize ?? merged.pageSize,
                    total: result.totalCount ?? 0,
                    totalPages: result.totalPages ?? 0,
                });
            });
    }

    /** Paginate forward. */
    nextPage(): void {
        const { currentPage, totalPages } = this._pagination();
        if (currentPage >= totalPages) return;
        this.searchFares({ pageNumber: currentPage + 1 });
    }

    /** Paginate backward. */
    prevPage(): void {
        const { currentPage } = this._pagination();
        if (currentPage <= 1) return;
        this.searchFares({ pageNumber: currentPage - 1 });
    }

    /** Jump to explicit page. */
    goToPage(page: number): void {
        this.searchFares({ pageNumber: page });
    }

    /** Reset filters and reload full inventory. */
    resetFilters(): void {
        this._searchFilters.set(DEFAULT_CRITERIA);
        this.loadAllActiveFares();
    }

    /**
     * Optimistic deletion — removes the fare from state immediately,
     * calls the API, and rolls back + shows error if it fails.
     */
    async deleteFare(code: string): Promise<boolean> {
        const snapshot = this._fares();
        this._focusedCode.set(code);
        this._actionProcessing.set(true);
        this._error.set(null);

        // Optimistic remove
        this._fares.update(list => list.filter(f => f.code !== code));

        return new Promise<boolean>(resolve => {
            this.faresSvc
                .deleteFareCode(code)
                .pipe(
                    catchError(err => {
                        // Rollback
                        this._fares.set(snapshot);
                        this._handleError(err, 'deleteFare');
                        resolve(false);
                        return EMPTY;
                    }),
                    finalize(() => {
                        this._actionProcessing.set(false);
                        this._focusedCode.set(null);
                    })
                )
                .subscribe(() => {
                    this._actionSuccess.set(`Fare code ${code} has been deactivated successfully.`);
                    this._clearSuccessAfterDelay();
                    resolve(true);
                });
        });
    }

    /** Reactivate a soft-deleted fare and refresh. */
    reactivateFare(code: string): void {
        this._focusedCode.set(code);
        this._actionProcessing.set(true);

        this.faresSvc
            .reactivateFareCode(code)
            .pipe(
                catchError(err => {
                    this._handleError(err, 'reactivateFare');
                    return EMPTY;
                }),
                finalize(() => {
                    this._actionProcessing.set(false);
                    this._focusedCode.set(null);
                })
            )
            .subscribe(() => {
                this._actionSuccess.set(`Fare code ${code} has been reactivated.`);
                this._clearSuccessAfterDelay();
                this.loadAllActiveFares();
            });
    }

    /** Clear any persisted action state (call on modal close/cancel). */
    clearActionState(): void {
        this._error.set(null);
        this._actionSuccess.set(null);
        this._actionProcessing.set(false);
        this._focusedCode.set(null);
    }

    // ══════════════════════════════════════════════════════════════════════
    // Configurator Actions
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Fetch a single fare by code and populate `selectedFare` for editing.
     * Used by FarePolicyConfiguratorComponent on init when a :code param exists.
     */
    getFareDetails(code: string): void {
        this._isFetchingFare.set(true);
        this._configuratorError.set(null);
        this._selectedFare.set(null);

        this.faresSvc
            .getFareByCode(code)
            .pipe(
                catchError(err => {
                    this._handleConfiguratorError(err, 'getFareDetails');
                    return EMPTY;
                }),
                finalize(() => this._isFetchingFare.set(false))
            )
            .subscribe(fare => {
                this._selectedFare.set(fare);
            });
    }

    /**
     * Create a new fare basis code.
     * Returns Promise<boolean> so the smart component can navigate away on success.
     */
    async createFare(payload: ICreateFareBasisCodeDto): Promise<boolean> {
        this._isSaving.set(true);
        this._configuratorError.set(null);

        return new Promise<boolean>(resolve => {
            this.faresSvc
                .createFareCode(payload)
                .pipe(
                    catchError(err => {
                        this._handleConfiguratorError(err, 'createFare');
                        resolve(false);
                        return EMPTY;
                    }),
                    finalize(() => this._isSaving.set(false))
                )
                .subscribe(created => {
                    this._selectedFare.set(created);
                    this._saveSuccess.set(`Fare code "${created.code}" has been created successfully.`);
                    this._clearSaveSuccessAfterDelay();
                    resolve(true);
                });
        });
    }

    /**
     * Update an existing fare basis code.
     * Returns Promise<boolean> so the smart component can react.
     */
    async updateFare(code: string, payload: IUpdateFareBasisCodeDto): Promise<boolean> {
        this._isSaving.set(true);
        this._configuratorError.set(null);

        return new Promise<boolean>(resolve => {
            this.faresSvc
                .updateFareCode(code, payload)
                .pipe(
                    catchError(err => {
                        this._handleConfiguratorError(err, 'updateFare');
                        resolve(false);
                        return EMPTY;
                    }),
                    finalize(() => this._isSaving.set(false))
                )
                .subscribe(updated => {
                    this._selectedFare.set(updated);
                    this._saveSuccess.set(`Fare code "${code}" has been updated successfully.`);
                    this._clearSaveSuccessAfterDelay();
                    resolve(true);
                });
        });
    }

    /** Clear configurator state — call on component destroy or form cancel. */
    clearConfiguratorState(): void {
        this._selectedFare.set(null);
        this._configuratorError.set(null);
        this._saveSuccess.set(null);
        this._isSaving.set(false);
        this._isFetchingFare.set(false);
    }

    // ── Navigation helpers ─────────────────────────────────────────────────

    navigateToConfigurator(code?: string): void {
        if (code) {
            this.router.navigate([FARE_ENGINE_BASE, 'configurator', code]);
        } else {
            this.router.navigate([FARE_ENGINE_BASE, 'configurator']);
        }
    }

    navigateToAuditArchive(): void {
        this.router.navigate([FARE_ENGINE_BASE, 'audit-archive']);
    }




    // ── Private helpers ────────────────────────────────────────────────────

    private _cancelActiveSub(): void {
        if (this._activeSub && !this._activeSub.closed) {
            this._activeSub.unsubscribe();
        }
        this._activeSub = null;
    }

    /**
     * Sophisticated error mapper — translates HTTP status codes and known
     * backend error strings into clear, operator-facing messages.
     */
    private _handleError(err: unknown, context: string): void {
        const httpErr = err as { status?: number; error?: { message?: string } };
        let message: string;

        switch (httpErr?.status) {
            case 400:
                message =
                    httpErr.error?.message ??
                    'The request contained invalid data. Please review the criteria and retry.';
                break;
            case 401:
                message = 'Your session has expired. Please re-authenticate to continue.';
                break;
            case 403:
                message = 'Access Denied — You do not have clearance to perform this operation.';
                break;
            case 404:
                message = 'The requested fare code could not be located in the system.';
                break;
            case 409:
                message =
                    'A conflict was detected — this fare code may already be linked to active pricing rules.';
                break;
            case 422:
                message =
                    httpErr.error?.message ??
                    'Validation failure: one or more fare parameters are outside permitted bounds.';
                break;
            case 500:
                message = 'A critical engine fault occurred. Please contact the operations support team.';
                break;
            case 503:
                message = 'The Pricing Engine is temporarily offline. Retry in a few moments.';
                break;
            default:
                message =
                    httpErr.error?.message ??
                    `An unexpected error occurred during ${context}. Please try again.`;
        }

        console.error(`[FareEngineStore::${context}]`, err);
        this._error.set(message);
    }

    private _clearSuccessAfterDelay(): void {
        setTimeout(() => this._actionSuccess.set(null), 4000);
    }

    /**
  * Separate error handler for configurator operations — writes to
  * `_configuratorError` instead of the inventory `_error` signal,
  * so the two surfaces never bleed into each other.
  */
    private _handleConfiguratorError(err: unknown, context: string): void {
        const httpErr = err as { status?: number; error?: { message?: string } };
        let message: string;

        switch (httpErr?.status) {
            case 400:
                message =
                    httpErr.error?.message ??
                    'The submission contained invalid data. Please review all fields and retry.';
                break;
            case 401:
                message = 'Your session has expired. Please re-authenticate to continue.';
                break;
            case 403:
                message = 'Access Denied — You do not have clearance to write fare configurations.';
                break;
            case 404:
                message = 'The fare code you are trying to edit no longer exists in the system.';
                break;
            case 409:
                message =
                    'Conflict — a fare code with this identifier already exists. Use a unique code.';
                break;
            case 422:
                message =
                    httpErr.error?.message ??
                    'Validation failure: one or more policy parameters are outside permitted bounds.';
                break;
            case 500:
                message = 'A critical engine fault occurred. Please contact the operations support team.';
                break;
            case 503:
                message = 'The Pricing Engine is temporarily offline. Retry in a few moments.';
                break;
            default:
                message =
                    httpErr.error?.message ??
                    `An unexpected error occurred during ${context}. Please try again.`;
        }

        console.error(`[FareEngineStore::${context}]`, err);
        this._configuratorError.set(message);
    }

    private _clearSaveSuccessAfterDelay(): void {
        setTimeout(() => this._saveSuccess.set(null), 5000);
    }


    // ══════════════════════════════════════════════════════════════════════
    // Audit Archive — Phase 3 Additions
    // ══════════════════════════════════════════════════════════════════════

    // ── Private writable signals ─────────────────────────────────────────
    private readonly _auditFares = signal<IFareBasisCodeDto[]>([]);
    private readonly _isAuditLoading = signal<boolean>(false);
    private readonly _auditError = signal<string | null>(null);
    private readonly _reactivationSuccess = signal<string | null>(null);
    private readonly _reactivatingCode = signal<string | null>(null);

    // ── Public read-only signals ─────────────────────────────────────────
    readonly auditFares = this._auditFares.asReadonly();
    readonly isAuditLoading = this._isAuditLoading.asReadonly();
    readonly auditError = this._auditError.asReadonly();
    readonly reactivationSuccess = this._reactivationSuccess.asReadonly();
    readonly reactivatingCode = this._reactivatingCode.asReadonly();

    // ── Computed signals ─────────────────────────────────────────────────
    /** Total count of fare codes currently in a deleted/inactive state. */
    readonly deletedFaresCount = computed(
        () => this._auditFares().filter(f => !f.isActive).length
    );

    /** Total count of active fare codes in the archive view. */
    readonly activeFaresCount = computed(
        () => this._auditFares().filter(f => f.isActive).length
    );

    // ── Actions ──────────────────────────────────────────────────────────

    /**
     * Load the full audit archive — includes both active and soft-deleted fares.
     * Calls getAllFaresIncludingDeleted and updates the _auditFares signal.
     */
    loadAuditArchive(): void {
        this._isAuditLoading.set(true);
        this._auditError.set(null);

        this.faresSvc
            .getAllFaresIncludingDeleted()
            .pipe(
                catchError(err => {
                    this._handleAuditError(err, 'loadAuditArchive');
                    return EMPTY;
                }),
                finalize(() => this._isAuditLoading.set(false))
            )
            .subscribe(fares => {
                // Sort: deleted records first (for audit prominence), then active
                const sorted = [...fares].sort((a, b) => {
                    if (a.isActive === b.isActive) return 0;
                    return a.isActive ? 1 : -1;
                });
                this._auditFares.set(sorted);
            });
    }

    /**
     * Reactivate a soft-deleted fare code.
     * On success: patches the local audit list (optimistic update) + shows toast.
     * Returns Promise<boolean> so the smart component can close the modal.
     */
    async reactivateArchivedFare(code: string): Promise<boolean> {
        this._reactivatingCode.set(code);
        this._auditError.set(null);

        return new Promise<boolean>(resolve => {
            this.faresSvc
                .reactivateFareCode(code)
                .pipe(
                    catchError(err => {
                        this._handleAuditError(err, 'reactivateArchivedFare');
                        resolve(false);
                        return EMPTY;
                    }),
                    finalize(() => this._reactivatingCode.set(null))
                )
                .subscribe(() => {
                    // Patch the local audit list — flip isActive to true immediately
                    this._auditFares.update(list =>
                        list.map(f => (f.code === code ? { ...f, isActive: true } : f))
                    );
                    this._reactivationSuccess.set(
                        `Fare code ${code} successfully restored to active inventory.`
                    );
                    this._clearReactivationSuccessAfterDelay();
                    resolve(true);
                });
        });
    }

    /** Clear audit surface state — call on component destroy. */
    clearAuditState(): void {
        this._auditError.set(null);
        this._reactivationSuccess.set(null);
        this._reactivatingCode.set(null);
    }

    // ── Navigation helper ─────────────────────────────────────────────────
    navigateToInventory(): void {
        this.router.navigate([FARE_ENGINE_BASE]);
    }

    // ── Private audit error handler ───────────────────────────────────────
    /**
     * Dedicated audit error handler — writes to `_auditError` so the
     * archive surface never bleeds into inventory or configurator error signals.
     */
    private _handleAuditError(err: unknown, context: string): void {
        const httpErr = err as { status?: number; error?: { message?: string } };
        let message: string;

        switch (httpErr?.status) {
            case 401:
                message = 'Your session has expired. Please re-authenticate to continue.';
                break;
            case 403:
                message = 'Access Denied — Audit archive access requires elevated clearance.';
                break;
            case 404:
                message = 'The fare code could not be found in the archive records.';
                break;
            case 409:
                message =
                    'Restoration failed — this fare code is already active in the pricing engine.';
                break;
            case 500:
                message = 'A critical engine fault occurred. Please contact the operations support team.';
                break;
            case 503:
                message = 'The Pricing Engine is temporarily offline. Retry in a few moments.';
                break;
            default:
                message =
                    httpErr.error?.message ??
                    `An unexpected error occurred during ${context}. Please try again.`;
        }

        console.error(`[FareEngineStore::${context}]`, err);
        this._auditError.set(message);
    }

    private _clearReactivationSuccessAfterDelay(): void {
        setTimeout(() => this._reactivationSuccess.set(null), 5000);
    }


}