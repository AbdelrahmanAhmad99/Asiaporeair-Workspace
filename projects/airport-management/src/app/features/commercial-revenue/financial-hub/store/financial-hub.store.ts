
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, Subscription, forkJoin } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { PaymentsService } from '@shared-core';
import {
    IPaymentTransaction,
    IPaymentFilter,
    IPaymentSearchResult,
    IRefundRequest,
    IRefundResult,
    IDailyRevenueStats,
    normalizePaymentTransaction,
} from '@shared-core';

// ── Filter & option constants ──────────────────────────────────────────────

/** Status values surfaced in the Precision Search filter bar and status badges. */
export const PAYMENT_STATUS_OPTIONS: string[] = ['Succeeded', 'Pending', 'Failed', 'Refunded'];

/** Payment method / provider values surfaced in the filter bar and data grid. */
export const PAYMENT_METHOD_OPTIONS: string[] = ['card', 'paypal', 'bank_transfer', 'apple_pay', 'google_pay'];

const DEFAULT_FILTERS: IPaymentFilter = {
    bookingId: null,
    minAmount: null,
    maxAmount: null,
    startDate: null,
    endDate: null,
    status: null,
    paymentMethod: null,
};

// ── Pagination state ──────────────────────────────────────────────────────
export interface IPaymentPagination {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

const DEFAULT_PAGINATION: IPaymentPagination = {
    currentPage: 0,
    pageSize: 25,
    totalCount: 0,
    totalPages: 0,
};

const FINANCIAL_HUB_BASE = '/aoms/commercial-revenue/financial-hub';

export type ExportFormat = 'PDF' | 'CSV';

@Injectable({ providedIn: 'root' })
export class FinancialHubStore {
    private readonly paymentsSvc = inject(PaymentsService);
    private readonly router = inject(Router);

    // ── Private writable signals ───────────────────────────────────────────
    private readonly _payments = signal<IPaymentTransaction[]>([]);
    private readonly _searchFilters = signal<IPaymentFilter>({ ...DEFAULT_FILTERS });
    private readonly _pagination = signal<IPaymentPagination>(DEFAULT_PAGINATION);
    private readonly _isAuditing = signal<boolean>(false);
    private readonly _isLoadingMore = signal<boolean>(false);
    private readonly _auditError = signal<string | null>(null);
    private readonly _hasSearched = signal<boolean>(false);
    private readonly _selectedTransaction = signal<IPaymentTransaction | null>(null);
    private readonly _isExporting = signal<boolean>(false);
    private readonly _exportError = signal<string | null>(null);
    private readonly _exportSuccess = signal<string | null>(null);

    private _activeSub: Subscription | null = null;

    // ── Public read-only signals ───────────────────────────────────────────
    readonly payments = this._payments.asReadonly();
    readonly searchFilters = this._searchFilters.asReadonly();
    readonly pagination = this._pagination.asReadonly();
    readonly isAuditing = this._isAuditing.asReadonly();
    readonly isLoadingMore = this._isLoadingMore.asReadonly();
    readonly auditError = this._auditError.asReadonly();
    readonly hasSearched = this._hasSearched.asReadonly();
    readonly selectedTransaction = this._selectedTransaction.asReadonly();
    readonly isExporting = this._isExporting.asReadonly();
    readonly exportError = this._exportError.asReadonly();
    readonly exportSuccess = this._exportSuccess.asReadonly();

    // ── Computed signals ────────────────────────────────────────────────────

    /** Sum of `amount` across all currently loaded (filtered) results. */
    readonly totalAmountFiltered = computed<number>(() =>
        this._payments().reduce((sum, p) => sum + (p.amount ?? 0), 0)
    );

    readonly hasResults = computed<boolean>(() => this._payments().length > 0);

    /** True while more pages remain for the current filter set (infinite scroll). */
    readonly hasMore = computed<boolean>(() => {
        const { currentPage, totalPages } = this._pagination();
        return currentPage > 0 && currentPage < totalPages;
    });

    readonly hasActiveFilters = computed<boolean>(() => {
        const f = this._searchFilters();
        return Object.values(f).some(v => v !== null && v !== '' && v !== undefined);
    });

    // readonly resultCountLabel = computed<string>(() => {
    //     if (!this._hasSearched()) return '';
    //     const { totalCount } = this._pagination();
    //     if (totalCount === 0) return 'No transactions found';
    //     return `${this._payments().length.toLocaleString()} of ${totalCount.toLocaleString()} transactions`;
    // });

