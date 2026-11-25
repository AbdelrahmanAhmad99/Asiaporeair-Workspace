
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { FrequentFlyerService } from '@shared-core';
import {
    IFrequentFlyerDto,
    IFrequentFlyerFilter,
    IFrequentFlyerSearchResult,
    IUpdateLevelRequest,
    IUpdatePointsRequest,
    ICreateFrequentFlyerRequest,
} from '@shared-core';
import { IPaginationMetadata } from '@shared-core';

// ── Tier constants ─────────────────────────────────────────────────────────
export const LOYALTY_TIERS = ['Classic', 'Silver', 'Gold', 'Elite'] as const;
export type LoyaltyTier = typeof LOYALTY_TIERS[number];

// ── Search filter contract ─────────────────────────────────────────────────
export interface ILoyaltySearchFilter {
    cardNumberContains: string;
    level: string; // '' = all
    minPoints: number | null;
    maxPoints: number | null;
    includeDeleted: boolean;
}

const DEFAULT_FILTER: ILoyaltySearchFilter = {
    cardNumberContains: '',
    level: '',
    minPoints: null,
    maxPoints: null,
    includeDeleted: false,
};

// ── Pagination ────────────────────────────────────────────────────────────
export interface ILoyaltyPagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

const DEFAULT_PAGINATION: ILoyaltyPagination = {
    page: 1, pageSize: 30, total: 0, totalPages: 0,
};

// ── Points adjustment form model ──────────────────────────────────────────
export interface IPointsAdjustmentDraft {
    delta: number;
    reason: string;
}

// ── Registration form payload ──────────────────────────────────────────────
export interface IRegistrationPayload {
    userId: number;
    fullNamePreview: string; // display-only, resolved from user lookup
    cardNumber: string;
    level: string; // Classic | Silver | Gold
    initialAwardPoints: number;
    welcomeMessageOptIn: boolean;
}



// ── Adjustment domain types ────────────────────────────────────────────────
export type AdjustmentType = 'add' | 'subtract';

export interface IAdjustmentFormData {
    type: AdjustmentType;
    amount: number;
    reasonCode: string;
    comments: string;
}

export interface ITransactionRecord {
    id: number;
    date: string;        // ISO date string
    type: AdjustmentType;
    amount: number;
    reason: string;
    comments?: string;
    adminId?: string;
}

export type LastAdjustmentStatus = 'idle' | 'success' | 'error';


// ── Registration form payload ──────────────────────────────────────────────
export interface IRegistrationPayload {
    userId: number;
    fullNamePreview: string; // display-only, resolved from user lookup
    cardNumber: string;
    level: string; // Classic | Silver | Gold
    initialAwardPoints: number;
    welcomeMessageOptIn: boolean;
}

@Injectable({ providedIn: 'root' })
export class LoyaltyIntelligenceStore {
    private readonly svc = inject(FrequentFlyerService);
    private readonly router = inject(Router);
    private readonly destroy$ = new Subject<void>();

