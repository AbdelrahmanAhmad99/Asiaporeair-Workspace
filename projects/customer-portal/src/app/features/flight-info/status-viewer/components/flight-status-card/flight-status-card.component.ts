// ============================================================================
// flight-status-card.component.ts
// Asiaporeair | Flight Status Card — Dumb Component
// Side-by-side grid of scheduled vs actual/estimated times.
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightStatusBadgeComponent } from '../flight-status-badge/flight-status-badge.component';

@Component({
  selector: 'app-flight-status-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FlightStatusBadgeComponent],
  templateUrl: './flight-status-card.component.html',
  styleUrls: ['./flight-status-card.component.scss']
})
export class FlightStatusCardComponent {

  // ── Inputs — from IFlightSegmentDto ──────────────────────────────────────
  @Input() flightNumber: string = '';
  @Input() airlineName: string = '';
  @Input() aircraftModel: string = '';

  @Input() originIata: string = '';
  @Input() originName: string = '';
  @Input() originCity: string = '';
  @Input() scheduledDeparture: string = '';   // ISO string
  @Input() actualDeparture: string = '';   // ISO string (may be empty)

  @Input() destinationIata: string = '';
  @Input() destinationName: string = '';
  @Input() destinationCity: string = '';
  @Input() scheduledArrival: string = '';    // ISO string
  @Input() actualArrival: string = '';    // ISO string (may be empty)

  @Input() durationMinutes: number = 0;
  @Input() status: string = '';

  // ── Inputs — from IFlightDetailsDto ──────────────────────────────────────
  @Input() tailNumber: string = '';
  @Input() amenities: string[] = [];

  // ── Time formatting helpers ───────────────────────────────────────────────

  formatTime(iso: string): string {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date(iso));
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short', day: '2-digit', month: 'short'
    }).format(new Date(iso));
  }

  formatDuration(minutes: number): string {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m > 0 ? m + 'm' : ''}`.trim();
  }

  /** Returns the minute delay between scheduled and actual, or null if same/not available. */
  get departureDelayMinutes(): number | null {
    if (!this.scheduledDeparture || !this.actualDeparture) return null;
    const diff = (new Date(this.actualDeparture).getTime() -
      new Date(this.scheduledDeparture).getTime()) / 60000;
    return diff > 2 ? Math.round(diff) : null;
  }

  get arrivalDelayMinutes(): number | null {
    if (!this.scheduledArrival || !this.actualArrival) return null;
    const diff = (new Date(this.actualArrival).getTime() -
      new Date(this.scheduledArrival).getTime()) / 60000;
    return diff > 2 ? Math.round(diff) : null;
  }

  get departureIsDelayed(): boolean {
    return (this.departureDelayMinutes ?? 0) > 0;
  }

  get arrivalIsDelayed(): boolean {
    return (this.arrivalDelayMinutes ?? 0) > 0;
  }
}