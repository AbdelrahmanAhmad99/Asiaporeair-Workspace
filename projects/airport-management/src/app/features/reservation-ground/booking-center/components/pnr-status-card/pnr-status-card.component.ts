

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IBookingDto } from '@shared-core';

export type PnrStatusTheme = 'confirmed' | 'waitlisted' | 'cancelled' | 'pending' | 'refunded' | 'neutral';

@Component({
  selector: 'aoms-pnr-status-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pnr-status-card.component.html',
  styleUrl: './pnr-status-card.component.scss',
})
export class PnrStatusCardComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly booking = input.required<IBookingDto>();

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly quickView = output<IBookingDto>();
  readonly deepExplore = output<IBookingDto>();

  // ── Computed ───────────────────────────────────────────────────────────
  readonly statusTheme = computed<PnrStatusTheme>(() => {
    const status = (this.booking().paymentStatus ?? '').toLowerCase();
    if (status === 'confirmed') return 'confirmed';
    if (status === 'waitlisted') return 'waitlisted';
    if (status === 'cancelled') return 'cancelled';
    if (status === 'pending') return 'pending';
    if (status === 'refunded') return 'refunded';
    return 'neutral';
  });

  readonly firstPassengerName = computed<string>(() => {
    const passengers = this.booking().passengers;
    if (!passengers?.length) return '—';
    const p = passengers[0];
    return `${p.firstName} ${p.lastName}`.trim();
  });

  readonly passengerCount = computed<number>(() =>
    this.booking().passengers?.length ?? 0
  );

  readonly formattedDeparture = computed<string>(() => {
    const dt = this.booking().flightDepartureTime;
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  readonly routeLabel = computed<string>(() => {
    const b = this.booking();
    if (!b.originAirportCode || !b.destinationAirportCode) return '—';
    return `${b.originAirportCode} → ${b.destinationAirportCode}`;
  });

  // ── Event Emitters ─────────────────────────────────────────────────────
  protected onQuickView(): void {
    this.quickView.emit(this.booking());
  }

  protected onDeepExplore(): void {
    this.deepExplore.emit(this.booking());
  }
}