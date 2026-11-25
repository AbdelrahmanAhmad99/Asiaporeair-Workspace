// ============================================================================
// booking-review-accordion.component.ts
// Asiaporeair | Dumb — Collapsible booking review sections
// ============================================================================

import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { IBookingDetailDto } from '@shared-core';
import { IPassengerSeatAssignment } from '../../../store/booking.store';
import { ItinerarySummaryCardComponent } from '../itinerary-summary-card/itinerary-summary-card.component';
import { CostBreakdownTableComponent } from '../cost-breakdown-table/cost-breakdown-table.component';

type SectionKey = 'itinerary' | 'passengers' | 'cost';

@Component({
  selector: 'app-booking-review-accordion',
  standalone: true,
  imports: [CommonModule, ItinerarySummaryCardComponent, CostBreakdownTableComponent],
  animations: [
    trigger('accordionExpand', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('320ms cubic-bezier(0.16,1,0.3,1)', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('220ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ],
  templateUrl: './booking-review-accordion.component.html',
  styleUrls: ['./booking-review-accordion.component.scss']
})
export class BookingReviewAccordionComponent {

  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly bookingDetail = input.required<IBookingDetailDto>();
  readonly seatAssignments = input<IPassengerSeatAssignment[]>([]);
  readonly currency = input<string>('SGD');

  // ── State ─────────────────────────────────────────────────────────────────
  readonly openSection = signal<SectionKey | null>('itinerary');

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly ancillariesTotalCost = computed(() =>
    this.bookingDetail().ancillarySales?.reduce((s, a) => s + a.pricePaid * a.quantity, 0) ?? 0
  );

  readonly fareCost = computed(() => {
    const detail = this.bookingDetail();
    return detail.totalPrice - this.ancillariesTotalCost();
  });

  // ── Actions ───────────────────────────────────────────────────────────────
  toggleSection(key: SectionKey): void {
    this.openSection.update(current => current === key ? null : key);
  }

  isOpen(key: SectionKey): boolean {
    return this.openSection() === key;
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getSeatForPassenger(passengerId: number): string {
    return this.seatAssignments().find(a => a.passengerId === passengerId)?.seatNumber ?? 'Not selected';
  }
}