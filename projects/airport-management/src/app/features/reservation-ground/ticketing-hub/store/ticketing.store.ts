import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
    Subject,
    interval,
    takeUntil,
    take,
    switchMap,
    catchError,
    EMPTY, debounceTime,
} from 'rxjs';

import { BookingManagementService, TicketService, } from '@shared-core';
import { IBookingDetailDto, ITicketDto, ITicketDetailDto, ITicketFilter, ITicketPaginatedResponse } from '@shared-core';

// ── Issuance pipeline state machine ──────────────────────────────────────
export type IssuanceStatus =
    | 'Idle'
    | 'VerifyingPayment'
    | 'GeneratingDocuments'
    | 'SecuringDigitalSeal'
    | 'Finalizing'
    | 'Completed'
    | 'Failed';

// Internal stage sequence used by the progress tracker
export const ISSUANCE_STAGES: IssuanceStatus[] = [
    'VerifyingPayment',
    'GeneratingDocuments',
    'SecuringDigitalSeal',
    'Finalizing',
];

// ── Vault filter contract ─────────────────────────────────────────────────
export interface IVaultFilters {
    ticketCode: string;
    bookingReference: string;
    passengerNameContains: string;
    passengerPassport: string;
    status: string;   // '' = all, or specific status string
    issueDateFrom: string;   // ISO date string
    issueDateTo: string;
    includeDeleted: boolean;
}

const DEFAULT_VAULT_FILTERS: IVaultFilters = {
    ticketCode: '',
    bookingReference: '',
    passengerNameContains: '',
    passengerPassport: '',
    status: '',
    issueDateFrom: '',
    issueDateTo: '',
    includeDeleted: false,
};

// ── Vault pagination ───────────────────────────────────────────────────────
export interface IVaultPagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

const DEFAULT_VAULT_PAGINATION: IVaultPagination = {
    page: 1, pageSize: 50, total: 0, totalPages: 0,
};


// ── Poll config ───────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 1800;
const POLL_MAX_ATTEMPTS = 6;

// ── Route base ────────────────────────────────────────────────────────────
const RGH_BASE = '/aoms/reservation-ground';

@Injectable({ providedIn: 'root' })
export class TicketingStore {
    private readonly svc = inject(BookingManagementService);
    private readonly ticketSvc = inject(TicketService);
    private readonly router = inject(Router);
    private readonly destroy$ = new Subject<void>();
    private readonly stopPoll$ = new Subject<void>();

    // ── Private writable state ────────────────────────────────────────────
    private readonly _activeBooking = signal<IBookingDetailDto | null>(null);
    private readonly _issuedTickets = signal<ITicketDto[]>([]);
    private readonly _issuanceStatus = signal<IssuanceStatus>('Idle');
    private readonly _globalError = signal<string | null>(null);
    private readonly _bookingLoading = signal<boolean>(false);
    private readonly _bookingError = signal<string | null>(null);
    private readonly _stageIndex = signal<number>(-1); // index into ISSUANCE_STAGES
    private readonly _stageProgress = signal<number>(0);  // 0–100 within current stage


    private readonly _vaultTickets = signal<ITicketDetailDto[]>([]);
    private readonly _activeFilters = signal<IVaultFilters>({ ...DEFAULT_VAULT_FILTERS });
    private readonly _vaultLoading = signal<boolean>(false);
    private readonly _vaultError = signal<string | null>(null);
    private readonly _vaultPagination = signal<IVaultPagination>({ ...DEFAULT_VAULT_PAGINATION });
    private readonly _vaultHasSearched = signal<boolean>(false);
    private readonly _vaultActionLoading = signal<boolean>(false);
    private readonly _vaultActionError = signal<string | null>(null);
    private readonly _vaultActionSuccess = signal<string | null>(null);
    private readonly _focusedTicket = signal<ITicketDetailDto | null>(null);


    private readonly _selectedTicket = signal<ITicketDetailDto | null>(null);
    private readonly _passengerHistory = signal<ITicketDto[]>([]);
    private readonly _isProcessingAction = signal<boolean>(false);
    private readonly _lifecycleError = signal<string | null>(null);
    private readonly _lifecycleLoading = signal<boolean>(false);
    private readonly _lifecycleActionSuccess = signal<string | null>(null);
    private readonly _lifecycleActionError = signal<string | null>(null);


