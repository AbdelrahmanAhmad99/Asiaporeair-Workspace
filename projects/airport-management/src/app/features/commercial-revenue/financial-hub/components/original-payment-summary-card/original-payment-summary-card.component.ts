
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentStatusBadgeComponent } from '../payment-status-badge/payment-status-badge.component';
import { IPaymentTransaction } from '@shared-core';

@Component({
  selector: 'aoms-original-payment-summary-card',
  standalone: true,
  imports: [CommonModule, PaymentStatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './original-payment-summary-card.component.html',
  styleUrl: './original-payment-summary-card.component.scss',
})
export class OriginalPaymentSummaryCardComponent {
  readonly transaction = input.required<IPaymentTransaction>();
  readonly loading = input<boolean>(false);

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

  readonly formattedDate = computed<string>(() => {
    try {
      return new Intl.DateTimeFormat('en-SG', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).format(new Date(this.transaction().transactionDate));
    } catch {
      return this.transaction().transactionDate;
    }
  });

  /** PCI-DSS partial masking — last 8 chars visible. */
  readonly maskedTransactionId = computed<string>(() => {
    const id = this.transaction().transactionId ?? '';
    if (id.length <= 8) return id;
    return `●●●● ●●●● ${id.slice(-8)}`;
  });

  protected getProviderLabel(method: string): string {
    const labels: Record<string, string> = {
      card: 'Card', paypal: 'PayPal', bank_transfer: 'Bank Transfer',
      apple_pay: 'Apple Pay', google_pay: 'Google Pay',
    };
    return labels[(method ?? '').toLowerCase()] ?? method;
  }

  protected copyId(): void {
    const id = this.transaction().transactionId;
    if (id && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(id).catch(() => { /* silent */ });
    }
  }
}