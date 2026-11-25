// ============================================================================
// selection-summary-sticky.component.ts
// Asiaporeair | Dumb — Sticky cost summary sidebar for ancillaries
// ============================================================================

import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAncillaryLineItem } from '../../../store/booking.store';

interface IFlightSummary {
  route: string;
  airline: string;
  cabinClass: string;
  fareName: string;
}

@Component({
  selector: 'app-selection-summary-sticky',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selection-summary-sticky.component.html',
  styleUrls: ['./selection-summary-sticky.component.scss']
})
export class SelectionSummaryStickyComponent {

  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly lineItems = input<IAncillaryLineItem[]>([]);
  readonly baseFareTotal = input<number>(0);
  readonly ancillariesTotalCost = input<number>(0);
  readonly grandTotal = input<number>(0);
  readonly currency = input<string>('SGD');
  readonly isBookingLoading = input<boolean>(false);
  readonly flightSummary = input<IFlightSummary | null>(null);

  // ── Outputs ───────────────────────────────────────────────────────────────
  readonly confirmBooking = output<void>();

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly hasSelections = computed(() => this.lineItems().length > 0);

  /** Group line items by category for display */
  readonly groupedItems = computed(() => {
    const map = new Map<string, IAncillaryLineItem[]>();
    for (const item of this.lineItems()) {
      const key = item.category.toUpperCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  });

  onConfirm(): void {
    this.confirmBooking.emit();
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getCategoryLabel(key: string): string {
    const map: Record<string, string> = {
      BAGGAGE: 'Baggage', MEAL: 'Dining', LOUNGE: 'Lounge',
      SEAT: 'Seat', INSURANCE: 'Insurance', WIFI: 'Wi-Fi'
    };
    return map[key] ?? key;
  }

  trackByCategory(_: number, g: { category: string }): string { return g.category; }
  trackByItem(_: number, i: IAncillaryLineItem): number { return i.productId + i.passengerIndex * 1000; }
}