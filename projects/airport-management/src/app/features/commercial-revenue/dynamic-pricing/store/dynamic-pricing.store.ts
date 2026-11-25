
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Subscription, timer } from 'rxjs';
import { catchError, finalize, switchMap, take } from 'rxjs/operators';

import { PricingRulesService } from '@shared-core';
import {
    IContextualPricingAttributeDto,
    IPricingAttributeFilterDto,
    IPricingContextDto,
    ICreatePricingAttributeDto,
    IUpdatePricingAttributeDto,
} from '@shared-core';
import { IPaginatedResult } from '@shared-core';

// ── Search criteria contract ───────────────────────────────────────────────
export interface IPricingSearchCriteria {
    attributeType: string;
    targetValue: string;
    isActive: boolean | null;
    pageNumber: number;
    pageSize: number;
}

const DEFAULT_CRITERIA: IPricingSearchCriteria = {
    attributeType: '',
    targetValue: '',
    isActive: true,
    pageNumber: 1,
    pageSize: 20,
};

// ── Pagination metadata ────────────────────────────────────────────────────
export interface IPricingPagination {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

const DEFAULT_PAGINATION: IPricingPagination = {
    currentPage: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
};

// ── Base route ─────────────────────────────────────────────────────────────
const DP_BASE = '/aoms/commercial-revenue/dynamic-pricing';

// ── Max retry attempts on initial load ────────────────────────────────────
const MAX_LOAD_RETRIES = 2;

@Injectable({ providedIn: 'root' })
export class DynamicPricingStore {
    private readonly pricingRulesSvc = inject(PricingRulesService);
    private readonly router = inject(Router);

    // ── Private writable signals ───────────────────────────────────────────
    private readonly _activeRules = signal<IContextualPricingAttributeDto[]>([]);
    private readonly _pagination = signal<IPricingPagination>(DEFAULT_PAGINATION);
    private readonly _searchCriteria = signal<IPricingSearchCriteria>(DEFAULT_CRITERIA);
    private readonly _isLoading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);
    private readonly _actionProcessing = signal<boolean>(false);
    private readonly _actionSuccess = signal<string | null>(null);
    private readonly _focusedRuleId = signal<number | null>(null);
    private readonly _retryCount = signal<number>(0);

    // ── Public read-only signals ───────────────────────────────────────────
    readonly activeRules = this._activeRules.asReadonly();
    readonly pagination = this._pagination.asReadonly();
    readonly searchCriteria = this._searchCriteria.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly error = this._error.asReadonly();
    readonly actionProcessing = this._actionProcessing.asReadonly();
    readonly actionSuccess = this._actionSuccess.asReadonly();
    readonly focusedRuleId = this._focusedRuleId.asReadonly();
    readonly totalRulesCount = computed(() => this._pagination().total);

    // ── Computed signals ───────────────────────────────────────────────────
    readonly hasActiveRules = computed(() => this._activeRules().length > 0);
    readonly hasActiveSearch = computed(() => {
        const c = this._searchCriteria();
        return c.attributeType.trim().length > 0 || c.targetValue.trim().length > 0;
    });
    readonly recordCountLabel = computed(() => {
        const { total, currentPage, pageSize } = this._pagination();
        if (total === 0) return 'No pricing rules found';
        const start = (currentPage - 1) * pageSize + 1;
        const end = Math.min(currentPage * pageSize, total);
        return `Showing ${start}–${end} of ${total} pricing rules`;
    });
    readonly canRetry = computed(() => this._retryCount() < MAX_LOAD_RETRIES);

    // ── Subscription registry ──────────────────────────────────────────────
    private _activeSub: Subscription | null = null;

