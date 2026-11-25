// ============================================================================
// passenger-check-in-card.component.ts
// Asiaporeair | Passenger Card — Dumb Component
// Displays one passenger row with status badge, seat info, and CTA button.
// All interactivity emitted upward — zero service injection.
// ============================================================================

import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-passenger-check-in-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './passenger-check-in-card.component.html',
  styleUrls: ['./passenger-check-in-card.component.scss']
})
export class PassengerCheckInCardComponent {

  // ── Inputs ────────────────────────────────────────────────────────────────

  /** The passenger's display index (1-based) for "PAX 01", "PAX 02" etc. */
  @Input() index: number = 1;

  /** Full name as "Firstname Lastname". */
  @Input() fullName: string = '';

  /**
   * Cabin class label e.g. "Business Class", "First Class", "Economy".
   * Used for the subtle class badge.
   */
  @Input() cabinClass: string | null = null;

  /**
   * Assigned seat number returned from the booking.
   * null means "seat not yet assigned" — shown as "–".
   */
  @Input() seatNumber: string | null = null;

  /**
   * Passport number (partially masked in template for display).
   * Optional; shown only if present.
   */
  @Input() passportNumber: string | null = null;

  /** True when this passenger's API call is in-flight. */
  @Input() isGenerating: boolean = false;

  /** True when this passenger has been successfully checked in. */
  @Input() isCheckedIn: boolean = false;

  /**
   * Per-passenger error message returned from the store.
   * null means no error for this passenger.
   */
  @Input() errorMessage: string | null = null;

  // ── Outputs ───────────────────────────────────────────────────────────────

  /** Emitted when the user clicks "Generate Boarding Pass". */
  @Output() generatePass = new EventEmitter<void>();

  /** Emitted when the user clicks "View Boarding Pass" on a checked-in card. */
  @Output() viewPass = new EventEmitter<void>();

  // ── Template helpers ──────────────────────────────────────────────────────

  /** Masks a passport number: "A1234567" → "A12•••67". */
  get maskedPassport(): string {
    if (!this.passportNumber || this.passportNumber.length < 4) return '••••••';
    const visible = this.passportNumber.slice(0, 3);
    const tail = this.passportNumber.slice(-2);
    return `${visible}•••${tail}`;
  }

  get statusLabel(): string {
    if (this.isCheckedIn) return 'Checked In';
    if (this.isGenerating) return 'Processing…';
    return 'Ready for Check-in';
  }
}