    /** Drives the Transaction Detail side drawer's open/closed state. */
    readonly isDrawerOpen = computed<boolean>(() => this._selectedTransaction() !== null);

    /**
     * Human-readable result count label shown above the audit grid.
     * e.g. "42 transactions found" or "No transactions found for these filters."
     */
    readonly resultCountLabel = computed<string>(() => {
        const count = this._payments().length;
        const total = this._pagination().totalCount;
        if (count === 0) return 'No transactions found for these filters.';
        if (total > count) return `Showing ${count.toLocaleString()} of ${total.toLocaleString()} transactions`;
        return `${count.toLocaleString()} transaction${count === 1 ? '' : 's'} found`;
    });

    // ══════════════════════════════════════════════════════════════════════
    // Actions — Search & Infinite Scroll
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Apply (optional) filter changes and run a fresh search from page 1.
     * Replaces the current result set.
     */
    performSearch(filters?: Partial<IPaymentFilter>): void {
        if (filters) {
            this._searchFilters.update(curr => ({ ...curr, ...filters }));
        }
        this._search(1, false);
    }

    /**
     * Signal-based infinite scroll — fetches the next page and appends it to
     * the in-memory `payments` array. No-ops if already loading or no more
     * pages remain.
     */
    loadMore(): void {
        if (this._isAuditing() || this._isLoadingMore() || !this.hasMore()) return;
        const nextPage = this._pagination().currentPage + 1;
        this._search(nextPage, true);
    }

    /** Update filter values without triggering a search (used by the filter bar's live form). */
    setFilters(filters: Partial<IPaymentFilter>): void {
        this._searchFilters.update(curr => ({ ...curr, ...filters }));
    }

    /** Reset all filters to defaults and re-run the search from page 1. */
    resetFilters(): void {
        this._searchFilters.set({ ...DEFAULT_FILTERS });
        this._search(1, false);
    }

    private _search(page: number, append: boolean): void {
        this._cancelActiveSub();

        if (append) {
            this._isLoadingMore.set(true);
        } else {
            this._isAuditing.set(true);
            this._auditError.set(null);
        }

        const filter = this._searchFilters();
        const pageSize = this._pagination().pageSize;

        this._activeSub = this.paymentsSvc
            .searchPayments(filter, page, pageSize)
            .pipe(
                catchError(err => {
                    this._handleAuditError(err, append ? 'loadMore' : 'performSearch');
                    return EMPTY;
                }),
                finalize(() => {
                    this._isAuditing.set(false);
                    this._isLoadingMore.set(false);
                    this._hasSearched.set(true);
                })
            )
            .subscribe((result: IPaymentSearchResult) => {
                // PaymentsService already normalizes + unwraps ApiResponse / PascalCase shapes.
                const items = (result?.items ?? []).map(item => normalizePaymentTransaction(item));

                if (append) {
                    this._payments.update(list => [...list, ...items]);
                } else {
                    this._payments.set(items);
                }

                const totalCount = result?.totalCount ?? items.length;
                const totalPages = result?.totalPages ?? Math.max(items.length > 0 ? 1 : 0, Math.ceil(totalCount / pageSize));

                this._pagination.set({
                    currentPage: result?.pageNumber ?? page,
                    pageSize: result?.pageSize ?? pageSize,
                    totalCount,
                    totalPages,
                });
            });
    }

    // ══════════════════════════════════════════════════════════════════════
    // Actions — Transaction Detail Drawer
    // ══════════════════════════════════════════════════════════════════════

    selectTransaction(transaction: IPaymentTransaction): void {
        this._selectedTransaction.set(transaction);
    }

    closeTransactionDetail(): void {
        this._selectedTransaction.set(null);
    }