    // ══════════════════════════════════════════════════════════════════════
    // Inventory Actions
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Load the full active attribute set inventory.
     * Includes an automatic retry mechanism (up to MAX_LOAD_RETRIES attempts).
     */
    loadActiveRules(): void {
        this._cancelActiveSub();
        this._isLoading.set(true);
        this._error.set(null);

        this._activeSub = this.pricingRulesSvc
            .getAllActiveAttributeSets()
            .pipe(
                catchError(err => {
                    if (this._retryCount() < MAX_LOAD_RETRIES) {
                        this._retryCount.update(n => n + 1);
                        // Exponential backoff: 1s, 2s
                        return timer(this._retryCount() * 1000).pipe(
                            switchMap(() => this.pricingRulesSvc.getAllActiveAttributeSets()),
                            take(1)
                        );
                    }
                    this._retryCount.set(0);
                    this._handleError(err, 'loadActiveRules');
                    return EMPTY;
                }),
                finalize(() => this._isLoading.set(false))
            )
            .subscribe(rules => {
                this._retryCount.set(0);
                this._activeRules.set(rules);
                this._pagination.set({
                    currentPage: 1,
                    pageSize: DEFAULT_CRITERIA.pageSize,
                    total: rules.length,
                    totalPages: Math.ceil(rules.length / DEFAULT_CRITERIA.pageSize),
                });
                this._searchCriteria.set(DEFAULT_CRITERIA);
            });
    }

    /** Manual retry exposed to the template's retry button. */
    retryLoad(): void {
        this._retryCount.set(0);
        this.loadActiveRules();
    }

