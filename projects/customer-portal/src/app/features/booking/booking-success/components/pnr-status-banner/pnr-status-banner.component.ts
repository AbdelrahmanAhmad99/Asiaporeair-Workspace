// pnr-status-banner.component.ts
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pnr-status-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pnr-status-banner.component.html',
  styleUrls: ['./pnr-status-banner.component.scss']
})
export class PnrStatusBannerComponent {

  readonly bookingReference = input<string>('—');
  readonly paymentStatus = input<string>('Succeeded');
  readonly confirmedAt = input<string>('');
  readonly passengerCount = input<number>(0);
  readonly currency = input<string>('SGD');
  readonly totalAmount = input<number>(0);

  readonly isSucceeded = computed(() =>
    ['succeeded', 'paid', 'completed'].includes(this.paymentStatus().toLowerCase())
  );

  readonly statusLabel = computed(() =>
    this.isSucceeded() ? 'Payment Confirmed' : this.paymentStatus()
  );

  formatPrice(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  copyPnr(): void {
    navigator.clipboard?.writeText(this.bookingReference()).catch(() => { });
  }
}