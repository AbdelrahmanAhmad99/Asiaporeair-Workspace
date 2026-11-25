// ============================================================================
// flight-status-viewer.component.ts
// Asiaporeair | "Your Journey, Live" — Flight Status Viewer
//
// DATA CONTRACT: This page reads ONLY from flights.store.ts.
// It makes ZERO direct API calls. All data was populated by FlightStatusComponent.
//
// Guard behaviour: if store is empty (direct URL or refresh), displays an
// elegant empty-state with a navigation button back to the search page.
// ============================================================================

import {
  Component, OnInit, ChangeDetectionStrategy,
  inject, computed, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';

import { FlightsStore } from '../../../store/flights.store';
import { FlightStatusCardComponent } from '../../components/flight-status-card/flight-status-card.component';
import { FlightProgressTimelineComponent } from '../../components/flight-progress-timeline/flight-progress-timeline.component';
import { FlightStatusBadgeComponent } from '../../components/flight-status-badge/flight-status-badge.component';

// ── Page animations ────────────────────────────────────────────────────────────
const PAGE_ANIMATIONS = [
  trigger('heroReveal', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-12px)' }),
      animate('480ms cubic-bezier(0.22, 1, 0.36, 1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),
  trigger('cardStagger', [
    transition(':enter', [
      query('.stagger-card', [
        style({ opacity: 0, transform: 'translateY(24px)' }),
        stagger(100, [
          animate('460ms cubic-bezier(0.22, 1, 0.36, 1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('300ms ease', style({ opacity: 1 }))
    ])
  ]),
  trigger('slideUp', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(16px)' }),
      animate('380ms cubic-bezier(0.22, 1, 0.36, 1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ])
];

@Component({
  selector: 'app-status-viewer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FlightStatusCardComponent,
    FlightProgressTimelineComponent,
    FlightStatusBadgeComponent
  ],
  animations: PAGE_ANIMATIONS,
  templateUrl: './status-viewer.component.html',
  styleUrls: ['./status-viewer.component.scss']
})
export class StatusViewerComponent implements OnInit {

  // ── DI ────────────────────────────────────────────────────────────────────
  private readonly store = inject(FlightsStore);
  readonly router = inject(Router);

  // ── Store signal aliases ──────────────────────────────────────────────────
  /** The IFlightSegmentDto from Step B of the status chain */
  readonly segment = this.store.currentFlightSegment;

  /** The IFlightDetailsDto from Step C — has .status, cabin classes, amenities */
  readonly details = this.store.currentFlightDetails;

  /** True only when BOTH halves are present */
  readonly hasData = this.store.hasCompleteStatus;

  /** The official status string: details.status */
  readonly statusLabel = this.store.currentStatusLabel;

  /** The flight number the user searched for */
  readonly searchedFlightNum = this.store.lastSearchedFlightNum;
  readonly searchedDate = this.store.lastSearchedDate;

  // ── Computed display values ────────────────────────────────────────────────

  /** Full airport names from IFlightDetailsDto (richer than segment names) */
  readonly originAirportName = computed(() =>
    this.details()?.originAirportName ?? this.segment()?.originAirportName ?? ''
  );
  readonly destAirportName = computed(() =>
    this.details()?.destinationAirportName ?? this.segment()?.destinationAirportName ?? ''
  );

  /**
   * Cabin classes from IFlightDetailsDto, sorted by name so First Class
   * always comes first in the display grid.
   */
  readonly cabinClasses = computed(() => {
    const order = ['First', 'Business', 'Premium Economy', 'Economy'];
    return [...(this.details()?.cabinClasses ?? [])].sort((a, b) => {
      const ai = order.findIndex(o => a.name.includes(o));
      const bi = order.findIndex(o => b.name.includes(o));
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  });

  /** Formatted date for page display */
  readonly formattedSearchDate = computed((): string => {
    const d = this.searchedDate();
    if (!d) return '';
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    }).format(new Date(d));
  });

  /** True if any cabin has available seats ≤ 10 (low inventory nudge) */
  readonly hasLowInventory = computed(() =>
    this.cabinClasses().some(c => c.availableSeats > 0 && c.availableSeats <= 10)
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // If no data is in store, the empty state guard handles the UI.
    // No API call is made — this page is strictly a store reader.
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Returns user to the search page without clearing the store. */
  onTrackAnotherFlight(): void {
    this.store.clearStatusResult();
    this.router.navigate(['/flight-info/status']);
  }

  /** Returns to the main flight search experience. */
  onBackToSearch(): void {
    this.router.navigate(['/flight-info/search']);
  }

  /** Helper: percentage fill for cabin availability bar */
  getCabinFillPercent(total: number, available: number): number {
    if (!total) return 0;
    return Math.round(((total - available) / total) * 100);
  }
}