    // ── Public read-only signals ──────────────────────────────────────────
    readonly activeBooking = this._activeBooking.asReadonly();
    readonly issuedTickets = this._issuedTickets.asReadonly();
    readonly issuanceStatus = this._issuanceStatus.asReadonly();
    readonly globalError = this._globalError.asReadonly();
    readonly bookingLoading = this._bookingLoading.asReadonly();
    readonly bookingError = this._bookingError.asReadonly();
    readonly stageIndex = this._stageIndex.asReadonly();
    readonly stageProgress = this._stageProgress.asReadonly();


    readonly vaultTickets = this._vaultTickets.asReadonly();
    readonly activeFilters = this._activeFilters.asReadonly();
    readonly vaultLoading = this._vaultLoading.asReadonly();
    readonly vaultError = this._vaultError.asReadonly();
    readonly vaultPagination = this._vaultPagination.asReadonly();
    readonly vaultHasSearched = this._vaultHasSearched.asReadonly();
    readonly vaultActionLoading = this._vaultActionLoading.asReadonly();
    readonly vaultActionError = this._vaultActionError.asReadonly();
    readonly vaultActionSuccess = this._vaultActionSuccess.asReadonly();
    readonly focusedTicket = this._focusedTicket.asReadonly();


    readonly selectedTicket = this._selectedTicket.asReadonly();
    readonly passengerHistory = this._passengerHistory.asReadonly();
    readonly isProcessingAction = this._isProcessingAction.asReadonly();
    readonly lifecycleError = this._lifecycleError.asReadonly();
    readonly lifecycleLoading = this._lifecycleLoading.asReadonly();
    readonly lifecycleActionSuccess = this._lifecycleActionSuccess.asReadonly();
    readonly lifecycleActionError = this._lifecycleActionError.asReadonly();


    // ── Computed ──────────────────────────────────────────────────────────

    readonly isProcessing = computed<boolean>(() =>
        ISSUANCE_STAGES.includes(this._issuanceStatus() as IssuanceStatus)
    );

    readonly isCompleted = computed<boolean>(() =>
        this._issuanceStatus() === 'Completed'
    );

    readonly hasFailed = computed<boolean>(() =>
        this._issuanceStatus() === 'Failed'
    );

    readonly canIssue = computed<boolean>(() => {
        const booking = this._activeBooking();
        const status = this._issuanceStatus();
        if (!booking) return false;
        if (booking.isCancelled) return false;
        if (status !== 'Idle' && status !== 'Failed') return false;
        // Prevent re-issuance if tickets are already issued
        if (this._issuedTickets().length > 0 && status === 'Idle') return false;
        return true;
    });

    readonly overallProgress = computed<number>(() => {
        const stageIdx = this._stageIndex();
        if (stageIdx < 0) return 0;
        const stagesTotal = ISSUANCE_STAGES.length;
        const stageWeight = 100 / stagesTotal;
        return Math.min(100, stageIdx * stageWeight + (this._stageProgress() * stageWeight) / 100);
    });

    readonly currentStageName = computed<IssuanceStatus | null>(() => {
        const idx = this._stageIndex();
        return idx >= 0 && idx < ISSUANCE_STAGES.length
            ? ISSUANCE_STAGES[idx]
            : null;
    });

    readonly bookingStatusTheme = computed<string>(() => {
        const s = (this._activeBooking()?.paymentStatus ?? '').toLowerCase();
        if (this._activeBooking()?.isCancelled) return 'cancelled';
        if (s === 'confirmed') return 'confirmed';
        if (s === 'pending') return 'pending';
        if (s === 'waitlisted') return 'waitlisted';
        return 'neutral';
    });


    readonly vaultIsEmpty = computed<boolean>(() =>
        this._vaultHasSearched() && this._vaultTickets().length === 0 && !this._vaultLoading()
    );

    readonly vaultResultLabel = computed<string>(() => {
        const { total } = this._vaultPagination();
        if (!this._vaultHasSearched()) return '';
        if (total === 0) return 'No records located';
        return `${total.toLocaleString()} record${total === 1 ? '' : 's'} retrieved`;
    });

