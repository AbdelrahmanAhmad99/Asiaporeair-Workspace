
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ITicketDto, ITicketDetailDto } from '@shared-core';
import { IBookingDetailDto } from '@shared-core';

@Component({
  selector: 'aoms-electronic-ticket-preview',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './electronic-ticket-preview.component.html',
  styleUrl: './electronic-ticket-preview.component.scss',
})
export class ElectronicTicketPreviewComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly ticket = input.required<ITicketDto | ITicketDetailDto>();
  readonly booking = input<IBookingDetailDto | null>(null);

  // ── Computed helpers ───────────────────────────────────────────────────

  /** The passenger associated with this ticket (matched by position index). */
  readonly passengerName = computed<string>(() => {
    const t = this.ticket();
    // ITicketDto from BookingManagementService includes passengerName
    return (t as ITicketDto & { passengerName?: string }).passengerName ?? '—';
  });

  readonly formattedIssueDate = computed<string>(() => {
    const d = this.ticket().issueDate;
    if (!d) return '—';
    return new Date(d).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  });

  readonly formattedDeparture = computed<string>(() => {
    const b = this.booking();
    const t = this.ticket() as ITicketDetailDto;
    const d = b?.flightDepartureTime ?? t?.flightDepartureTime;
    if (!d) return '—';
    return new Date(d).toLocaleString('en-GB', {
      weekday: 'short', day: '2-digit', month: 'short',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  });

  readonly formattedArrival = computed<string>(() => {
    const b = this.booking();
    const t = this.ticket() as ITicketDetailDto;
    const d = b?.flightArrivalTime ?? t?.flightArrivalTime;
    if (!d) return '—';
    return new Date(d).toLocaleString('en-GB', {
      weekday: 'short', day: '2-digit', month: 'short',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  });

  readonly originAirportCode = computed<string>(() => {
    const b = this.booking();
    const t = this.ticket() as ITicketDetailDto;
    return b?.originAirportCode ?? t?.originAirportCode ?? '—';
  });

  readonly originAirportName = computed<string>(() => {
    const b = this.booking();
    const t = this.ticket() as ITicketDetailDto;
    return b?.originAirportName ?? t?.originAirportName ?? '—';
  });

  readonly destinationAirportCode = computed<string>(() => {
    const b = this.booking();
    const t = this.ticket() as ITicketDetailDto;
    return b?.destinationAirportCode ?? t?.destinationAirportCode ?? '—';
  });

  readonly destinationAirportName = computed<string>(() => {
    const b = this.booking();
    const t = this.ticket() as ITicketDetailDto;
    return b?.destinationAirportName ?? t?.destinationAirportName ?? '—';
  });

  readonly flightNumber = computed<string>(() => {
    const b = this.booking();
    const t = this.ticket() as ITicketDetailDto;
    return b?.flightNumber ?? t?.flightNumber ?? '—';
  });

  readonly aircraftModel = computed<string>(() => {
    const b = this.booking();
    // ITicketDetailDto doesn't have aircraftModel, so we only get it from booking
    return b?.aircraftModel ?? '—';
  });

  readonly bookingReference = computed<string>(() => {
    const b = this.booking();
    const t = this.ticket() as ITicketDetailDto;
    return b?.bookingReference ?? t?.bookingReference ?? '—';
  });

  readonly statusTheme = computed<string>(() => {
    const s = (this.ticket().status ?? '').toLowerCase();
    if (s === 'issued' || s === 'confirmed') return 'issued';
    if (s === 'voided' || s === 'cancelled') return 'voided';
    if (s === 'used' || s === 'boarded') return 'used';
    return 'pending';
  });

  /** Seat number from ticket detail if available */
  readonly seatNumber = computed<string>(() =>
    (this.ticket() as ITicketDto & { seatNumber?: string }).seatNumber ?? '—'
  );

  /** Cabin class from ticket detail if available */
  readonly cabinClass = computed<string>(() =>
    (this.ticket() as ITicketDto & { cabinClassName?: string }).cabinClassName ?? '—'
  );
}