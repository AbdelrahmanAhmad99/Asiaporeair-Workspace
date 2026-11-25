// ============================================================================
// itinerary-summary-card.component.ts
// Asiaporeair | Dumb — Flight segment itinerary display
// ============================================================================

import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IBookingDetailDto } from '@shared-core';

@Component({
  selector: 'app-itinerary-summary-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './itinerary-summary-card.component.html',
  styleUrls: ['./itinerary-summary-card.component.scss']
})
export class ItinerarySummaryCardComponent {

  readonly bookingDetail = input.required<IBookingDetailDto>();
  readonly currency = input<string>('SGD');

  readonly departureDate = computed(() => {
    const raw = this.bookingDetail().flightDepartureTime;
    if (!raw) return '';
    return new Date(raw).toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  });

  readonly departureTime = computed(() => {
    const raw = this.bookingDetail().flightDepartureTime;
    if (!raw) return '';
    return new Date(raw).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });
  });

  readonly arrivalDate = computed(() => {
    const raw = this.bookingDetail().flightArrivalTime;
    if (!raw) return '';
    return new Date(raw).toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  });

  readonly arrivalTime = computed(() => {
    const raw = this.bookingDetail().flightArrivalTime;
    if (!raw) return '';
    return new Date(raw).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' });
  });

  readonly flightDuration = computed(() => {
    const dep = new Date(this.bookingDetail().flightDepartureTime);
    const arr = new Date(this.bookingDetail().flightArrivalTime);
    const diffMs = arr.getTime() - dep.getTime();
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  });

  formatPrice(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
  }
}