    readonly vaultHasActiveFilters = computed<boolean>(() => {
        const f = this._activeFilters();
        return !!(
            f.ticketCode || f.bookingReference || f.passengerNameContains ||
            f.passengerPassport || f.status || f.issueDateFrom ||
            f.issueDateTo || f.includeDeleted
        );
    });

    /** True while the initial parallel data load is in flight. */
    readonly isLifecycleReady = computed<boolean>(
        () => this._selectedTicket() !== null && !this._lifecycleLoading()
    );

    /** Derives the theme key for the status badge from the selected ticket. */
    readonly lifecycleStatusTheme = computed<string>(() => {
        const s = (this._selectedTicket()?.status ?? '').toLowerCase();
        if (s === 'issued' || s === 'active') return 'issued';
        if (s === 'voided' || s === 'cancelled') return 'voided';
        if (s === 'suspended') return 'suspended';
        if (s === 'used' || s === 'boarded') return 'used';
        return 'neutral';
    });

    /** History enriched with formatted dates — zero template logic. */
    readonly enrichedHistory = computed(() =>
        this._passengerHistory().map(t => ({
            ...t,
            issueDateFormatted: t.issueDate
                ? new Date(t.issueDate).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric',
                })
                : '—',
            isCurrent: t.ticketId === this._selectedTicket()?.ticketId,
        }))
    );


    // ════════════════════════════════════════════════════════════════════════
    // Public Methods
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Loads the booking context and prefetches any already-issued tickets.
     * Called by the Smart Page on init.
     */
    loadBookingContext(bookingId: number): void {
        this._bookingLoading.set(true);
        this._bookingError.set(null);
        this._activeBooking.set(null);
        this._issuedTickets.set([]);
        this._issuanceStatus.set('Idle');
        this._globalError.set(null);

        // Load booking details
        this.svc.getBookingDetails(bookingId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (booking) => {
                    this._activeBooking.set(booking);
                    this._bookingLoading.set(false);
                    // Prefetch any existing tickets for this booking
                    this._prefetchExistingTickets(bookingId);
                },
                error: (err) => {
                    this._bookingError.set(this._mapError(err, 'load'));
                    this._bookingLoading.set(false);
                },
            });
    }


    initiateIssuance(bookingId: number): void {
        if (!this.canIssue()) return;

        this._globalError.set(null);
        this._issuedTickets.set([]);
        this.stopPoll$.next(); // cancel any existing poll

        this._advanceToStage(0); // VerifyingPayment

        // Simulate stage 0 verification (150ms — server round-trip approximation)
        setTimeout(() => {
            const booking = this._activeBooking();
            if (!booking) {
                this._fail('Booking context lost. Please reload and retry.');
                return;
            }
            if (booking.isCancelled) {
                this._fail('This booking has been cancelled. Ticket issuance is not permitted.');
                return;
            }
            if (booking.paymentStatus?.toLowerCase() !== 'confirmed') {
                this._fail(
                    `Payment status "${booking.paymentStatus}" does not meet issuance requirements. ` +
                    `Only "Confirmed" bookings may be ticketed.`
                );
                return;
            }
            this._advanceToStage(1); // GeneratingDocuments
            this._callGenerateTickets(bookingId);
        }, 400);
    }

    /** Navigates back to the Booking Search Terminal. */
    navigateToSearchTerminal(): void {
        this.router.navigate([RGH_BASE, 'booking-center']);
    }

    /** Navigates to the PNR Deep Explorer for the active booking. */
    navigateToPnrExplorer(): void {
        const id = this._activeBooking()?.bookingId;
        if (id) this.router.navigate([RGH_BASE, 'booking-center', 'pnr', id]);
    }

    /** Resets pipeline state for a retry attempt. */
    resetForRetry(): void {
        this.stopPoll$.next();
        this._issuanceStatus.set('Idle');
        this._globalError.set(null);
        this._stageIndex.set(-1);
        this._stageProgress.set(0);
        this._issuedTickets.set([]);
    }

    /** Full teardown on component destroy. */
    teardown(): void {
        this.stopPoll$.next();
        this._activeBooking.set(null);
        this._issuedTickets.set([]);
        this._issuanceStatus.set('Idle');
        this._globalError.set(null);
        this._bookingError.set(null);
        this._stageIndex.set(-1);
        this._stageProgress.set(0);
    }

    destroy(): void {
        this.stopPoll$.next();
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
       * Executes a paginated search across the ticket vault.
       * Accepts optional filter overrides; if omitted, re-runs with current filters.
       */
    searchVaultTickets(filters?: Partial<IVaultFilters>, page: number = 1): void {
        if (filters) {
            this._activeFilters.update(f => ({ ...f, ...filters }));
        }
        this._vaultPagination.update(p => ({ ...p, page }));
        this._runVaultSearch();
    }

    /** Updates the active filters signal without triggering a search. */
    updateVaultFilters(partial: Partial<IVaultFilters>): void {
        this._activeFilters.update(f => ({ ...f, ...partial }));
    }

    /**
     * Rapid single-ticket lookup by ticket code.
     * Updates focusedTicket — does NOT affect the vault list.
     */
    fetchTicketByReference(code: string): void {
        if (!code.trim()) return;
        this._vaultLoading.set(true);
        this._vaultError.set(null);
        this._focusedTicket.set(null);

        this.ticketSvc.getTicketDetailsByCode(code.trim())
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (ticket) => {
                    this._focusedTicket.set(ticket);
                    this._vaultLoading.set(false);
                },
                error: (err) => {
                    this._vaultError.set(this._resolveVaultError(err));
                    this._vaultLoading.set(false);
                },
            });
    }

    /** Updates a single ticket's status via the admin endpoint. */
    updateVaultTicketStatus(ticketId: number, newStatus: string): void {
        this._vaultActionLoading.set(true);
        this._vaultActionError.set(null);
        this._vaultActionSuccess.set(null);

        this.ticketSvc.updateTicketStatus(ticketId, { status: newStatus })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (success) => {
                    if (success) {
                        this._vaultTickets.update(list =>
                            list.map(t => t.ticketId === ticketId ? { ...t, status: newStatus } : t)
                        );
                        this._vaultActionLoading.set(false);
                        this._vaultActionSuccess.set(`Ticket status updated to "${newStatus}".`);
                    } else {
                        this._vaultActionError.set('Status update was not acknowledged by the server.');
                        this._vaultActionLoading.set(false);
                    }
                },
                error: (err) => {
                    this._vaultActionError.set(this._resolveVaultError(err));
                    this._vaultActionLoading.set(false);
                },
            });
    }

    /** Voids a ticket with a mandatory reason string. */
    voidVaultTicket(ticketId: number, reason: string): void {
        if (!reason.trim()) {
            this._vaultActionError.set('A void reason is required for audit compliance.');
            return;
        }
        this._vaultActionLoading.set(true);
        this._vaultActionError.set(null);
        this._vaultActionSuccess.set(null);

        this.ticketSvc.voidTicket(ticketId, { reason: reason.trim() })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (success) => {
                    if (success) {
                        this._vaultTickets.update(list =>
                            list.map(t => t.ticketId === ticketId ? { ...t, status: 'Voided' } : t)
                        );
                        this._vaultActionLoading.set(false);
                        this._vaultActionSuccess.set('Ticket voided and marked in the audit record.');
                    } else {
                        this._vaultActionError.set('Void operation was not acknowledged by the server.');
                        this._vaultActionLoading.set(false);
                    }
                },
                error: (err) => {
                    this._vaultActionError.set(this._resolveVaultError(err));
                    this._vaultActionLoading.set(false);
                },
            });
    }

    /** Clears all vault state for a clean slate. */
    clearVault(): void {
        this._vaultTickets.set([]);
        this._activeFilters.set({ ...DEFAULT_VAULT_FILTERS });
        this._vaultPagination.set({ ...DEFAULT_VAULT_PAGINATION });
        this._vaultLoading.set(false);
        this._vaultError.set(null);
        this._vaultHasSearched.set(false);
        this._focusedTicket.set(null);
        this._vaultActionError.set(null);
        this._vaultActionSuccess.set(null);
    }

    /** Clears transient action state (toasts, errors). */
    clearVaultActionState(): void {
        this._vaultActionError.set(null);
        this._vaultActionSuccess.set(null);
    }

    /** Vault pagination helpers. */
    vaultNextPage(): void {
        const { page, totalPages } = this._vaultPagination();
        if (page < totalPages) {
            this._vaultPagination.update(p => ({ ...p, page: p.page + 1 }));
            this._runVaultSearch();
        }
    }

    vaultPrevPage(): void {
        const { page } = this._vaultPagination();
        if (page > 1) {
            this._vaultPagination.update(p => ({ ...p, page: p.page - 1 }));
            this._runVaultSearch();
        }
    }

    vaultGoToPage(page: number): void {
        const { totalPages } = this._vaultPagination();
        if (page < 1 || page > totalPages) return;
        this._vaultPagination.update(p => ({ ...p, page }));
        this._runVaultSearch();
    }

    /** Full teardown for the Vault page on destroy. */
    teardownVault(): void {
        this.clearVault();
    }

    /**
       * Lifecycle Orchestrator — two-stage sequential chain:
       *   Stage 1: Fetch full ticket detail by ticketId.
       *   Stage 2: Using the userId from the result, fetch all tickets
       *            for that passenger to build the history list.
       *
       * Uses RxJS switchMap to ensure no race conditions on rapid ID changes.
       */
    loadTicketLifecycle(ticketId: number): void {
        this._lifecycleLoading.set(true);
        this._lifecycleError.set(null);
        this._selectedTicket.set(null);
        this._passengerHistory.set([]);
        this._lifecycleActionSuccess.set(null);
        this._lifecycleActionError.set(null);

        // Stage 1: Load ticket detail
        this.ticketSvc.getTicketDetails(ticketId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (ticket) => {
                    this._selectedTicket.set(ticket);

                    const userId = String(ticket.passengerId);
                    this.ticketSvc.getTicketsForUser(userId)
                        .pipe(takeUntil(this.destroy$))
                        .subscribe({
                            next: (history) => {
                                this._passengerHistory.set(history ?? []);
                                this._lifecycleLoading.set(false);
                            },
                            error: () => {
                                this._passengerHistory.set([]);
                                this._lifecycleLoading.set(false);
                            },
                        });
                },
                error: (err) => {
                    this._lifecycleError.set(this._resolveLifecycleError(err));
                    this._lifecycleLoading.set(false);
                },
            });
    }

    /**
     * Updates the ticket status and refreshes the selected ticket signal
     * with an optimistic patch while the server responds.
     */
    changeTicketStatus(ticketId: number, newStatus: string): void {
        this._isProcessingAction.set(true);
        this._lifecycleActionError.set(null);
        this._lifecycleActionSuccess.set(null);

        this.ticketSvc.updateTicketStatus(ticketId, { status: newStatus })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (success) => {
                    if (success) {
                        // Optimistic patch
                        this._selectedTicket.update(t =>
                            t ? { ...t, status: newStatus } : t
                        );
                        this._isProcessingAction.set(false);
                        this._lifecycleActionSuccess.set(`Status updated to "${newStatus}" successfully.`);
                    } else {
                        this._lifecycleActionError.set('Status update was not acknowledged. Please retry.');
                        this._isProcessingAction.set(false);
                    }
                },
                error: (err) => {
                    this._lifecycleActionError.set(this._resolveLifecycleError(err));
                    this._isProcessingAction.set(false);
                },
            });
    }

    /**
     * Voids the ticket and refreshes the full lifecycle.
     * On success re-fetches to get the authoritative server state.
     */
    executeVoiding(ticketId: number, reason: string): void {
        if (!reason.trim()) {
            this._lifecycleActionError.set('A void reason is required for regulatory compliance.');
            return;
        }

        this._isProcessingAction.set(true);
        this._lifecycleActionError.set(null);
        this._lifecycleActionSuccess.set(null);

        this.ticketSvc.voidTicket(ticketId, { reason: reason.trim() })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (success) => {
                    if (success) {
                        this._selectedTicket.update(t =>
                            t ? { ...t, status: 'Voided' } : t
                        );
                        this._isProcessingAction.set(false);
                        this._lifecycleActionSuccess.set('Ticket voided and recorded in the regulatory audit log.');

                        this._refreshTicketDetail(ticketId);
                    } else {
                        this._lifecycleActionError.set('Void operation was not acknowledged by the server.');
                        this._isProcessingAction.set(false);
                    }
                },
                error: (err) => {
                    this._lifecycleActionError.set(this._resolveLifecycleError(err));
                    this._isProcessingAction.set(false);
                },
            });
    }

    /** Clears lifecycle action toasts and errors. */
    clearLifecycleActionState(): void {
        this._lifecycleActionError.set(null);
        this._lifecycleActionSuccess.set(null);
    }

    /** Full teardown for the lifecycle page on destroy. */
    teardownLifecycle(): void {
        this._selectedTicket.set(null);
        this._passengerHistory.set([]);
        this._isProcessingAction.set(false);
        this._lifecycleError.set(null);
        this._lifecycleLoading.set(false);
        this._lifecycleActionSuccess.set(null);
        this._lifecycleActionError.set(null);
    }

    /** Navigate to lifecycle page for a specific ticket ID. */
    navigateToLifecycle(ticketId: number): void {
        this.router.navigate([
            '/aoms/reservation-ground-handling/ticketing-hub/lifecycle',
            ticketId,
        ]);
    }

    /** Navigate to the Audit Vault. */
    navigateToAuditVault(): void {
        this.router.navigate([
            '/aoms/reservation-ground-handling/ticketing-hub/audit-vault',
        ]);
    }
    // ════════════════════════════════════════════════════════════════════════
    // Private Pipeline
    // ════════════════════════════════════════════════════════════════════════

    private _prefetchExistingTickets(bookingId: number): void {
        this.svc.getTicketsForBookingAdmin(bookingId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (tickets) => {
                    if (tickets?.length) {
                        this._issuedTickets.set(tickets);
                        this._issuanceStatus.set('Completed');
                    }
                },
                error: () => { /* silent — no existing tickets is valid */ },
            });
    }

    private _callGenerateTickets(bookingId: number): void {
        this._animateStageProgress(1, 60, 1200, () => {
            // At 60% of stage 1 — fire the API
            this.svc.generateTickets(bookingId)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this._advanceToStage(2); // SecuringDigitalSeal
                        this._pollForTickets(bookingId);
                    },
                    error: (err) => this._fail(this._mapError(err, 'generate')),
                });
        });
    }

    private _pollForTickets(bookingId: number): void {
        let attempts = 0;
        this._animateStageProgress(2, 80, 400, () => {
            interval(POLL_INTERVAL_MS)
                .pipe(
                    takeUntil(this.stopPoll$),
                    takeUntil(this.destroy$),
                    take(POLL_MAX_ATTEMPTS),
                    switchMap(() => this.svc.getTicketsForBookingAdmin(bookingId).pipe(
                        catchError(() => EMPTY)
                    ))
                )
                .subscribe({
                    next: (tickets) => {
                        attempts++;
                        if (tickets?.length) {
                            this.stopPoll$.next();
                            this._advanceToStage(3); // Finalizing
                            setTimeout(() => {
                                this._issuedTickets.set(tickets);
                                this._issuanceStatus.set('Completed');
                                this._stageProgress.set(100);
                            }, 700);
                        } else if (attempts >= POLL_MAX_ATTEMPTS) {
                            this._fail('Ticket documents could not be retrieved. Please contact Ground Operations.');
                        }
                    },
                    error: () => this._fail('Polling failed. Verify network connectivity and retry.'),
                });
        });
    }

    /** Smoothly animates stage progress from current value to `target` over `durationMs`. */
    private _animateStageProgress(
        stageIdx: number,
        target: number,
        durationMs: number,
        onComplete?: () => void
    ): void {
        const steps = 30;
        const stepMs = durationMs / steps;
        const start = this._stageProgress();
        const delta = target - start;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            const newVal = start + (delta * step) / steps;
            this._stageProgress.set(Math.round(newVal));
            if (step >= steps) {
                clearInterval(timer);
                if (onComplete) onComplete();
            }
        }, stepMs);
    }

    private _advanceToStage(index: number): void {
        this._stageIndex.set(index);
        this._stageProgress.set(0);
        this._issuanceStatus.set(ISSUANCE_STAGES[index]);
    }

    private _fail(message: string): void {
        this.stopPoll$.next();
        this._issuanceStatus.set('Failed');
        this._globalError.set(message);
        this._stageIndex.set(-1);
        this._stageProgress.set(0);
    }

    private _mapError(err: unknown, context: 'load' | 'generate'): string {
        if (typeof err === 'object' && err !== null) {
            const e = err as Record<string, unknown>;
            const status = e['status'] as number | undefined;

            if (context === 'load') {
                if (status === 404) return 'Booking record not found. Verify the ID and retry.';
                if (status === 403) return 'Access Denied — insufficient clearance for this PNR.';
            }

            if (context === 'generate') {
                if (status === 409) return 'Tickets already exist for this booking. Navigate to PNR Explorer to view them.';
                if (status === 402) return 'Payment verification failed. Confirm payment status before re-attempting issuance.';
                if (status === 422) return 'Booking data is incomplete. Verify passenger documents and seat assignments.';
                if (status === 403) return 'Insufficient privileges for ticket generation. Contact your supervisor.';
            }

            if (status === 0 || status === 503)
                return 'Ground Systems unreachable. Check your network connection and retry.';
            if (typeof e['message'] === 'string') return e['message'];
        }
        return context === 'load'
            ? 'Unable to load booking data. Please retry.'
            : 'Ticket generation failed. Contact the Operations Control Centre.';
    }

    private _runVaultSearch(): void {
        this._vaultLoading.set(true);
        this._vaultError.set(null);

        const f = this._activeFilters();
        const { page, pageSize } = this._vaultPagination();

        const filterDto: ITicketFilter = {
            ...(f.ticketCode && { ticketCode: f.ticketCode }),
            ...(f.bookingReference && { bookingReference: f.bookingReference }),
            ...(f.passengerNameContains && { passengerNameContains: f.passengerNameContains }),
            ...(f.passengerPassport && { passengerPassport: f.passengerPassport }),
            ...(f.status && { status: f.status }),
            ...(f.issueDateFrom && { issueDateFrom: f.issueDateFrom }),
            ...(f.issueDateTo && { issueDateTo: f.issueDateTo }),
            includeDeleted: f.includeDeleted,
        };

        this.ticketSvc.searchTickets(filterDto, page, pageSize)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result: ITicketPaginatedResponse) => {
                    this._vaultTickets.set((result.items ?? []) as unknown as ITicketDetailDto[]);
                    this._vaultPagination.update(p => ({
                        ...p,
                        total: result.totalCount ?? 0,
                        totalPages: Math.ceil((result.totalCount ?? 0) / pageSize),
                    }));
                    this._vaultLoading.set(false);
                    this._vaultHasSearched.set(true);
                },
                error: (err) => {
                    this._vaultError.set(this._resolveVaultError(err));
                    this._vaultTickets.set([]);
                    this._vaultLoading.set(false);
                    this._vaultHasSearched.set(true);
                },
            });
    }

    private _resolveVaultError(err: unknown): string {
        if (typeof err === 'object' && err !== null) {
            const e = err as Record<string, unknown>;
            const status = e['status'] as number | undefined;
            if (status === 404) return 'Ticket record not found. Verify the code and retry.';
            if (status === 403) return 'Access Denied — your clearance level does not permit vault access.';
            if (status === 0 || status === 503)
                return 'Vault Systems unreachable. Check your network connection and retry.';
            if (typeof e['message'] === 'string') return e['message'];
        }
        return 'An unexpected vault error occurred. Contact the Operations Control Centre.';
    }

    private _refreshTicketDetail(ticketId: number): void {
        this.ticketSvc.getTicketDetails(ticketId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({ next: (t) => this._selectedTicket.set(t) });
    }

    private _resolveLifecycleError(err: unknown): string {
        if (typeof err === 'object' && err !== null) {
            const e = err as Record<string, unknown>;
            const status = e['status'] as number | undefined;
            if (status === 404) return 'Ticket not found. It may have been archived or the ID is incorrect.';
            if (status === 403) return 'Unauthorized action — your clearance level does not permit this operation.';
            if (status === 409) return 'Conflict: This ticket is locked by another active process.';
            if (status === 422) return 'Unprocessable: This ticket cannot be voided in its current state.';
            if (status === 0 || status === 503)
                return 'Lifecycle Systems unreachable. Verify your network connection and retry.';
            if (typeof e['message'] === 'string') return e['message'];
        }
        return 'An unexpected lifecycle error occurred. Contact the Operations Control Centre.';
    }

}