// payment-receipt-summary.component.ts
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IBookingDetailDto } from '@shared-core';
import { ICompletedPayment } from '../../../store/booking.store';

@Component({
  selector: 'app-payment-receipt-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-receipt-summary.component.html',
  styleUrls: ['./payment-receipt-summary.component.scss']
})
export class PaymentReceiptSummaryComponent {

  readonly bookingDetail = input<IBookingDetailDto | null>(null);
  readonly completedPayment = input<ICompletedPayment | null>(null);
  readonly currency = input<string>('SGD');

  readonly primaryPayment = computed(() => {
    const detail = this.bookingDetail();
    if (detail?.payments?.length) return detail.payments[0];
    return null;
  });

  readonly transactionId = computed(() =>
    this.primaryPayment()?.transactionId ??
    this.completedPayment()?.transactionId ?? '—'
  );

  readonly paymentMethod = computed(() =>
    this.primaryPayment()?.method ??
    this.completedPayment()?.method ?? '—'
  );

  readonly transactionDate = computed(() => {
    const raw = this.primaryPayment()?.transactionDateTime ??
      this.completedPayment()?.transactionDate;
    if (!raw) return '';
    return new Date(raw).toLocaleDateString('en-SG', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  });

  readonly totalPaid = computed(() =>
    this.primaryPayment()?.amount ??
    this.completedPayment()?.amount ??
    this.bookingDetail()?.totalPrice ?? 0
  );

  readonly paymentStatus = computed(() => {
    const s = this.primaryPayment()?.status ?? this.completedPayment()?.status ?? 'Succeeded';
    return s;
  });

  readonly isSucceeded = computed(() =>
    this.paymentStatus().toLowerCase().includes('succeed') ||
    this.paymentStatus().toLowerCase() === 'paid'
  );

  formatPrice(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
  }
}