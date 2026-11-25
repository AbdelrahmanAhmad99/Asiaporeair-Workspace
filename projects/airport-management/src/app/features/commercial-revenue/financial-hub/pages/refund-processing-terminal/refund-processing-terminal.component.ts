
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { FinancialHubStore } from '../../store/financial-hub.store';
import { PaymentStatusBadgeComponent } from '../../components/payment-status-badge/payment-status-badge.component';
import { OriginalPaymentSummaryCardComponent } from '../../components/original-payment-summary-card/original-payment-summary-card.component';
import { RefundConfirmationFormComponent } from '../../components/refund-confirmation-form/refund-confirmation-form.component';
import { IRefundRequest } from '@shared-core';

@Component({
  selector: 'aoms-refund-processing-terminal',
  standalone: true,
  imports: [
    CommonModule,
    PaymentStatusBadgeComponent,
    OriginalPaymentSummaryCardComponent,
    RefundConfirmationFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './refund-processing-terminal.component.html',
  styleUrl: './refund-processing-terminal.component.scss',
})
export class RefundProcessingTerminalComponent implements OnInit, OnDestroy {
  protected readonly store = inject(FinancialHubStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly routePaymentId = signal<number | null>(null);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // Per spec §5 Signals: "Use effect() to log every successful refund
  // attempt in the console for local auditing."
  private readonly _auditEffect = effect(() => {
    const result = this.store.refundResult();
    if (result && this.store.refundStatus() === 'success') {
      console.info('[RefundProcessingTerminal] Audit record — refund confirmed:', {
        originalPaymentId: result.originalPaymentId,
        refundTransactionId: result.refundTransactionId,
        refundedAmount: result.refundedAmount,
        status: result.status,
        timestamp: result.timestamp,
      });
    }
  });

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('transactionId');
    const id = rawId ? parseInt(rawId, 10) : null;
    this.routePaymentId.set(id);

    if (id != null && !isNaN(id)) {
      const existing = this.store.refundTargetTransaction();
      if (!existing || existing.paymentId !== id) {
        this.store.loadTransactionForRefund(id);
      }
    }
    // If arriving via the audit grid's "Refund" action, the transaction is
    // already set in the store via setRefundTargetTransaction() — no fetch.
  }

  ngOnDestroy(): void {
    this.store.clearRefundState();
  }

  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  protected async onRefundConfirmed(refundData: IRefundRequest): Promise<void> {
    await this.store.executeRefund(refundData);
  }

  protected onDismissRefundError(): void {
    this.store.clearRefundError();
  }

  protected onDismissLookupError(): void {
    this.store.clearRefundLookupError();
  }

  protected onRetryLookup(): void {
    const id = this.routePaymentId();
    if (id != null) this.store.loadTransactionForRefund(id);
  }

  protected onViewAuditLog(): void {
    this.store.navigateToAuditor();
  }

  protected onViewExecutiveDashboard(): void {
    this.store.navigateToExecutiveDashboard();
  }
}