// ============================================================================
// flight-status-badge.component.ts
// Asiaporeair | Flight Status Badge — Dumb Component
// Maps a raw status string from IFlightDetailsDto.status to a premium
// colour-coded pill with uppercase letter-spaced text.
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy, computed, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

// ── Status category union ─────────────────────────────────────────────────────
export type StatusCategory =
  | 'on-time'     // green — departed/arrived within 15 min of schedule
  | 'delayed'     // red/orange — known delay
  | 'boarding'    // blue — gate open, boarding in progress
  | 'departed'    // gold — wheels up, airborne
  | 'arrived'     // green — landed
  | 'cancelled'   // dark red — cancelled
  | 'scheduled'   // sapphire/blue — not yet departed, no delay known
  | 'unknown';    // charcoal — fallback

export interface IStatusPresentation {
  label: string;
  category: StatusCategory;
  dotPulse: boolean;   // true when the flight is actively airborne
}

@Component({
  selector: 'app-flight-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './flight-status-badge.component.html',
  styleUrl: './flight-status-badge.component.scss',
})
export class FlightStatusBadgeComponent {

  @Input({ required: true }) status: string = '';

  /** Override the auto-derived label if needed (e.g. "En Route"). */
  @Input() labelOverride: string | null = null;

  readonly presentation = computed((): IStatusPresentation => {
    const raw = (this.status ?? '').toLowerCase().trim();
    return this.resolvePresentation(raw, this.labelOverride);
  });

  private resolvePresentation(raw: string, labelOverride: string | null): IStatusPresentation {
    if (raw.includes('on time') || raw === 'on-time' || raw === 'ontime')
      return { label: labelOverride ?? 'On Time', category: 'on-time', dotPulse: false };
    if (raw.includes('delay') || raw === 'delayed')
      return { label: labelOverride ?? 'Delayed', category: 'delayed', dotPulse: false };
    if (raw.includes('board'))
      return { label: labelOverride ?? 'Boarding', category: 'boarding', dotPulse: true };
    if (raw.includes('depart') || raw === 'departed' || raw === 'airborne' || raw === 'en route')
      return { label: labelOverride ?? 'En Route', category: 'departed', dotPulse: true };
    if (raw.includes('land') || raw === 'arrived' || raw.includes('arriv'))
      return { label: labelOverride ?? 'Arrived', category: 'arrived', dotPulse: false };
    if (raw === 'cancelled' || raw === 'canceled')
      return { label: labelOverride ?? 'Cancelled', category: 'cancelled', dotPulse: false };
    if (raw === 'scheduled' || raw === 'confirmed')
      return { label: labelOverride ?? 'Scheduled', category: 'scheduled', dotPulse: false };
    return { label: labelOverride ?? (this.status || 'Unknown'), category: 'unknown', dotPulse: false };
  }
}