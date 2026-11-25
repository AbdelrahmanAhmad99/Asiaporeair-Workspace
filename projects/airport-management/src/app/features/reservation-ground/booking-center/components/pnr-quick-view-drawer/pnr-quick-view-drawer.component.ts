

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IBookingDetailDto } from '@shared-core';

@Component({
  selector: 'aoms-pnr-quick-view-drawer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pnr-quick-view-drawer.component.html',
  styleUrl: './pnr-quick-view-drawer.component.scss',
})
export class PnrQuickViewDrawerComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly booking = input<IBookingDetailDto | null>(null);
  readonly isOpen = input<boolean>(false);
  readonly isLoading = input<boolean>(false);
  readonly error = input<string | null>(null);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly closed = output<void>();
  readonly deepExplore = output<number>(); // emits bookingId

  // ── Computed ───────────────────────────────────────────────────────────
  readonly formattedDeparture = computed<string>(() => {
    const dt = this.booking()?.flightDepartureTime;
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  readonly formattedArrival = computed<string>(() => {
    const dt = this.booking()?.flightArrivalTime;
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  readonly formattedBookingTime = computed<string>(() => {
    const dt = this.booking()?.bookingTime;
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  readonly statusTheme = computed<string>(() => {
    const status = (this.booking()?.paymentStatus ?? '').toLowerCase();
    if (status === 'confirmed') return 'confirmed';
    if (status === 'waitlisted') return 'waitlisted';
    if (status === 'cancelled') return 'cancelled';
    if (status === 'pending') return 'pending';
    if (status === 'refunded') return 'refunded';
    return 'neutral';
  });

  // ── Event emitters ─────────────────────────────────────────────────────
  protected onClose(): void {
    this.closed.emit();
  }

  protected onDeepExplore(): void {
    const id = this.booking()?.bookingId;
    if (id) this.deepExplore.emit(id);
  }

  protected onBackdropClick(): void {
    this.closed.emit();
  }
}