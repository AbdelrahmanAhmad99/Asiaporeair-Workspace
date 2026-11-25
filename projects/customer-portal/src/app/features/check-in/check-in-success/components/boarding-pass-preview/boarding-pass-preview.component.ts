// ============================================================================
// boarding-pass-preview.component.ts
// Asiaporeair | Premium Digital Boarding Pass — Dumb Component
// Renders IBoardingPassDto as a screen-optimized, print-ready luxury card.
// Zero service injection — all data arrives via @Input().
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy, computed, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-boarding-pass-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './boarding-pass-preview.component.html',
  styleUrls: ['./boarding-pass-preview.component.scss']
})
export class BoardingPassPreviewComponent {

  // ── Inputs ────────────────────────────────────────────────────────────────

  @Input() passengerName: string = '';
  @Input() flightNumber: string = '';
  @Input() origin: string = '';          // e.g. "SIN"
  @Input() destination: string = '';          // e.g. "LHR"
  @Input() departureTime: string = '';          // ISO string
  @Input() arrivalTime: string = '';          // ISO string
  @Input() boardingTime: string = '';          // ISO string
  @Input() seatNumber: string = '';          // e.g. "12A"
  @Input() cabinClass: string = '';          // e.g. "Business Class"
  @Input() bookingReference: string = '';
  @Input() ticketCode: string = '';
  @Input() sequenceNumber: number = 0;
  @Input() frequentFlyerNumber: string | null = null;
  @Input() precheckStatus: boolean | null = null;

  /** Enables the QR code shimmer placeholder vs the "real" QR visual. */
  @Input() qrReady: boolean = true;

  // ── Template helpers ──────────────────────────────────────────────────────

  get formattedDeparture(): string {
    return this._formatTime(this.departureTime);
  }

  get formattedArrival(): string {
    return this._formatTime(this.arrivalTime);
  }

  get formattedBoardingTime(): string {
    return this._formatTime(this.boardingTime);
  }

  get formattedDepartureDate(): string {
    if (!this.departureTime) return '';
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
    }).format(new Date(this.departureTime));
  }

  get boardingGroup(): string {
    // Derive boarding group from sequence number
    if (this.sequenceNumber <= 10) return 'Priority';
    if (this.sequenceNumber <= 30) return 'Group A';
    if (this.sequenceNumber <= 60) return 'Group B';
    return 'Group C';
  }

  get cabinClassShort(): string {
    const c = this.cabinClass?.toLowerCase() ?? '';
    if (c.includes('first')) return 'F';
    if (c.includes('business')) return 'J';
    if (c.includes('premium')) return 'W';
    return 'Y';
  }

  /**
   * Generates a deterministic dot-matrix QR code as an SVG path string.
   * Uses the ticketCode + bookingReference as entropy source.
   * This is a visual representation; a real implementation would call
   * a QR library (e.g. qrcode) and pass a dataURL.
   */
  get qrDotMatrix(): Array<boolean[]> {
    const seed = (this.ticketCode + this.bookingReference).split('')
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const size = 21;
    const matrix: Array<boolean[]> = [];

    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        // Finder patterns (top-left, top-right, bottom-left)
        if (this._isFinderPattern(r, c, size)) { row.push(true); continue; }
        // Deterministic fill for data cells
        row.push((seed * (r + 1) * (c + 1)) % 7 < 3);
      }
      matrix.push(row);
    }
    return matrix;
  }

  private _isFinderPattern(r: number, c: number, size: number): boolean {
    const inTopLeft = r < 7 && c < 7;
    const inTopRight = r < 7 && c >= size - 7;
    const inBottomLeft = r >= size - 7 && c < 7;
    if (inTopLeft || inTopRight || inBottomLeft) {
      const rMod = inBottomLeft ? r - (size - 7) : r;
      const cMod = inTopRight ? c - (size - 7) : c;
      return rMod === 0 || rMod === 6 || cMod === 0 || cMod === 6
        || (rMod >= 2 && rMod <= 4 && cMod >= 2 && cMod <= 4);
    }
    return false;
  }

  private _formatTime(iso: string): string {
    if (!iso) return '–';
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date(iso));
  }
}