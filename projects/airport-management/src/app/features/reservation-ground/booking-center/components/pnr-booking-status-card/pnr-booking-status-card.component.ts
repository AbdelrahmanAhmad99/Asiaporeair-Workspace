
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IBookingDetailDto } from '@shared-core';

@Component({
  selector: 'aoms-pnr-booking-status-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pnr-booking-status-card.component.html',
  styleUrl: './pnr-booking-status-card.component.scss',
})
export class PnrBookingStatusCardComponent {
  readonly booking = input.required<IBookingDetailDto>();

  readonly statusTheme = computed<string>(() => {
    const s = (this.booking().paymentStatus ?? '').toLowerCase();
    if (this.booking().isCancelled || s === 'cancelled') return 'cancelled';
    if (s === 'confirmed') return 'confirmed';
    if (s === 'waitlisted') return 'waitlisted';
    if (s === 'pending') return 'pending';
    if (s === 'refunded') return 'refunded';
    return 'neutral';
  });

  readonly formattedDeparture = computed<string>(() => {
    const dt = this.booking().flightDepartureTime;
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-GB', {
      weekday: 'short', day: '2-digit', month: 'short',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  });

  readonly formattedArrival = computed<string>(() => {
    const dt = this.booking().flightArrivalTime;
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-GB', {
      weekday: 'short', day: '2-digit', month: 'short',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  });
}