    /** Execute a paginated search with the provided filter criteria. */
    searchRules(criteria: Partial<IPricingSearchCriteria>): void {
        const merged: IPricingSearchCriteria = {
            ...this._searchCriteria(),
            ...criteria,
            pageNumber: criteria.pageNumber ?? 1,
        };
        this._searchCriteria.set(merged);
        this._cancelActiveSub();
        this._isLoading.set(true);
        this._error.set(null);

        const filterDto: IPricingAttributeFilterDto = {
            attributeType: merged.attributeType || undefined,
            targetValue: merged.targetValue || undefined,
            isActive: merged.isActive ?? undefined,
        };

        this._activeSub = this.pricingRulesSvc
            .searchAttributeSets(filterDto, merged.pageNumber, merged.pageSize)
            .pipe(
                catchError(err => {
                    this._handleError(err, 'searchRules');
                    return EMPTY;
                }),
                finalize(() => this._isLoading.set(false))
            )
            .subscribe((result: IPaginatedResult<IContextualPricingAttributeDto>) => {
                this._activeRules.set(result.items ?? []);
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
        this.searchRules({ pageNumber: currentPage + 1 });
    }

    /** Paginate backward. */
    prevPage(): void {
        const { currentPage } = this._pagination();
        if (currentPage <= 1) return;
        this.searchRules({ pageNumber: currentPage - 1 });
    }

    /** Jump to explicit page. */
    goToPage(page: number): void {
        this.searchRules({ pageNumber: page });
    }

    /** Reset filters and reload. */
    resetFilters(): void {
        this._searchCriteria.set(DEFAULT_CRITERIA);
        this.loadActiveRules();
    }

    /**
     * Optimistic deactivation — removes the rule from state immediately,
     * calls the API, and rolls back with error if it fails.
     */
    async deactivateRule(attributeId: number): Promise<boolean> {
        const snapshot = this._activeRules();
        this._focusedRuleId.set(attributeId);
        this._actionProcessing.set(true);
        this._error.set(null);

        // Optimistic remove
        this._activeRules.update(list => list.filter(r => r.attributeId !== attributeId));
        // Adjust pagination total
        this._pagination.update(p => ({ ...p, total: Math.max(0, p.total - 1) }));

        return new Promise<boolean>(resolve => {
            this.pricingRulesSvc
                .deleteAttributeSet(attributeId)
                .pipe(
                    catchError(err => {
                        // Rollback
                        this._activeRules.set(snapshot);
                        this._pagination.update(p => ({ ...p, total: p.total + 1 }));
                        this._handleError(err, 'deactivateRule');
                        resolve(false);
                        return EMPTY;
                    }),
                    finalize(() => {
                        this._actionProcessing.set(false);
                        this._focusedRuleId.set(null);
                    })
                )
                .subscribe(() => {
                    this._actionSuccess.set(`Pricing rule #${attributeId} has been deactivated.`);
                    this._clearSuccessAfterDelay();
                    resolve(true);
                });
        });
    }

    /** Clear any persisted action state. */
    clearActionState(): void {
        this._error.set(null);
        this._actionSuccess.set(null);
        this._actionProcessing.set(false);
        this._focusedRuleId.set(null);
    }

    clearError(): void {
        this._error.set(null);
    }

    // ── Navigation helpers ─────────────────────────────────────────────────

    navigateToEditor(attributeId?: number): void {
        if (attributeId) {
            this.router.navigate([DP_BASE, 'dynamic-rule-editor', attributeId]);
        } else {
            this.router.navigate([DP_BASE, 'dynamic-rule-editor']);
        }
    }

    navigateToSimulationLab(): void {
        this.router.navigate([DP_BASE, 'rule-simulation-lab']);
    }

    navigateToArchive(): void {
        this.router.navigate([DP_BASE, 'pricing-attribute-archive']);
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private _cancelActiveSub(): void {
        if (this._activeSub && !this._activeSub.closed) {
            this._activeSub.unsubscribe();
        }
        this._activeSub = null;
    }

    /**
     * Sophisticated error mapper — translates HTTP status codes into
     * clear, operator-facing messages for the pricing domain.
     */
    private _handleError(err: unknown, context: string): void {
        const httpErr = err as { status?: number; error?: { message?: string } };
        let message: string;

        switch (httpErr?.status) {
            case 400:
                message =
                    httpErr.error?.message ??
                    'The request contained invalid criteria. Please review and retry.';
                break;
            case 401:
                message = 'Your session has expired. Please re-authenticate to continue.';
                break;
            case 403:
                message = 'Access Denied — Pricing rule management requires elevated clearance.';
                break;
            case 404:
                message = 'The pricing rule could not be located in the system.';
                break;
            case 409:
                message =
                    'Conflict — this pricing rule is currently active in live pricing calculations.';
                break;
            case 422:
                message =
                    httpErr.error?.message ??
                    'Validation failure: one or more rule parameters are outside permitted bounds.';
                break;
            case 500:
                message =
                    'A critical engine fault occurred in the Pricing Engine. Contact operations support.';
                break;
            case 503:
                message = 'The Pricing Engine is temporarily offline. Retry in a few moments.';
                break;
            default:
                message =
                    httpErr.error?.message ??
                    `An unexpected error occurred during ${context}. Please try again.`;
        }

        console.error(`[DynamicPricingStore::${context}]`, err);
        this._error.set(message);
    }

    private _clearSuccessAfterDelay(): void {
        setTimeout(() => this._actionSuccess.set(null), 4000);
    }


    // ══════════════════════════════════════════════════════════════════════
    // Simulation Lab — Phase 2 Additions
    // ══════════════════════════════════════════════════════════════════════

    // ── Private writable signals ─────────────────────────────────────────
    private readonly _simulationScenario = signal<ISimulationContext | null>(null);
    private readonly _matchingResults = signal<IContextualPricingAttributeDto[]>([]);
    private readonly _isSimulating = signal<boolean>(false);
    private readonly _simulationError = signal<string | null>(null);
    private readonly _simulationRan = signal<boolean>(false);

    // ── Public read-only signals ─────────────────────────────────────────
    readonly simulationScenario = this._simulationScenario.asReadonly();
    readonly matchingResults = this._matchingResults.asReadonly();
    readonly isSimulating = this._isSimulating.asReadonly();
    readonly simulationError = this._simulationError.asReadonly();
    /** True once a simulation has been executed — persists across tab switches. */
    readonly simulationRan = this._simulationRan.asReadonly();

    // ── Computed signals ─────────────────────────────────────────────────

    /**
     * The single highest-priority rule from the simulation results.
     * Priority 1 = highest, so we sort ascending and pick first.
     */
    readonly topRule = computed<IContextualPricingAttributeDto | null>(() => {
        const results = this._matchingResults();
        if (!results.length) return null;
        // Sort by attributeId ascending to pick the first/best match
        return [...results].sort((a, b) => a.attributeId - b.attributeId)[0];
    });

    /** Sum of willingness-to-pay values from all matched rules. */
    readonly totalModifierImpact = computed<number>(() =>
        this._matchingResults().reduce((sum, r) => sum + (r.willingnessToPay ?? 0), 0)
    );

    /** True if the simulation returned at least one matching rule. */
    readonly hasMatches = computed<boolean>(() => this._matchingResults().length > 0);

    // ── Actions ──────────────────────────────────────────────────────────

    /**
     * Execute the simulation engine against the given context.
     * Calls findBestMatchingAttributeSets and populates matchingResults.
     * State persists across tab switches — the store is singleton.
     */
    runSimulation(context: ISimulationContext): void {
        this._simulationScenario.set(context);
        this._matchingResults.set([]);
        this._isSimulating.set(true);
        this._simulationError.set(null);

        const contextDto: IPricingContextDto = {
            bookingClass: context.bookingClass || undefined,
            frequentFlyerTier: context.frequentFlyerTier || undefined,
            daysToDeparture: context.daysToDeparture ?? undefined,
            seasonality: context.seasonality || undefined,
        };

        this.pricingRulesSvc
            .findBestMatchingAttributeSets(contextDto)
            .pipe(
                catchError(err => {
                    this._handleSimulationError(err, 'runSimulation');
                    return EMPTY;
                }),
                finalize(() => this._isSimulating.set(false))
            )
            .subscribe(results => {
                // Sort by attributeId ascending
                const sorted = [...results].sort((a, b) => a.attributeId - b.attributeId);
                this._matchingResults.set(sorted);
                this._simulationRan.set(true);
            });
    }

    /** Clear all simulation state — called on explicit "Reset" only. */
    resetSimulation(): void {
        this._simulationScenario.set(null);
        this._matchingResults.set([]);
        this._simulationError.set(null);
        this._simulationRan.set(false);
        this._isSimulating.set(false);
    }

    clearSimulationError(): void {
        this._simulationError.set(null);
    }

    // ── Navigation helpers ─────────────────────────────────────────────────

    navigateToManager(): void {
        this.router.navigate([DP_BASE]);
    }

    // ── Private simulation error handler ──────────────────────────────────

    /**
     * Dedicated simulation error handler — writes to `_simulationError`
     * to keep the simulation surface isolated from the inventory error signal.
     */
    private _handleSimulationError(err: unknown, context: string): void {
        const httpErr = err as { status?: number; error?: { message?: string }; message?: string };
        let message: string;
        let technical: string;

        switch (httpErr?.status) {
            case 400:
                message = 'The simulation context contained invalid parameters.';
                technical = httpErr.error?.message ?? 'HTTP 400 — Bad Request';
                break;
            case 401:
                message = 'Your session has expired. Please re-authenticate to continue.';
                technical = 'HTTP 401 — Unauthorized';
                break;
            case 403:
                message = 'Access Denied — Simulation Lab requires elevated clearance.';
                technical = 'HTTP 403 — Forbidden';
                break;
            case 404:
                message = 'The simulation endpoint could not be reached. Check API configuration.';
                technical = 'HTTP 404 — Endpoint Not Found';
                break;
            case 422:
                message = httpErr.error?.message ?? 'One or more context parameters failed validation.';
                technical = 'HTTP 422 — Unprocessable Entity';
                break;
            case 500:
                message = 'A fault occurred in the Pricing Engine during simulation.';
                technical = 'HTTP 500 — Internal Server Error';
                break;
            case 503:
                message = 'The Pricing Engine is temporarily offline. Retry in a few moments.';
                technical = 'HTTP 503 — Service Unavailable';
                break;
            default:
                message = `An unexpected error occurred during ${context}.`;
                technical = httpErr?.message ?? 'Unknown error';
        }

        console.error(`[DynamicPricingStore::${context}]`, err);
        // Encode both message and technical detail in a structured string
        // Components can split on '||' to extract the technical detail
        this._simulationError.set(`${message}||${technical}`);
    }


    // ══════════════════════════════════════════════════════════════════════
    // Dynamic Rule Editor — Phase 3 Additions
    // ══════════════════════════════════════════════════════════════════════

    // ── Private writable signals ─────────────────────────────────────────
    private readonly _selectedAttributeSet = signal<IContextualPricingAttributeDto | null>(null);
    private readonly _editorRuleId = signal<number | null>(null);
    private readonly _isSaving = signal<boolean>(false);
    private readonly _isLoadingRule = signal<boolean>(false);
    private readonly _editorError = signal<string | null>(null);
    private readonly _editorSuccess = signal<string | null>(null);

    // ── Public read-only signals ─────────────────────────────────────────
    readonly selectedAttributeSet = this._selectedAttributeSet.asReadonly();
    readonly isSaving = this._isSaving.asReadonly();
    readonly isLoadingRule = this._isLoadingRule.asReadonly();
    readonly editorError = this._editorError.asReadonly();
    readonly editorSuccess = this._editorSuccess.asReadonly();

    // ── Computed signals ─────────────────────────────────────────────────

    /**
     * True when creating a brand-new rule (no ID in editing context).
     * False when editing an existing attribute set.
     */
    readonly isNewRule = computed<boolean>(() => this._editorRuleId() === null);

    // ── Actions ──────────────────────────────────────────────────────────

    /**
     * Load a single attribute set by numeric ID for editing.
     * Called by the smart component when a :id param is present in the route.
     */
    loadRuleById(id: number): void {
        this._editorRuleId.set(id);
        this._selectedAttributeSet.set(null);
        this._isLoadingRule.set(true);
        this._editorError.set(null);

        this.pricingRulesSvc
            .getAttributeSetById(id)
            .pipe(
                catchError(err => {
                    this._handleEditorError(err, 'loadRuleById');
                    return EMPTY;
                }),
                finalize(() => this._isLoadingRule.set(false))
            )
            .subscribe(rule => {
                this._selectedAttributeSet.set(rule);
            });
    }

    /**
     * Intelligently creates or updates a pricing rule.
     * Dispatches to createAttributeSet when isNewRule is true,
     * otherwise dispatches to updateAttributeSet.
     * Returns Promise<boolean> so the smart component can react (navigate on success).
     */
    async saveRule(
        payload: ICreatePricingAttributeDto | IUpdatePricingAttributeDto
    ): Promise<boolean> {
        this._isSaving.set(true);
        this._editorError.set(null);

        const id = this._editorRuleId();
        const isNew = id === null;

        return new Promise<boolean>(resolve => {
            const call$ = isNew
                ? this.pricingRulesSvc.createAttributeSet(payload as ICreatePricingAttributeDto)
                : this.pricingRulesSvc.updateAttributeSet(id!, payload as IUpdatePricingAttributeDto);

            call$
                .pipe(
                    catchError(err => {
                        this._handleEditorError(err, isNew ? 'createAttributeSet' : 'updateAttributeSet');
                        resolve(false);
                        return EMPTY;
                    }),
                    finalize(() => this._isSaving.set(false))
                )
                .subscribe(saved => {
                    this._selectedAttributeSet.set(saved);
                    if (isNew) {
                        // Promote to edit mode with the new ID
                        this._editorRuleId.set(saved.attributeId);
                    }
                    this._editorSuccess.set(
                        isNew
                            ? `Pricing rule #${saved.attributeId} has been created and is now active.`
                            : `Rule #${saved.attributeId} has been updated successfully.`
                    );
                    this._clearEditorSuccessAfterDelay();
                    resolve(true);
                });
        });
    }

    /** Prepare the editor for a brand-new rule — clear all editor state. */
    initNewRule(): void {
        this._editorRuleId.set(null);
        this._selectedAttributeSet.set(null);
        this._editorError.set(null);
        this._editorSuccess.set(null);
        this._isSaving.set(false);
    }

    /** Clear all editor surfaces on component destroy. */
    clearEditorState(): void {
        this._editorRuleId.set(null);
        this._selectedAttributeSet.set(null);
        this._editorError.set(null);
        this._editorSuccess.set(null);
        this._isSaving.set(false);
        this._isLoadingRule.set(false);
    }

    clearEditorError(): void {
        this._editorError.set(null);
    }



    // ── Private editor error handler ──────────────────────────────────────

    /**
     * Dedicated editor error handler — writes to `_editorError`
     * to keep editor surface isolated from inventory and simulation error signals.
     */
    private _handleEditorError(err: unknown, context: string): void {
        const httpErr = err as { status?: number; error?: { message?: string } };
        let message: string;

        switch (httpErr?.status) {
            case 400:
                message =
                    httpErr.error?.message ??
                    'The rule configuration contained invalid data. Please review all fields.';
                break;
            case 401:
                message = 'Your session has expired. Please re-authenticate to continue.';
                break;
            case 403:
                message = 'Access Denied — Rule authoring requires elevated clearance.';
                break;
            case 404:
                message = 'The pricing rule you are editing could not be found in the system.';
                break;
            case 409:
                message =
                    'Conflict — A rule with conflicting attributes already exists. Review priority levels.';
                break;
            case 422:
                message =
                    httpErr.error?.message ??
                    'Validation failed: one or more rule parameters are outside permitted bounds.';
                break;
            case 500:
                message = 'A critical fault occurred in the Pricing Engine. Contact operations support.';
                break;
            case 503:
                message = 'The Pricing Engine is temporarily offline. Retry in a few moments.';
                break;
            default:
                message =
                    httpErr.error?.message ??
                    `An unexpected error occurred during ${context}. Please try again.`;
        }

        console.error(`[DynamicPricingStore::${context}]`, err);
        this._editorError.set(message);
    }

    private _clearEditorSuccessAfterDelay(): void {
        setTimeout(() => this._editorSuccess.set(null), 5000);
    }

    // ══════════════════════════════════════════════════════════════════════
    // Pricing Attribute Archive — Phase 5 Additions
    // ══════════════════════════════════════════════════════════════════════

    // ── Private writable signals ─────────────────────────────────────────
    private readonly _archivedRules = signal<IContextualPricingAttributeDto[]>([]);
    private readonly _isArchiveLoading = signal<boolean>(false);
    private readonly _archiveError = signal<string | null>(null);
    private readonly _restorationStatus = signal<'idle' | 'success' | 'error'>('idle');
    private readonly _restorationMessage = signal<string | null>(null);
    private readonly _restoringId = signal<number | null>(null);

    // ── Public read-only signals ─────────────────────────────────────────
    readonly archivedRules = this._archivedRules.asReadonly();
    readonly isArchiveLoading = this._isArchiveLoading.asReadonly();
    readonly archiveError = this._archiveError.asReadonly();
    readonly restorationStatus = this._restorationStatus.asReadonly();
    readonly restorationMessage = this._restorationMessage.asReadonly();
    readonly restoringId = this._restoringId.asReadonly();

    // ── Computed signals ─────────────────────────────────────────────────
    /** Total count of archived (inactive) attribute sets currently loaded. */
    readonly archivedTotal = computed<number>(() => this._archivedRules().length);

    // ── Actions ──────────────────────────────────────────────────────────

    /**
     * Load all deactivated attribute sets using searchAttributeSets with
     * isActive = false filter. Populates the archive view.
     */
    loadArchivedRules(): void {
        this._isArchiveLoading.set(true);
        this._archiveError.set(null);

        const filter: IPricingAttributeFilterDto = { isActive: false };

        this.pricingRulesSvc
            .searchAttributeSets(filter, 1, 200) // Load up to 200 archived rules
            .pipe(
                catchError(err => {
                    this._handleArchiveError(err, 'loadArchivedRules');
                    return EMPTY;
                }),
                finalize(() => this._isArchiveLoading.set(false))
            )
            .subscribe(result => {
                // Ensure only inactive (deactivated) rules are shown in the archive
                const items = (result.items ?? []).filter(r => !r.isActive);
                const sorted = [...items].sort((a, b) => a.attributeId - b.attributeId);
                this._archivedRules.set(sorted);
            });
    }

    /**
     * Restore a deactivated attribute set back to active inventory.
     * On success: optimistically removes the row from the archive with a
     * slide-out animation, triggers a refresh of the active inventory list,
     * and shows a success toast.
     * Returns Promise<boolean> so the smart component can close the modal.
     */
    async restoreAttributeSet(attributeId: number): Promise<boolean> {
        this._restoringId.set(attributeId);
        this._restorationStatus.set('idle');
        this._archiveError.set(null);

        return new Promise<boolean>(resolve => {
            this.pricingRulesSvc
                .reactivateAttributeSet(attributeId)
                .pipe(
                    catchError(err => {
                        this._handleArchiveError(err, 'restoreAttributeSet');
                        this._restorationStatus.set('error');
                        this._restoringId.set(null);
                        resolve(false);
                        return EMPTY;
                    }),
                    finalize(() => {
                        // Don't clear restoringId immediately — the slide-out animation
                        // needs it to identify the departing row. Clear after 400ms.
                        setTimeout(() => this._restoringId.set(null), 400);
                    })
                )
                .subscribe(() => {
                    // Optimistic removal from the archive list
                    this._archivedRules.update(list =>
                        list.filter(r => r.attributeId !== attributeId)
                    );
                    this._restorationStatus.set('success');
                    this._restorationMessage.set(
                        `Rule #${attributeId} has been restored to the active pricing inventory.`
                    );
                    this._clearRestorationMessageAfterDelay();

                    // Also refresh the active inventory if it was previously loaded
                    // so the manager grid reflects the restored rule immediately.
                    if (this._activeRules().length > 0) {
                        this.loadActiveRules();
                    }

                    resolve(true);
                });
        });
    }

    /** Clear the archive surface state on component destroy. */
    clearArchiveState(): void {
        this._archiveError.set(null);
        this._restorationStatus.set('idle');
        this._restorationMessage.set(null);
        this._restoringId.set(null);
    }

    clearArchiveError(): void {
        this._archiveError.set(null);
    }

    // ── Navigation helper ─────────────────────────────────────────────────

    navigateToManagerFromArchive(): void {
        this.router.navigate([DP_BASE]);
    }

    // ── Private archive error handler ──────────────────────────────────────

    /**
     * Dedicated archive error handler — writes to `_archiveError` to keep
     * the archive surface isolated from all other error signals.
     */
    private _handleArchiveError(err: unknown, context: string): void {
        const httpErr = err as { status?: number; error?: { message?: string } };
        let message: string;

        switch (httpErr?.status) {
            case 401:
                message = 'Your session has expired. Please re-authenticate to continue.';
                break;
            case 403:
                message = 'Access Denied — Archive access requires elevated clearance.';
                break;
            case 404:
                message = 'The pricing rule could not be found in the archive.';
                break;
            case 409:
                message =
                    'Restoration failed — an active rule with conflicting attributes already exists. ' +
                    'Review the active inventory before restoring this rule.';
                break;
            case 422:
                message =
                    httpErr.error?.message ??
                    'Restoration failed: this rule configuration is no longer valid in the current system.';
                break;
            case 500:
                message = 'A critical fault occurred in the Pricing Engine. Contact operations support.';
                break;
            case 503:
                message = 'The Pricing Engine is temporarily offline. Retry in a few moments.';
                break;
            default:
                message =
                    httpErr.error?.message ??
                    `An unexpected error occurred during ${context}. Please try again.`;
        }

        console.error(`[DynamicPricingStore::${context}]`, err);
        this._archiveError.set(message);
    }

    private _clearRestorationMessageAfterDelay(): void {
        setTimeout(() => {
            this._restorationMessage.set(null);
            this._restorationStatus.set('idle');
        }, 5000);
    }

} // end DynamicPricingStore


// ── Public interfaces shared between store and components ──────────────────

/**
 * The full simulation input context — maps to IPricingContextDto
 * plus additional UI-only fields (origin, destination, travelDate).
 */
export interface ISimulationContext {
    /** IATA origin airport code (UI display only, not sent to API). */
    origin: string;
    /** IATA destination airport code (UI display only, not sent to API). */
    destination: string;
    /** ISO date string (UI display only). */
    travelDate: string;
    /** Maps to IPricingContextDto.bookingClass */
    bookingClass: string;
    /** Maps to IPricingContextDto.frequentFlyerTier */
    frequentFlyerTier: string;
    /** Days from booking to departure — maps to IPricingContextDto.daysToDeparture */
    daysToDeparture: number | null;
    /** Season identifier — maps to IPricingContextDto.seasonality */
    seasonality: string;
}