    // ══════════════════════════════════════════════════════════════════════
    // Actions — Audit Export
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Generates a branded audit export of the currently loaded result set.
     *
     * NOTE — NO SERVER EXPORT ENDPOINT: `PaymentsService` does not yet expose
     * a server-side export endpoint. Until one ships:
     *  - CSV is generated client-side from the in-memory `payments` signal,
     *    with a "luxury" Asiaporeair-branded header block, downloaded as a Blob.
     *  - PDF opens a print-ready, styled HTML report in a new tab so the
     *    operator can use the browser's "Print to PDF" — no PDF library is
     *    wired into this module yet.
     *
     * Exports only the currently loaded page(s) of results, not the full
     * server-side result set, since pages are fetched incrementally via
     * infinite scroll.
     */
    exportAuditReport(format: ExportFormat): void {
        const rows = this._payments();

        if (rows.length === 0) {
            this._exportError.set('There are no transactions in the current view to export.');
            this._clearExportMessagesAfterDelay();
            return;
        }

        this._isExporting.set(true);
        this._exportError.set(null);
        this._exportSuccess.set(null);

        try {
            if (format === 'CSV') {
                this._exportCsv(rows);
            } else {
                this._exportPdf(rows);
            }
            this._exportSuccess.set(
                `Audit export (${format}) generated for ${rows.length.toLocaleString()} ` +
                `transaction${rows.length === 1 ? '' : 's'}.`
            );
        } catch (err) {
            console.error('[FinancialHubStore::exportAuditReport]', err);
            this._exportError.set(
                format === 'PDF'
                    ? 'Could not open the print preview — check your browser\'s pop-up blocker and try again.'
                    : 'The CSV export could not be generated. Please try again.'
            );
        } finally {
            this._isExporting.set(false);
            this._clearExportMessagesAfterDelay();
        }
    }

