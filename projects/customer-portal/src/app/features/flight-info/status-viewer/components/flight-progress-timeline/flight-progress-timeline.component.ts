// ============================================================================
// flight-progress-timeline.component.ts
// Asiaporeair | Flight Progress Timeline — Dumb Component
// Horizontal journey bar: Origin → animated airplane dot → Destination
// Progress is calculated from departure/arrival ISO times vs current time.
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy, computed, signal, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';

// ── Timeline state derived from elapsed time ─────────────────────────────────
export type FlightPhase =
  | 'pre-departure'  // Current time is before scheduled departure
  | 'airborne'       // Currently between departure and arrival
  | 'arrived';       // Current time is past scheduled arrival

@Component({
  selector: 'app-flight-progress-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './flight-progress-timeline.component.html',
  styleUrls: ['./flight-progress-timeline.component.scss']
})
export class FlightProgressTimelineComponent implements OnInit, OnDestroy {

  // ── Inputs ────────────────────────────────────────────────────────────────
  @Input({ required: true }) originIata: string = '';
  @Input({ required: true }) destinationIata: string = '';
  @Input() originCity: string = '';
  @Input() destinationCity: string = '';

  /** ISO string — used as baseline; actual if known, else scheduled */
  @Input() departureTime: string = '';
  @Input() arrivalTime: string = '';
  @Input() durationMinutes: number = 0;

  /** From IFlightDetailsDto.status — used to override calculated phase */
  @Input() status: string = '';

  // ── Current time signal (updated every 30 seconds) ────────────────────────
  private readonly _now = signal<Date>(new Date());
  private clockInterval: ReturnType<typeof setInterval> | null = null;

  // ── Derived timeline values ───────────────────────────────────────────────

  readonly phase = computed((): FlightPhase => {
    // Allow status override
    const s = this.status.toLowerCase();
    if (s.includes('arriv') || s.includes('land')) return 'arrived';
    if (s.includes('board') || s.includes('depart') || s.includes('route') || s.includes('airborne'))
      return 'airborne';

    // Calculate from times
    if (!this.departureTime || !this.arrivalTime) return 'pre-departure';
    const now = this._now().getTime();
    const dep = new Date(this.departureTime).getTime();
    const arr = new Date(this.arrivalTime).getTime();

    if (now < dep) return 'pre-departure';
    if (now >= arr) return 'arrived';
    return 'airborne';
  });

  /**
   * 0.0 → 1.0 progress ratio.
   * - pre-departure: 0
   * - airborne:      calculated from elapsed ratio
   * - arrived:       1.0
   */
  readonly progressRatio = computed((): number => {
    const ph = this.phase();
    if (ph === 'pre-departure') return 0;
    if (ph === 'arrived') return 1;

    if (!this.departureTime || !this.arrivalTime) return 0;
    const now = this._now().getTime();
    const dep = new Date(this.departureTime).getTime();
    const arr = new Date(this.arrivalTime).getTime();
    const total = arr - dep;
    if (total <= 0) return 0;
    return Math.min(1, Math.max(0, (now - dep) / total));
  });

  /** Progress as a rounded percentage string for display. */
  readonly progressPercent = computed(() =>
    Math.round(this.progressRatio() * 100)
  );

  /** Estimated remaining flight time as "Xh Ym" */
  readonly timeRemaining = computed((): string => {
    const ph = this.phase();
    if (ph === 'pre-departure') {
      // Show time until departure
      if (!this.departureTime) return '—';
      const mins = Math.max(0,
        Math.round((new Date(this.departureTime).getTime() - this._now().getTime()) / 60000)
      );
      return this.formatMins(mins) + ' to departure';
    }
    if (ph === 'arrived') return 'Landed';

    if (!this.arrivalTime) return '—';
    const mins = Math.max(0,
      Math.round((new Date(this.arrivalTime).getTime() - this._now().getTime()) / 60000)
    );
    return this.formatMins(mins) + ' remaining';
  });

  /** Elapsed flight time display */
  readonly timeElapsed = computed((): string => {
    const ph = this.phase();
    if (ph !== 'airborne' || !this.departureTime) return '—';
    const mins = Math.round((this._now().getTime() - new Date(this.departureTime).getTime()) / 60000);
    return this.formatMins(Math.max(0, mins)) + ' elapsed';
  });

  /** CSS left % for the airplane icon position on the bar */
  readonly planePositionPercent = computed((): number =>
    Math.min(96, Math.max(2, this.progressRatio() * 100))
  );

  readonly isAirborne = computed(() => this.phase() === 'airborne');

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Update the clock every 30 seconds so progress bar ticks live
    this.clockInterval = setInterval(() => {
      this._now.set(new Date());
    }, 30_000);
  }

  ngOnDestroy(): void {
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  formatTime(iso: string): string {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date(iso));
  }

  formatDuration(minutes: number): string {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h${m > 0 ? ' ' + m + 'm' : ''}`;
  }

  private formatMins(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
}