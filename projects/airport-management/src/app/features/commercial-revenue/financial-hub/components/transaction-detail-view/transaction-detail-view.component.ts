
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentStatusBadgeComponent } from '../payment-status-badge/payment-status-badge.component';
import { IPaymentTransaction } from '@shared-core';

@Component({
  selector: 'aoms-transaction-detail-view',
  standalone: true,
  imports: [CommonModule, PaymentStatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transaction-detail-view.component.html',
  styleUrl: './transaction-detail-view.component.scss',
})
export class TransactionDetailViewComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly transaction = input.required<IPaymentTransaction>();

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly closed = output<void>();

  /**
   * PCI-DSS partial masking — last 8 chars visible, remainder ●●●●.
   * e.g. "pi_3NkZ7Y2eZvKYlo2C1mCVwUY0" → "●●●● ●●●● 1mCVwUY0"
   */
  readonly maskedTransactionId = computed<string>(() => {
    const id = this.transaction().transactionId ?? '';
    if (id.length <= 8) return id;
    return `●●●● ●●●● ${id.slice(-8)}`;
  });

  readonly formattedDate = computed<string>(() => {
    const rawDate = this.transaction().transactionDate || this.transaction().transactionDateTime || '';
    if (!rawDate) return '—';
    try {
      return new Intl.DateTimeFormat('en-SG', {
        weekday: 'long', day: '2-digit', month: 'long',
        year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
      }).format(new Date(rawDate));
    } catch {
      return rawDate;
    }
  });

  readonly formattedAmount = computed<string>(() => {
    const { amount, currency } = this.transaction();
    try {
      return new Intl.NumberFormat('en-SG', {
        style: 'currency',
        currency: (currency || 'SGD').toUpperCase(),
        minimumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency?.toUpperCase() ?? 'SGD'} ${amount.toFixed(2)}`;
    }
  });

  protected getProviderLabel(method: string): string {
    if (!method) return 'Unknown';
    const clean = method.toLowerCase().replace(/[\s_-]/g, '');
    const labels: Record<string, string> = {
      card: 'Credit / Debit Card',
      creditcard: 'Credit Card',
      debitcard: 'Debit Card',
      paypal: 'PayPal',
      banktransfer: 'Bank Transfer',
      applepay: 'Apple Pay',
      googlepay: 'Google Pay',
    };
    return labels[clean] ?? method;
  }

  protected copyTransactionId(): void {
    const id = this.transaction().transactionId;
    if (id && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(id).catch(() => { /* silent */ });
    }
  }
}