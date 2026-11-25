// ============================================================================
// trip-card.component.ts
// Asiaporeair | Dumb — Individual Trip Card
// ============================================================================

import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IManageBookingDto } from '../../../store/manage-booking.store';
import { BookingStatusBadgeComponent } from '../booking-status-badge/booking-status-badge.component';

const CABIN_LABELS: Record<string, string> = {
  Economy: 'Economy',
  PremiumEconomy: 'Premium Economy',
  Business: 'Business Class',
  Suite: 'Suites'
};

@Component({
  selector: 'app-trip-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, BookingStatusBadgeComponent],
  templateUrl: './trip-card.component.html',
  styleUrls: ['./trip-card.component.scss']
})
export class TripCardComponent implements OnChanges {

  @Input({ required: true }) booking!: IManageBookingDto;

  @Output() viewDetails = new EventEmitter<IManageBookingDto>();
  @Output() modify = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<string>();
  @Output() addServices = new EventEmitter<string>();
  @Output() checkIn = new EventEmitter<string>();

  // ── Derived properties ────────────────────────────────────────────────────

  isUpcoming = false;
  isFlown = false;
  daysUntilFlight = 0;

  ngOnChanges(): void {
    const now = new Date();
    const dep = new Date(this.booking.departureDateTime);
    this.isUpcoming = dep > now;
    this.isFlown = this.booking.status === 'Flown';
    this.daysUntilFlight = Math.ceil((dep.getTime() - now.getTime()) / 86_400_000);
  }

  get cabinLabel(): string {
    return CABIN_LABELS[this.booking.cabinClass] ?? this.booking.cabinClass;
  }

  get durationLabel(): string {
    return this.booking.flightDuration;
  }

  // ── Date helpers ──────────────────────────────────────────────────────────

  formatDate(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-SG', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatTime(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('en-SG', {
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  }

  isNextDay(dep: string, arr: string): boolean {
    if (!dep || !arr) return false;
    const d = new Date(dep); const a = new Date(arr);
    return a.getDate() !== d.getDate() ||
      a.getMonth() !== d.getMonth() ||
      a.getFullYear() !== d.getFullYear();
  }

  formatCurrency(amount: number, currency: string): string {
    return `${currency} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    })}`;
  }

  formatBookingDate(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-SG', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }
}