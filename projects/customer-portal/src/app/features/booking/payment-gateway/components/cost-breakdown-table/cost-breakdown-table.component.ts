// cost-breakdown-table.component.ts
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IBookingDetailDto } from '@shared-core';

// Simulated tax breakdown (real data would come from API)
const TAX_LINES = [
  { code: 'YQ', label: 'Transportation Tax (International)', amount: 59.20 },
  { code: 'AY', label: 'Passenger Civil Aviation Security Fee', amount: 14.20 },
  { code: 'XA', label: 'APHIS User Fee', amount: 4.90 },
  { code: 'RA', label: 'Passenger Service Charge — Intl', amount: 30.30 },
  { code: 'XF', label: 'Passenger Facility Charge', amount: 17.10 },
  { code: 'L7', label: 'Airport Development Levy', amount: 10.80 },
  { code: 'YC', label: 'Customs User Fee', amount: 9.40 },
  { code: 'SG', label: 'Passenger Service & Security Fee', amount: 46.40 },
  { code: 'XY', label: 'Immigration User Fee', amount: 8.90 },
  { code: 'OP', label: 'Aviation Levy', amount: 8.00 }
];

@Component({
  selector: 'app-cost-breakdown-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cost-breakdown-table.component.html',
  styleUrls: ['./cost-breakdown-table.component.scss']
})
export class CostBreakdownTableComponent {

  readonly bookingDetail = input.required<IBookingDetailDto>();
  readonly currency = input<string>('SGD');

  readonly taxLines = TAX_LINES;

  readonly taxTotal = computed(() =>
    TAX_LINES.reduce((s, t) => s + t.amount, 0)
  );

  readonly ancillaryTotal = computed(() =>
    this.bookingDetail().ancillarySales?.reduce((s, a) => s + a.pricePaid * a.quantity, 0) ?? 0
  );

  readonly airFare = computed(() =>
    this.bookingDetail().totalPrice - this.taxTotal() - this.ancillaryTotal()
  );

  formatPrice(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}