    private _exportCsv(rows: IPaymentTransaction[]): void {
        const header = [
            '"ASIAPOREAIR — GLOBAL PAYMENT AUDITOR"',
            `"Generated: ${new Date().toLocaleString()}"`,
            `"Records: ${rows.length}"`,
            '""',
        ];
        const columns = [
            'Payment ID', 'Transaction ID', 'Booking Reference', 'Booking ID', 'Amount', 'Currency',
            'Payment Method', 'Status', 'Transaction Date & Time', 'Refunded',
        ];
        const lines = rows.map(r => [
            r.paymentId,
            r.transactionId,
            r.bookingReference || `BK-${r.bookingId}`,
            r.bookingId,
            r.amount.toFixed(2),
            r.currency || 'SGD',
            r.paymentMethod || r.method || 'Card',
            r.status,
            r.transactionDate || r.transactionDateTime || '',
            r.isRefunded ? 'Yes' : 'No',
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

        const csv = [...header, columns.join(','), ...lines].join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        this._downloadBlob(blob, `asiaporeair-audit-log-${this._timestamp()}.csv`);
    }

    private _exportPdf(rows: IPaymentTransaction[]): void {
        const win = window.open('', '_blank');
        if (!win) {
            throw new Error('Pop-up blocked — unable to open print preview.');
        }

        const rowsHtml = rows.map(r => `
      <tr>
        <td>#${r.paymentId}</td>
        <td>${this._escapeHtml(r.transactionId)}</td>
        <td><strong>${this._escapeHtml(r.bookingReference || ('BK-' + r.bookingId))}</strong> (#${r.bookingId})</td>
        <td class="amt">${(r.currency || 'SGD').toUpperCase()} ${r.amount.toFixed(2)}</td>
        <td>${this._escapeHtml(r.paymentMethod || r.method || 'Card')}</td>
        <td>${this._escapeHtml(r.status)}</td>
        <td>${new Date(r.transactionDate || r.transactionDateTime || '').toLocaleString()}</td>
        <td>${r.isRefunded ? 'Yes' : 'No'}</td>
      </tr>`).join('');

        win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Asiaporeair — Audit Log Export</title>
          <style>
            body { font-family: 'Montserrat', Arial, sans-serif; color: #101056; padding: 32px; }
            h1 { color: #051937; font-size: 20px; margin: 0 0 4px; }
            .meta { color: #B68F24; font-size: 11px; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { background: #051937; color: #E2C780; text-align: left; padding: 8px; text-transform: uppercase; letter-spacing: 0.04em; font-size: 10px; }
            td { padding: 6px 8px; border-bottom: 1px solid #eee; }
            tr:nth-child(even) td { background: #f8f9fa; }
            .amt { color: #B68F24; font-weight: 700; }
            @media print { body { padding: 12px; } }
          </style>
        </head>
        <body>
          <h1>Asiaporeair &mdash; Global Payment Auditor</h1>
          <div class="meta">Audit Export &middot; ${new Date().toLocaleString()} &middot; ${rows.length} records</div>
          <table>
            <thead>
              <tr>
                <th>Payment ID</th><th>Transaction ID</th><th>Booking Reference</th><th>Amount</th>
                <th>Method</th><th>Status</th><th>Date & Time</th><th>Refunded</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </body>
      </html>
    `);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 350);
    }

    private _downloadBlob(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    private _escapeHtml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    private _timestamp(): string {
        return new Date().toISOString().replace(/[:.]/g, '-');
    }

    private _clearExportMessagesAfterDelay(): void {
        setTimeout(() => {
            this._exportSuccess.set(null);
            this._exportError.set(null);
        }, 5000);
    }

    // ══════════════════════════════════════════════════════════════════════
    // Lifecycle / State Management
    // ══════════════════════════════════════════════════════════════════════

    /**
     * Soft cleanup for leaving the auditor surface.
     * Intentionally does NOT wipe `_payments` or cancel an in-flight search —
     * the Executive Dashboard ledger reuses the same root store cache, and
     * Angular may run the next page's ngOnInit before this page's ngOnDestroy.
     */
    clearAuditState(): void {
        this._isAuditing.set(false);
        this._isLoadingMore.set(false);
        this._auditError.set(null);
        this._selectedTransaction.set(null);
        this._exportError.set(null);
        this._exportSuccess.set(null);
    }

    /** Hard reset of audit results — use only when explicitly discarding the cache. */
    resetAuditResults(): void {
        this._cancelActiveSub();
        this._payments.set([]);
        this._searchFilters.set({ ...DEFAULT_FILTERS });
        this._pagination.set(DEFAULT_PAGINATION);
        this._isAuditing.set(false);
        this._isLoadingMore.set(false);
        this._auditError.set(null);
        this._hasSearched.set(false);
        this._selectedTransaction.set(null);
        this._exportError.set(null);
        this._exportSuccess.set(null);
    }

    clearAuditError(): void {
        this._auditError.set(null);
    }

    // ── Navigation ──────────────────────────────────────────────────────────

    navigateToExecutiveDashboard(): void { this.router.navigate([FINANCIAL_HUB_BASE, 'executive-dashboard']); }
    navigateToRefundTerminal(): void { this.router.navigate([FINANCIAL_HUB_BASE, 'refund-terminal']); }
    navigateToAuditor(): void { this.router.navigate([FINANCIAL_HUB_BASE, 'global-payment-auditor']); }

    // ── Private ──────────────────────────────────────────────────────────────

    private _cancelActiveSub(): void {
        if (this._activeSub && !this._activeSub.closed) this._activeSub.unsubscribe();
        this._activeSub = null;
    }

    /**
     * Isolated audit error handler — writes to `_auditError` only. Keeps this
     * surface's error state independent from any other Commercial Revenue
     * feature store, per the established per-surface error isolation pattern.
     */
    private _handleAuditError(err: unknown, context: string): void {
        const httpErr = err as { status?: number; error?: { message?: string } };
        let message: string;

        switch (httpErr?.status) {
            case 400:
                message = httpErr.error?.message ?? 'The audit query contains invalid search criteria.';
                break;
            case 401:
                message = 'Your session has expired. Please re-authenticate to access the Financial Audit Hub.';
                break;
            case 403:
                message = 'Access Denied — Financial Audit access requires elevated clearance.';
                break;
            case 404:
                message = 'No audit endpoint was found for this query.';
                break;
            case 422:
                message = httpErr.error?.message ??
                    'The search criteria could not be processed. Check your date ranges and amount filters.';
                break;
            case 500:
                message = 'A financial gateway fault occurred while retrieving transactions. Contact operations support.';
                break;
            case 503:
                message = 'The payments service is temporarily offline. Retry in a few moments.';
                break;
            case 504:
                message = 'The payment gateway timed out while processing this audit query. Narrow your filters and try again.';
                break;
            default:
                message = httpErr.error?.message ?? `An unexpected error occurred during ${context}. Please try again.`;
        }

        console.error(`[FinancialHubStore::${context}]`, err);
        this._auditError.set(message);
    }


    // ══════════════════════════════════════════════════════════════════════
    // Refund Processing Terminal — Phase 2 Additions
    // ══════════════════════════════════════════════════════════════════════

    // ── Private writable signals ─────────────────────────────────────────
    private readonly _refundTargetTransaction = signal<IPaymentTransaction | null>(null);
    private readonly _isLoadingRefundTarget = signal<boolean>(false);
    private readonly _isProcessingRefund = signal<boolean>(false);
    private readonly _refundStatus = signal<'idle' | 'success' | 'error'>('idle');
    private readonly _refundResult = signal<IRefundResult | null>(null);
    private readonly _refundError = signal<string | null>(null);
    private readonly _refundLookupError = signal<string | null>(null);

    // ── Public read-only signals ─────────────────────────────────────────
    readonly refundTargetTransaction = this._refundTargetTransaction.asReadonly();
    readonly isLoadingRefundTarget = this._isLoadingRefundTarget.asReadonly();
    readonly isProcessingRefund = this._isProcessingRefund.asReadonly();
    readonly refundStatus = this._refundStatus.asReadonly();
    readonly refundResult = this._refundResult.asReadonly();
    readonly refundError = this._refundError.asReadonly();
    readonly refundLookupError = this._refundLookupError.asReadonly();

    // ── Computed: canProcessRefund ────────────────────────────────────────
    /**
     * Guards the "Process Refund" CTA. Returns true only when:
     *  • A transaction is loaded AND not already refunded.
     *  • Status is Succeeded / Captured / Completed.
     *  • No refund is currently in-flight and the terminal is not in
     *    success state (prevent double-submit).
     *
     * NOTE: Real RBAC ('Financial Supervisor') should wire to
     * authStore.hasRole('FinancialSupervisor') once AuthStore ships.
     */
    readonly canProcessRefund = computed<boolean>(() => {
        const tx = this._refundTargetTransaction();
        if (!tx) return false;
        if (tx.isRefunded) return false;
        if (this._isProcessingRefund()) return false;
        if (this._refundStatus() === 'success') return false;
        const eligibleStatuses = ['succeeded', 'captured', 'completed', 'success', 'paid'];
        return eligibleStatuses.includes((tx.status ?? '').toLowerCase().trim());
    });

    // ── Actions ──────────────────────────────────────────────────────────

    /**
     * Load a specific transaction by paymentId for the refund terminal.
     * Because PaymentsService has no direct getById endpoint, we perform
     * a broad searchPayments and match client-side — acceptable for the
     * admin surface and avoids a dedicated backend endpoint change.
     */
    loadTransactionForRefund(paymentId: number): void {
        this._isLoadingRefundTarget.set(true);
        this._refundLookupError.set(null);
        this._refundTargetTransaction.set(null);
        this._refundStatus.set('idle');
        this._refundResult.set(null);
        this._refundError.set(null);

        this.paymentsSvc
            .searchPayments({ bookingId: null }, 1, 100)
            .pipe(
                catchError(err => {
                    this._handleRefundLookupError(err, 'loadTransactionForRefund');
                    return EMPTY;
                }),
                finalize(() => this._isLoadingRefundTarget.set(false))
            )
            .subscribe((result: IPaymentSearchResult) => {
                const items = (result?.items ?? []).map(item => normalizePaymentTransaction(item));
                const found = items.find(tx => tx.paymentId === paymentId);
                if (found) {
                    this._refundTargetTransaction.set(found);
                } else {
                    this._refundLookupError.set(
                        `Transaction #${paymentId} could not be located. ` +
                        `Verify the payment ID or search the audit log.`
                    );
                }
            });
    }

    /** Pre-load a transaction already resolved by the audit grid. */
    setRefundTargetTransaction(tx: IPaymentTransaction): void {
        this._refundTargetTransaction.set(tx);
        this._refundStatus.set('idle');
        this._refundResult.set(null);
        this._refundError.set(null);
        this._refundLookupError.set(null);
    }

    /**
     * Execute the refund. On success, optimistically patches the in-memory
     * transaction to isRefunded:true and fires a console.info audit log entry.
     */
    async executeRefund(refundData: IRefundRequest): Promise<boolean> {
        if (!this.canProcessRefund()) return false;
        this._isProcessingRefund.set(true);
        this._refundError.set(null);
        this._refundStatus.set('idle');

        return new Promise<boolean>(resolve => {
            this.paymentsSvc
                .processRefund(refundData)
                .pipe(
                    catchError(err => {
                        this._handleRefundError(err, 'executeRefund');
                        this._refundStatus.set('error');
                        resolve(false);
                        return EMPTY;
                    }),
                    finalize(() => this._isProcessingRefund.set(false))
                )
                .subscribe(result => {
                    this._refundResult.set(result);
                    this._refundStatus.set('success');

                    // Optimistic patch — badge transitions to Refunded without re-fetch
                    const tx = this._refundTargetTransaction();
                    if (tx) {
                        this._refundTargetTransaction.set({ ...tx, isRefunded: true, status: 'Refunded' });
                    }

                    // Audit log — per spec: every successful refund is console-logged
                    console.info('[FinancialHubStore::executeRefund] Refund processed:', {
                        originalPaymentId: result.originalPaymentId,
                        refundTransactionId: result.refundTransactionId,
                        refundedAmount: result.refundedAmount,
                        status: result.status,
                        timestamp: result.timestamp,
                    });

                    this._clearRefundSuccessAfterDelay();
                    resolve(true);
                });
        });
    }

    clearRefundState(): void {
        this._refundTargetTransaction.set(null);
        this._isLoadingRefundTarget.set(false);
        this._isProcessingRefund.set(false);
        this._refundStatus.set('idle');
        this._refundResult.set(null);
        this._refundError.set(null);
        this._refundLookupError.set(null);
    }

    clearRefundError(): void { this._refundError.set(null); }
    clearRefundLookupError(): void { this._refundLookupError.set(null); }

    navigateToRefundTerminalById(paymentId: number): void {
        this.router.navigate([FINANCIAL_HUB_BASE, 'refund-terminal', paymentId]);
    }

    // ── Private refund error handlers ──────────────────────────────────────

    private _handleRefundError(err: unknown, context: string): void {
        const httpErr = err as { status?: number; error?: { message?: string } };
        let message: string;
        switch (httpErr?.status) {
            case 400:
                message = httpErr.error?.message ?? 'The refund request is invalid. Verify the amount does not exceed the original payment.';
                break;
            case 401:
                message = 'Your session has expired. Re-authenticate to process financial transactions.';
                break;
            case 403:
                message = 'Authorization Denied — Processing refunds requires Financial Supervisor clearance. Contact your line manager to escalate.';
                break;
            case 404:
                message = 'The original payment record could not be found. It may have already been archived.';
                break;
            case 409:
                message = 'Conflict — this payment has already been refunded or a refund is already pending in the gateway. Check the audit log.';
                break;
            case 422:
                message = httpErr.error?.message ?? 'Refund validation failed: the requested amount exceeds the original settled amount.';
                break;
            case 500:
                message = 'A critical gateway fault occurred. The refund has NOT been processed. Contact operations support immediately.';
                break;
            case 503:
                message = 'The payment gateway is temporarily unavailable. Verify status in the audit log before retrying.';
                break;
            default:
                message = httpErr.error?.message ?? `An unexpected error occurred during ${context}. Verify the transaction status before retrying.`;
        }
        console.error(`[FinancialHubStore::${context}]`, err);
        this._refundError.set(message);
    }

    private _handleRefundLookupError(err: unknown, context: string): void {
        const httpErr = err as { status?: number; error?: { message?: string } };
        let message: string;
        switch (httpErr?.status) {
            case 401: message = 'Your session has expired. Re-authenticate to look up transactions.'; break;
            case 403: message = 'Access Denied — Transaction lookup requires Financial Admin clearance.'; break;
            case 404: message = 'No transaction record was found for the provided ID.'; break;
            case 503: message = 'The payments service is temporarily offline. Retry in a few moments.'; break;
            default: message = httpErr.error?.message ?? `Unable to load transaction data (${context}). Please try again.`;
        }
        console.error(`[FinancialHubStore::${context}]`, err);
        this._refundLookupError.set(message);
    }

    private _clearRefundSuccessAfterDelay(): void {
        setTimeout(() => {
            if (this._refundStatus() === 'success') this._refundStatus.set('idle');
        }, 8000);
    }



    // ── Private writable signals ─────────────────────────────────────────
    private readonly _dailyRevenueData = signal<IExecutiveRevenuePoint[]>([]);
    private readonly _previousPeriodRevenueData = signal<IExecutiveRevenuePoint[]>([]);
    private readonly _timeRange = signal<ExecutiveTimeRange>(EXEC_DEFAULT_RANGE);
    private readonly _isLoadingExecutiveReport = signal<boolean>(false);
    private readonly _isDataStale = signal<boolean>(false);
    private readonly _executiveReportError = signal<string | null>(null);
    private readonly _lastRefreshedAt = signal<Date | null>(null);
    private _executiveReportSub: Subscription | null = null;

    // ── Public read-only signals ─────────────────────────────────────────
    readonly dailyRevenueData = this._dailyRevenueData.asReadonly();
    readonly timeRange = this._timeRange.asReadonly();
    readonly isLoadingExecutiveReport = this._isLoadingExecutiveReport.asReadonly();
    readonly isDataStale = this._isDataStale.asReadonly();
    readonly executiveReportError = this._executiveReportError.asReadonly();
    readonly lastRefreshedAt = this._lastRefreshedAt.asReadonly();
    readonly timeRangeOptions = computed(() => EXECUTIVE_TIME_RANGE_OPTIONS);

    // ── Computed signals ─────────────────────────────────────────────────

    readonly hasExecutiveData = computed<boolean>(() => this._dailyRevenueData().length > 0);

    /** True once at least one audit search has loaded payments this session. */
    readonly hasPaymentDataForRefunds = computed<boolean>(() => this._payments().length > 0);

    readonly totalGrossRevenue = computed<number>(() =>
        this._dailyRevenueData().reduce((sum, d) => sum + (d.totalRevenue ?? 0), 0)
    );

    readonly totalRefunds = computed<number>(() =>
        this._dailyRevenueData().reduce((sum, d) => sum + (d.refundsForDay ?? 0), 0)
    );

    readonly totalEstimatedTax = computed<number>(() =>
        this._dailyRevenueData().reduce((sum, d) => sum + (d.estimatedTax ?? 0), 0)
    );

    readonly totalTransactionCount = computed<number>(() =>
        this._dailyRevenueData().reduce((sum, d) => sum + (d.transactionCount ?? 0), 0)
    );

    /** Absolute net revenue amount: gross − refunds − estimated tax. */
    readonly netRevenueAmount = computed<number>(() => {
        const net = this.totalGrossRevenue() - this.totalRefunds() - this.totalEstimatedTax();
        return Math.max(0, net);
    });

    /**
     * netProfitMargin — net revenue as a percentage of gross revenue.
     * Per spec: "A computed signal subtracting refunds and taxes from
     * gross revenue" — expressed here as the resulting margin percentage,
     * with `netRevenueAmount` above exposing the raw currency figure.
     */
    readonly netProfitMargin = computed<number>(() => {
        const gross = this.totalGrossRevenue();
        if (gross <= 0) return 0;
        return (this.netRevenueAmount() / gross) * 100;
    });

    /**
     * revenueGrowthRate — % change of gross revenue for the current
     * selected period vs. the immediately preceding period of equal length.
     */
    readonly revenueGrowthRate = computed<number>(() => {
        const current = this.totalGrossRevenue();
        const previous = this._previousPeriodRevenueData().reduce((sum, d) => sum + (d.totalRevenue ?? 0), 0);
        if (previous <= 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    });

    /**
     * transactionSuccessRate — derived from `_payments` (Global Payment
     * Auditor data). Returns null (not 0) when no payments have been
     * loaded this session, so the UI can render "—" instead of a
     * misleading 0% success rate.
     */
    readonly transactionSuccessRate = computed<number | null>(() => {
        const payments = this._payments();
        if (payments.length === 0) return null;
        const successCount = payments.filter(p =>
            ['succeeded', 'captured', 'completed', 'success', 'paid'].includes((p.status ?? '').toLowerCase().trim())
        ).length;
        return (successCount / payments.length) * 100;
    });

    readonly currentRangeLabel = computed<string>(() =>
        EXECUTIVE_TIME_RANGE_OPTIONS.find(o => o.value === this._timeRange())?.label ?? 'Custom Range'
    );

    // ── Actions ──────────────────────────────────────────────────────────

    /**
     * Fetch and aggregate the executive revenue report for a time range.
     * @param range Time range to fetch; defaults to the currently selected range.
     * @param background When true, sets `isDataStale` instead of the full
     *   `isLoadingExecutiveReport` flag — existing data stays on screen
     *   while the refresh happens, per the spec's "Signal-based Refresh
     *   mechanism" requirement.
     */
    fetchExecutiveReport(range?: ExecutiveTimeRange, background = false): void {
        const targetRange = range ?? this._timeRange();
        this._timeRange.set(targetRange);
        this._cancelExecutiveReportSub();

        if (background) {
            this._isDataStale.set(true);
        } else {
            this._isLoadingExecutiveReport.set(true);
        }
        this._executiveReportError.set(null);

        const days = EXECUTIVE_TIME_RANGE_OPTIONS.find(o => o.value === targetRange)?.days ?? 7;
        const currentDates = this._buildDateRange(days, 0);
        const previousDates = this._buildDateRange(days, days);

        const currentCalls$ = forkJoin(currentDates.map(d => this.paymentsSvc.getDailyRevenue(d)));
        const previousCalls$ = forkJoin(previousDates.map(d => this.paymentsSvc.getDailyRevenue(d)));

        this._executiveReportSub = forkJoin([currentCalls$, previousCalls$])
            .pipe(
                catchError(err => {
                    this._handleExecutiveReportError(err, 'fetchExecutiveReport');
                    return EMPTY;
                }),
                finalize(() => {
                    this._isLoadingExecutiveReport.set(false);
                    this._isDataStale.set(false);
                    this._lastRefreshedAt.set(new Date());
                })
            )
            .subscribe(([currentStats, previousStats]) => {
                this._dailyRevenueData.set(currentStats.map(s => this._enrichRevenuePoint(s)));
                this._previousPeriodRevenueData.set(previousStats.map(s => this._enrichRevenuePoint(s)));
            });
    }

    /**
     * Signal-based background refresh — re-fetches the current time range
     * while keeping existing widgets/chart populated (uses `isDataStale`
     * rather than the blocking loading flag).
     */
    refreshExecutiveReport(): void {
        this.fetchExecutiveReport(this._timeRange(), true);
    }

    setTimeRange(range: ExecutiveTimeRange): void {
        this.fetchExecutiveReport(range, false);
    }

    clearExecutiveReportState(): void {
        this._cancelExecutiveReportSub();
        this._dailyRevenueData.set([]);
        this._previousPeriodRevenueData.set([]);
        this._isLoadingExecutiveReport.set(false);
        this._isDataStale.set(false);
        this._executiveReportError.set(null);
        this._lastRefreshedAt.set(null);
    }

    clearExecutiveReportError(): void {
        this._executiveReportError.set(null);
    }

    // ── Private ──────────────────────────────────────────────────────────

    private _cancelExecutiveReportSub(): void {
        if (this._executiveReportSub && !this._executiveReportSub.closed) {
            this._executiveReportSub.unsubscribe();
        }
        this._executiveReportSub = null;
    }

    /**
     * Builds `days` consecutive YYYY-MM-DD date strings ending `offsetDays`
     * before today, oldest-first. offsetDays=0 → the current period ending
     * today; offsetDays=days → the immediately preceding period of equal length.
     */
    private _buildDateRange(days: number, offsetDays: number): string[] {
        const dates: string[] = [];
        const today = new Date();
        for (let i = 0; i < days; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i - offsetDays);
            dates.push(d.toISOString().slice(0, 10));
        }
        return dates.reverse();
    }

    /** Attaches derived refundsForDay and estimated tax to a real API stat. */
    private _enrichRevenuePoint(stat: IDailyRevenueStats): IExecutiveRevenuePoint {
        const statDay = (stat.date ?? '').slice(0, 10);
        const refundsForDay = this._payments()
            .filter(p => (p.isRefunded || (p.status ?? '').toLowerCase().trim() === 'refunded') && (p.transactionDate || p.transactionDateTime || '').slice(0, 10) === statDay)
            .reduce((sum, p) => sum + (p.amount ?? 0), 0);

        return {
            ...stat,
            refundsForDay,
            estimatedTax: (stat.totalRevenue ?? 0) * ESTIMATED_TAX_RATE,
        };
    }

    private _handleExecutiveReportError(err: unknown, context: string): void {
        const httpErr = err as { status?: number; error?: { message?: string } };
        let message: string;
        switch (httpErr?.status) {
            case 401: message = 'Your session has expired. Re-authenticate to view financial intelligence.'; break;
            case 403: message = 'Access Denied — Executive Financial Intelligence requires elevated clearance.'; break;
            case 404: message = 'Revenue data is not yet available for the selected period.'; break;
            case 500: message = 'A reporting engine fault occurred while aggregating revenue data. Contact operations support.'; break;
            case 503: message = 'The revenue reporting service is temporarily offline. Retry in a few moments.'; break;
            default: message = httpErr.error?.message ?? `An unexpected error occurred while loading the executive report (${context}).`;
        }
        console.error(`[FinancialHubStore::${context}]`, err);
        this._executiveReportError.set(message);
    }
}

// ── Executive Revenue Dashboard — Types & Constants ─────────────────────────

export type ExecutiveTimeRange = '24h' | '7d' | '30d';

export const EXECUTIVE_TIME_RANGE_OPTIONS: { value: ExecutiveTimeRange; label: string; days: number }[] = [
    { value: '24h', label: 'Last 24 Hours', days: 1 },
    { value: '7d', label: 'Last 7 Days', days: 7 },
    { value: '30d', label: 'Last 30 Days', days: 30 },
];

const EXEC_DEFAULT_RANGE: ExecutiveTimeRange = '7d';


const ESTIMATED_TAX_RATE = 0.09;


export interface IExecutiveRevenuePoint extends IDailyRevenueStats {
    refundsForDay: number;
    estimatedTax: number;
}