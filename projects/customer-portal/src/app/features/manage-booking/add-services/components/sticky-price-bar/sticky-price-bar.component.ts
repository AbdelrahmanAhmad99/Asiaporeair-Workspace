// sticky-price-bar.component.ts
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sticky-price-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './sticky-price-bar.component.html',
  styleUrls: ['./sticky-price-bar.component.scss']
})
export class StickyPriceBarComponent {
  @Input() cartItemCount = 0;
  @Input() deltaAmount = 0;
  @Input() currency = 'SGD';
  @Input() isPaymentRequired = true;

  @Output() proceedToPayment = new EventEmitter<void>();

  formatPrice(n: number | undefined | null): string {
    return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
  }
}