    // ── Private state ─────────────────────────────────────────────────────
    private readonly _accounts = signal<IFrequentFlyerDto[]>([]);
    private readonly _selectedAccount = signal<IFrequentFlyerDto | null>(null);
    private readonly _isLoading = signal<boolean>(false);
    private readonly _detailLoading = signal<boolean>(false);
    private readonly _actionLoading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);
    private readonly _actionSuccess = signal<string | null>(null);
    private readonly _actionError = signal<string | null>(null);
    private readonly _hasSearched = signal<boolean>(false);
    private readonly _searchFilter = signal<ILoyaltySearchFilter>({ ...DEFAULT_FILTER });
    private readonly _pagination = signal<ILoyaltyPagination>({ ...DEFAULT_PAGINATION });

    private readonly _transactionHistory = signal<ITransactionRecord[]>([]);
    private readonly _isProcessingAdjustment = signal<boolean>(false);
    private readonly _lastAdjustmentStatus = signal<LastAdjustmentStatus>('idle');
    private readonly _adjustmentMember = signal<IFrequentFlyerDto | null>(null);
    private readonly _adjustmentLoading = signal<boolean>(false);
    private readonly _adjustmentError = signal<string | null>(null);
    private readonly _adjustmentSuccess = signal<string | null>(null);
    private readonly _projectedBalance = signal<number | null>(null);
    private readonly _bookingPointsLoading = signal<boolean>(false);

    private readonly _registrationLoading = signal<boolean>(false);
    private readonly _registrationSuccess = signal<IFrequentFlyerDto | null>(null);
    private readonly _backendError = signal<string | null>(null);



    // ── Public read-only ──────────────────────────────────────────────────
    readonly accounts = this._accounts.asReadonly();
    readonly selectedAccount = this._selectedAccount.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly detailLoading = this._detailLoading.asReadonly();
    readonly actionLoading = this._actionLoading.asReadonly();
    readonly error = this._error.asReadonly();
    readonly actionSuccess = this._actionSuccess.asReadonly();
    readonly actionError = this._actionError.asReadonly();
    readonly hasSearched = this._hasSearched.asReadonly();
    readonly searchFilter = this._searchFilter.asReadonly();
    readonly pagination = this._pagination.asReadonly();



    readonly transactionHistory = this._transactionHistory.asReadonly();
    readonly isProcessingAdjustment = this._isProcessingAdjustment.asReadonly();
    readonly lastAdjustmentStatus = this._lastAdjustmentStatus.asReadonly();
    readonly adjustmentMember = this._adjustmentMember.asReadonly();
    readonly adjustmentLoading = this._adjustmentLoading.asReadonly();
    readonly adjustmentError = this._adjustmentError.asReadonly();
    readonly adjustmentSuccess = this._adjustmentSuccess.asReadonly();
    readonly projectedBalance = this._projectedBalance.asReadonly();
    readonly bookingPointsLoading = this._bookingPointsLoading.asReadonly();


    readonly registrationLoading = this._registrationLoading.asReadonly();
    readonly registrationSuccess = this._registrationSuccess.asReadonly();
    readonly backendError = this._backendError.asReadonly();


    // ── Computed ──────────────────────────────────────────────────────────

    readonly resultsEmpty = computed<boolean>(
        () => this._hasSearched() && !this._isLoading() && this._accounts().length === 0
    );

    readonly hasActiveFilter = computed<boolean>(() => {
        const f = this._searchFilter();
        return !!(f.cardNumberContains || f.level || f.minPoints != null || f.maxPoints != null || f.includeDeleted);
    });

    readonly selectedTierTheme = computed<LoyaltyTier>(() => {
        const level = this._selectedAccount()?.level ?? '';
        return (LOYALTY_TIERS.includes(level as LoyaltyTier) ? level : 'Classic') as LoyaltyTier;
    });

    readonly selectedAccountIsActive = computed<boolean>(
        () => this._selectedAccount()?.isActive === true
    );

    readonly tierDistribution = computed<Record<string, number>>(() => {
        const dist: Record<string, number> = {};
        for (const t of LOYALTY_TIERS) dist[t] = 0;
        for (const a of this._accounts()) {
            if (a.level in dist) dist[a.level]++;
        }
        return dist;
    });

    /** Points formatted with locale separator for display. */
    readonly selectedPointsFormatted = computed<string>(() =>
        (this._selectedAccount()?.awardPoints ?? 0).toLocaleString('en-US')
    );


    readonly adjustmentMemberFormatted = computed<string>(() => {
        const m = this._adjustmentMember();
        if (!m) return '—';
        return `${m.linkedUserName} · ${m.cardNumber} · ${m.level}`;
    });

    readonly currentBalanceFormatted = computed<string>(() =>
        (this._adjustmentMember()?.awardPoints ?? 0).toLocaleString('en-US')
    );

    readonly projectedBalanceFormatted = computed<string>(() => {
        const pb = this._projectedBalance();
        if (pb === null) return this.currentBalanceFormatted();
        return pb.toLocaleString('en-US');
    });

    readonly projectedBalanceDelta = computed<number>(() => {
        const current = this._adjustmentMember()?.awardPoints ?? 0;
        const projected = this._projectedBalance();
        if (projected === null) return 0;
        return projected - current;
    });

    readonly hasTransactionHistory = computed<boolean>(
        () => this._transactionHistory().length > 0
    );


    readonly hasRegistrationSucceeded = computed<boolean>(
        () => this._registrationSuccess() !== null
    );

    // ════════════════════════════════════════════════════════════════════════
    // Public Methods
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Executes the admin member search with current filter state.
     * Call after mutating the filter via updateFilter().
     */
    searchMembers(overrides?: Partial<ILoyaltySearchFilter>, page: number = 1): void {
        if (overrides) this._searchFilter.update(f => ({ ...f, ...overrides }));
        this._pagination.update(p => ({ ...p, page }));
        this._runSearch();
    }

    /** Updates search filter without triggering a search. */
    updateFilter(partial: Partial<ILoyaltySearchFilter>): void {
        this._searchFilter.update(f => ({ ...f, ...partial }));
    }

    /** Clears all search state and resets to defaults. */
    clearSearch(): void {
        this._accounts.set([]);
        this._searchFilter.set({ ...DEFAULT_FILTER });
        this._pagination.set({ ...DEFAULT_PAGINATION });
        this._error.set(null);
        this._hasSearched.set(false);
        this._selectedAccount.set(null);
    }

    /**
     * Loads full member profile by card number.
     * Populates selectedAccount for the detail panel.
     */
    loadMemberDetails(cardNumber: string): void {
        this._detailLoading.set(true);
        this._error.set(null);

        this.svc.getAccountByCardNumber(cardNumber)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (account) => {
                    this._selectedAccount.set(account);
                    this._detailLoading.set(false);
                },
                error: (err) => {
                    this._error.set(this._resolveError(err, 'load'));
                    this._detailLoading.set(false);
                },
            });
    }

    /** Loads member profile directly from an already-fetched DTO (zero-latency). */
    selectAccount(account: IFrequentFlyerDto): void {
        this._selectedAccount.set(account);
        this._actionError.set(null);
        this._actionSuccess.set(null);
    }

    /** Deselects the current member account. */
    clearSelection(): void {
        this._selectedAccount.set(null);
        this._actionError.set(null);
        this._actionSuccess.set(null);
    }

    /**
     * Executes the tier change. Updates selectedAccount and the matching
     * item in the accounts list optimistically (<100ms visual response).
     */
    changeMemberTier(flyerId: number, newLevel: string): void {
        this._actionLoading.set(true);
        this._actionError.set(null);
        this._actionSuccess.set(null);

        const req: IUpdateLevelRequest = { newLevel };

        this.svc.updateLevel(flyerId, req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (updated) => {
                    this._selectedAccount.set(updated);
                    // Patch the list record so the grid reflects the change immediately
                    this._accounts.update(list =>
                        list.map(a => a.flyerId === flyerId ? { ...a, level: updated.level } : a)
                    );
                    this._actionLoading.set(false);
                    this._actionSuccess.set(`Member tier updated to ${updated.level} successfully.`);
                    this._scheduleSuccessClear();
                },
                error: (err) => {
                    this._actionError.set(this._resolveError(err, 'tier'));
                    this._actionLoading.set(false);
                },
            });
    }

    /**
     * Manually adjusts award points (positive delta = add, negative = deduct).
     */
    adjustPoints(flyerId: number, draft: IPointsAdjustmentDraft): void {
        if (!draft.reason.trim()) {
            this._actionError.set('A reason is required for manual point adjustments.');
            return;
        }

        this._actionLoading.set(true);
        this._actionError.set(null);
        this._actionSuccess.set(null);

        const req: IUpdatePointsRequest = {
            pointsDelta: draft.delta,
            reason: draft.reason.trim(),
        };

        this.svc.manualAdjustPoints(flyerId, req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (updated) => {
                    this._selectedAccount.set(updated);
                    this._accounts.update(list =>
                        list.map(a => a.flyerId === flyerId ? { ...a, awardPoints: updated.awardPoints } : a)
                    );
                    this._actionLoading.set(false);
                    const direction = draft.delta >= 0 ? 'credited' : 'deducted';
                    this._actionSuccess.set(`${Math.abs(draft.delta).toLocaleString()} points ${direction} successfully.`);
                    this._scheduleSuccessClear();
                },
                error: (err) => {
                    this._actionError.set(this._resolveError(err, 'points'));
                    this._actionLoading.set(false);
                },
            });
    }

    /**
     * Removes the loyalty account permanently.
     * On success: removes from accounts list and clears selection.
     */
    removeAccount(flyerId: number): void {
        this._actionLoading.set(true);
        this._actionError.set(null);
        this._actionSuccess.set(null);

        this.svc.deleteAccount(flyerId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this._accounts.update(list => list.filter(a => a.flyerId !== flyerId));
                    this._selectedAccount.set(null);
                    this._actionLoading.set(false);
                    this._actionSuccess.set('Loyalty account removed from the registry.');
                    this._scheduleSuccessClear();
                },
                error: (err) => {
                    this._actionError.set(this._resolveError(err, 'delete'));
                    this._actionLoading.set(false);
                },
            });
    }

    /** Adds booking miles to an account programmatically. */
    addBookingPoints(bookingId: number): void {
        this._actionLoading.set(true);
        this._actionError.set(null);
        this._actionSuccess.set(null);

        this.svc.addPointsForBooking(bookingId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (resp) => {
                    this._actionLoading.set(false);
                    this._actionSuccess.set(`${resp.pointsAdded.toLocaleString()} booking miles credited successfully.`);
                    this._scheduleSuccessClear();
                    const selected = this._selectedAccount();
                    if (selected) this.loadMemberDetails(selected.cardNumber);
                },
                error: (err) => {
                    this._actionError.set(this._resolveError(err, 'points'));
                    this._actionLoading.set(false);
                },
            });
    }

    /** Pagination controls. */
    nextPage(): void {
        const { page, totalPages } = this._pagination();
        if (page < totalPages) {
            this._pagination.update(p => ({ ...p, page: p.page + 1 }));
            this._runSearch();
        }
    }

    prevPage(): void {
        const { page } = this._pagination();
        if (page > 1) {
            this._pagination.update(p => ({ ...p, page: p.page - 1 }));
            this._runSearch();
        }
    }

    /** Navigation helpers. */
    navigateToPointsDesk(): void {
        this.router.navigate(['/aoms/reservation-ground-handling/loyalty-intelligence/points-desk']);
    }

    /** Clears transient action state. */
    clearActionState(): void {
        this._actionError.set(null);
        this._actionSuccess.set(null);
    }

    /** Full teardown on page destroy. */
    teardown(): void {
        this.clearSearch();
        this._isLoading.set(false);
        this._detailLoading.set(false);
        this._actionLoading.set(false);
        this._actionSuccess.set(null);
        this._actionError.set(null);
    }

    destroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }


    /**
     * Loads the member profile by userId for the adjustment desk context.
     * Uses getAccountByUserId — does NOT update selectedAccount (kept separate
     * so Account Manager and Points Desk can be used independently).
     */
    loadMemberForAdjustment(userId: number): void {
        this._adjustmentLoading.set(true);
        this._adjustmentError.set(null);
        this._adjustmentMember.set(null);
        this._transactionHistory.set([]);
        this._projectedBalance.set(null);
        this._lastAdjustmentStatus.set('idle');
        this._adjustmentSuccess.set(null);

        this.svc.getAccountByUserId(userId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (member) => {
                    this._adjustmentMember.set(member);
                    this._adjustmentLoading.set(false);
                    this._seedTransactionHistory(member);
                },
                error: (err) => {
                    this._adjustmentError.set(this._resolveAdjustmentError(err, 'load'));
                    this._adjustmentLoading.set(false);
                },
            });
    }

    /**
     * Executes a manual points adjustment.
     * On success: refreshes adjustmentMember balance and prepends a new
     * ITransactionRecord to transactionHistory for immediate visual confirmation.
     */
    executeManualAdjustment(data: IAdjustmentFormData): void {
        const member = this._adjustmentMember();
        if (!member) return;

        if (!data.reasonCode) {
            this._adjustmentError.set('A reason code is required for all manual adjustments.');
            return;
        }
        if (!data.amount || data.amount <= 0) {
            this._adjustmentError.set('Adjustment amount must be a positive number.');
            return;
        }

        const delta = data.type === 'add' ? data.amount : -data.amount;
        const currentBalance = member.awardPoints;

        if (data.type === 'subtract' && data.amount > currentBalance) {
            this._adjustmentError.set(
                `Insufficient points. Current balance is ${currentBalance.toLocaleString()} pts — ` +
                `cannot deduct ${data.amount.toLocaleString()} pts.`
            );
            return;
        }

        this._isProcessingAdjustment.set(true);
        this._adjustmentError.set(null);
        this._adjustmentSuccess.set(null);
        this._lastAdjustmentStatus.set('idle');

        const req: IUpdatePointsRequest = {
            pointsDelta: delta,
            reason: [data.reasonCode, data.comments].filter(Boolean).join(' — '),
        };

        this.svc.manualAdjustPoints(member.flyerId, req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (updated) => {
                    this._adjustmentMember.set(updated);
                    this._projectedBalance.set(null);

                    const record: ITransactionRecord = {
                        id: Date.now(),
                        date: new Date().toISOString(),
                        type: data.type,
                        amount: data.amount,
                        reason: data.reasonCode,
                        comments: data.comments || undefined,
                    };
                    this._transactionHistory.update(list => [record, ...list]);

                    this._isProcessingAdjustment.set(false);
                    this._lastAdjustmentStatus.set('success');
                    const dir = data.type === 'add' ? 'credited' : 'deducted';
                    this._adjustmentSuccess.set(
                        `${data.amount.toLocaleString()} miles ${dir} successfully. New balance: ${updated.awardPoints.toLocaleString()} pts.`
                    );
                    this._scheduleAdjustmentSuccessClear();
                },
                error: (err) => {
                    this._isProcessingAdjustment.set(false);
                    this._lastAdjustmentStatus.set('error');
                    this._adjustmentError.set(this._resolveAdjustmentError(err, 'adjust'));
                },
            });
    }

    /**
     * Processes booking-linked miles credit.
     * Refreshes the member's balance after the operation.
     */
    processBookingPoints(bookingId: number): void {
        if (!bookingId || bookingId <= 0) {
            this._adjustmentError.set('Please enter a valid booking ID.');
            return;
        }

        this._bookingPointsLoading.set(true);
        this._adjustmentError.set(null);
        this._adjustmentSuccess.set(null);

        this.svc.addPointsForBooking(bookingId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (resp) => {
                    this._bookingPointsLoading.set(false);
                    this._adjustmentSuccess.set(
                        `${resp.pointsAdded.toLocaleString()} booking miles credited for Booking #${bookingId}.`
                    );

                    const member = this._adjustmentMember();
                    if (member) {
                        this._adjustmentMember.update(m =>
                            m ? { ...m, awardPoints: m.awardPoints + resp.pointsAdded } : m
                        );

                        const record: ITransactionRecord = {
                            id: Date.now(),
                            date: new Date().toISOString(),
                            type: 'add',
                            amount: resp.pointsAdded,
                            reason: `Booking #${bookingId} miles credit`,
                        };
                        this._transactionHistory.update(list => [record, ...list]);
                    }
                    this._lastAdjustmentStatus.set('success');
                    this._scheduleAdjustmentSuccessClear();
                },
                error: (err) => {
                    this._bookingPointsLoading.set(false);
                    this._lastAdjustmentStatus.set('error');
                    this._adjustmentError.set(this._resolveAdjustmentError(err, 'booking'));
                },
            });
    }

    /**
     * Computes the projected balance live as the user types.
     * Called by the Smart Page from the form's valueChange event.
     */
    previewBalance(type: AdjustmentType, amount: number): void {
        const current = this._adjustmentMember()?.awardPoints ?? 0;
        if (!amount || amount <= 0) {
            this._projectedBalance.set(null);
            return;
        }
        const projected = type === 'add' ? current + amount : current - amount;
        this._projectedBalance.set(Math.max(0, projected));
    }

    resetBalancePreview(): void {
        this._projectedBalance.set(null);
    }

    clearAdjustmentState(): void {
        this._adjustmentError.set(null);
        this._adjustmentSuccess.set(null);
        this._lastAdjustmentStatus.set('idle');
    }

    teardownAdjustmentDesk(): void {
        this._transactionHistory.set([]);
        this._isProcessingAdjustment.set(false);
        this._lastAdjustmentStatus.set('idle');
        this._adjustmentMember.set(null);
        this._adjustmentLoading.set(false);
        this._adjustmentError.set(null);
        this._adjustmentSuccess.set(null);
        this._projectedBalance.set(null);
        this._bookingPointsLoading.set(false);
    }

    /**
     * Executes new member enrollment.
     * On success: prepends the new account to the accounts list (so it's
     * immediately visible if the auditor navigates back to Account Manager)
     * and sets registrationSuccess to trigger the Smart Page's success flow.
     */
    createNewAccount(payload: IRegistrationPayload): void {
        if (!payload.userId || payload.userId <= 0) {
            this._backendError.set('A valid User ID is required to register a member.');
            return;
        }
        if (!payload.cardNumber.trim()) {
            this._backendError.set('A KrisFlyer card number is required.');
            return;
        }

        this._registrationLoading.set(true);
        this._backendError.set(null);
        this._registrationSuccess.set(null);

        const req: ICreateFrequentFlyerRequest = {
            userId: payload.userId,
            cardNumber: payload.cardNumber.trim(),
            level: payload.level || 'Classic',
            initialAwardPoints: payload.initialAwardPoints ?? 0,
        };

        this.svc.createAccount(req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (account) => {
                    this._accounts.update(list => [account, ...list]);
                    this._registrationLoading.set(false);
                    this._registrationSuccess.set(account);
                },
                error: (err) => {
                    this._registrationLoading.set(false);
                    this._backendError.set(this._resolveRegistrationError(err));
                },
            });
    }

    /** Resets all registration-related transient state. */
    clearRegistrationState(): void {
        this._registrationLoading.set(false);
        this._registrationSuccess.set(null);
        this._backendError.set(null);
    }

    /** Navigation helper — Account Manager return trip. */
    navigateToAccountManagerFromRegistration(): void {
        this.clearRegistrationState();
        this.router.navigate([
            '/aoms/reservation-ground-handling/loyalty-intelligence/account-manager',
        ]);
    }


    // ── Private helpers ────────────────────────────────────────────────────

    private _runSearch(): void {
        this._isLoading.set(true);
        this._error.set(null);

        const f = this._searchFilter();
        const { page, pageSize } = this._pagination();

        const filter: IFrequentFlyerFilter = {
            includeDeleted: f.includeDeleted,
            ...(f.cardNumberContains && { cardNumberContains: f.cardNumberContains }),
            ...(f.level && { level: f.level }),
            ...(f.minPoints != null && { minPoints: f.minPoints }),
            ...(f.maxPoints != null && { maxPoints: f.maxPoints }),
        };

        this.svc.searchAccounts(filter, page, pageSize)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result: IFrequentFlyerSearchResult) => {
                    this._accounts.set(result.items ?? []);
                    const total = result.pagination?.totalCount ?? 0;
                    const totalPages = Math.ceil(total / pageSize);
                    this._pagination.update(p => ({ ...p, total, totalPages }));
                    this._isLoading.set(false);
                    this._hasSearched.set(true);
                },
                error: (err) => {
                    this._error.set(this._resolveError(err, 'search'));
                    this._accounts.set([]);
                    this._isLoading.set(false);
                    this._hasSearched.set(true);
                },
            });
    }

    private _scheduleSuccessClear(): void {
        setTimeout(() => this._actionSuccess.set(null), 5000);
    }

    private _resolveError(
        err: unknown,
        ctx: 'search' | 'load' | 'tier' | 'points' | 'delete'
    ): string {
        if (typeof err === 'object' && err !== null) {
            const e = err as Record<string, unknown>;
            const status = e['status'] as number | undefined;
            const msg = typeof e['message'] === 'string' ? e['message'] : '';

            if (ctx === 'delete') {
                if (status === 409) return 'This account has active bookings or pending points — it cannot be deleted.';
                if (status === 403) return 'Only SuperAdmins may delete loyalty accounts.';
                if (status === 404) return 'Loyalty account not found. It may have already been removed.';
            }
            if (ctx === 'tier') {
                if (status === 404) return 'Member account not found. Please reload and retry.';
                if (status === 422) return 'Invalid tier level. Select from: Classic, Silver, Gold, Elite.';
            }
            if (ctx === 'load') {
                if (status === 404) return 'No loyalty account found for this card number.';
                if (status === 403) return 'Access Denied — Loyalty Intelligence requires Admin clearance.';
            }
            if (ctx === 'search') {
                if (status === 403) return 'Access Denied — Loyalty Intelligence requires Admin clearance.';
                if (status === 0 || status === 503) return 'Loyalty Systems unreachable. Check your connection.';
            }
            if (ctx === 'points') {
                if (status === 422) return 'Invalid point adjustment. Ensure the delta and reason are valid.';
            }

            if (status === 0 || status === 503) return 'Service unreachable. Verify your connection.';
            if (msg) return msg;
        }
        return 'An unexpected error occurred. Contact the Operations Control Centre.';
    }

    private _resolveRegistrationError(err: unknown): string {
        if (typeof err === 'object' && err !== null) {
            const e = err as Record<string, unknown>;
            const status = e['status'] as number | undefined;
            const msg = typeof e['message'] === 'string' ? e['message'] : '';

            if (status === 409) return 'This user already has an active KrisFlyer account.';
            if (status === 404) return 'Invalid User ID — no matching passenger record was found.';
            if (status === 400) return 'Invalid registration data. Verify the card number and tier selection.';
            if (status === 403) return 'Access Denied — member registration requires Admin clearance.';
            if (status === 422) return 'This card number is already in use. Please choose a different number.';
            if (status === 0 || status === 503) return 'Loyalty Systems unreachable. Check your connection and retry.';
            if (msg) return msg;
        }
        return 'An unexpected error occurred during registration. Contact the Operations Control Centre.';
    }


    /**
     * Seeds a minimal transaction record to anchor the audit ledger view.
     * Replace with a real history API call when the endpoint becomes available.
     */
    private _seedTransactionHistory(member: IFrequentFlyerDto): void {
        if (member.awardPoints > 0) {
            this._transactionHistory.set([{
                id: 0,
                date: member.isActive ? new Date().toISOString() : new Date(0).toISOString(),
                type: 'add',
                amount: member.awardPoints,
                reason: 'Account inception balance',
            }]);
        } else {
            this._transactionHistory.set([]);
        }
    }

    private _scheduleAdjustmentSuccessClear(): void {
        setTimeout(() => {
            this._adjustmentSuccess.set(null);
            this._lastAdjustmentStatus.set('idle');
        }, 6000);
    }

    private _resolveAdjustmentError(
        err: unknown,
        ctx: 'load' | 'adjust' | 'booking'
    ): string {
        if (typeof err === 'object' && err !== null) {
            const e = err as Record<string, unknown>;
            const status = e['status'] as number | undefined;
            const msg = typeof e['message'] === 'string' ? e['message'] : '';

            if (ctx === 'load') {
                if (status === 404) return 'No loyalty account found for this user ID.';
                if (status === 403) return 'Access Denied — Points Desk requires Admin clearance.';
            }

            if (ctx === 'adjust') {
                if (status === 400) return 'Invalid adjustment request. Verify the amount and reason code.';
                if (status === 422) return 'Insufficient points balance for the requested deduction.';
                if (status === 403) return 'You do not have permission to adjust points for this account.';
                if (status === 409) return 'A concurrent adjustment is in progress. Wait and retry.';
            }

            if (ctx === 'booking') {
                if (status === 404) return 'Booking ID not found. Verify the reference and retry.';
                if (status === 409) return 'Miles for this booking have already been credited.';
                if (status === 422) return 'This booking is not eligible for miles accrual.';
            }

            if (status === 0 || status === 503) return 'Loyalty Systems unreachable. Check your connection.';
            if (msg) return msg;
        }
        return 'An unexpected error occurred. Contact the Operations Control Centre.';
    }

}