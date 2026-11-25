// ============================================================================
// flight-status.component.ts
// Asiaporeair | "Track Your Journey" — Flight Status Smart Page
//
// CHAINED API ORCHESTRATION (6-step flow):
//   A. User fills status-search-form and submits IStatusSearchPayload
//   B. store.beginStatusSearch() — sets isSearching = true, clears previous
//   C. flightsService.getFlightStatus(request)   → IFlightSegmentDto (Step B)
//   D. switchMap: flightsService.getFlightDetails(segment.flightInstanceId)
//      → IFlightDetailsDto (Step C)
//   E. store.setStatusChainResult({ segment, details }) — atomic store write
//   F. router.navigate(['/flight-info/status-viewer'])
//
// RxJS pattern: switchMap + forkJoin-free sequential chain
// Error handling: per-status-code concierge messages stored in the chain error
// ============================================================================

import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, inject, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { switchMap, tap, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { FlightsStore, IStatusChainResult } from '../../../store/flights.store';
import { FlightsService } from '@shared-core';
import {
  IFlightStatusRequestDto,
  IFlightSegmentDto,
  IFlightDetailsDto
} from '@shared-core';

import {
  StatusSearchFormComponent,
  IStatusSearchPayload
} from '../../components/status-search-form/status-search-form.component';

// ── Page animations ────────────────────────────────────────────────────────────
const PAGE_ANIMATIONS = [
  trigger('heroFade', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-14px)' }),
      animate('500ms cubic-bezier(0.22, 1, 0.36, 1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),
  trigger('cardReveal', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(28px) scale(0.98)' }),
      animate('560ms cubic-bezier(0.22, 1, 0.36, 1)',
        style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
    ])
  ]),
  trigger('infoReveal', [
    transition(':enter', [
      query('.info-block', [
        style({ opacity: 0, transform: 'translateX(-12px)' }),
        stagger(80, [
          animate('380ms cubic-bezier(0.22, 1, 0.36, 1)',
            style({ opacity: 1, transform: 'translateX(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('280ms ease', style({ opacity: 1 }))
    ])
  ])
];

@Component({
  selector: 'app-flight-status',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    StatusSearchFormComponent
  ],
  animations: PAGE_ANIMATIONS,
  templateUrl: './flight-status.component.html',
  styleUrls: ['./flight-status.component.scss']
})
export class FlightStatusComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────────
  private readonly store = inject(FlightsStore);
  private readonly flightsService = inject(FlightsService);
  readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // ── Store signal aliases exposed to template ───────────────────────────────
  readonly isSearching = this.store.isSearching;
  readonly statusChainError = this.store.statusChainError;
  readonly lastSearchedFlight = this.store.lastSearchedFlightNum;
  readonly lastSearchedDate = this.store.lastSearchedDate;
  readonly hasCompleteStatus = this.store.hasCompleteStatus;

  // ── Computed helpers for the template ─────────────────────────────────────

  /** Pre-populates the form on back-navigation */
  readonly initialFlightNumber = computed(() => this.store.lastSearchedFlightNum());
  readonly initialDate = computed(() => {
    const iso = this.store.lastSearchedDate();
    if (!iso) return '';
    // Convert full ISO back to YYYY-MM-DD for the form
    return iso.split('T')[0] ?? iso;
  });

  /** Converts the stored ISO date to a readable format for the error notice. */
  readonly formattedSearchDate = computed((): string => {
    const d = this.store.lastSearchedDate();
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-GB', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
    });
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // If we already have a complete status result from a previous search,
    // clear it so the page starts clean for a new lookup.
    // (The viewer page will still have the data until the user clears it.)
    this.store.statusChainError.set(null);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Core: 6-step chained API handler ─────────────────────────────────────


  onSearchSubmit(payload: IStatusSearchPayload): void {
    const statusRequest: IFlightStatusRequestDto = {
      flightNumber: payload.flightNumber,
      flightDate: payload.flightDate
    };

    // ── Step B: Mark store as loading, record what was searched ───────────
    this.store.beginStatusSearch(payload.flightNumber, payload.flightDate);

    let capturedSegment: IFlightSegmentDto | null = null;

    this.flightsService
      .getFlightStatus(statusRequest)
      .pipe(
        // ── Step B → C: Extract flightInstanceId, chain to getFlightDetails ──
        tap((segment: IFlightSegmentDto) => {
          // Capture segment while transitioning to Details call
          capturedSegment = segment;
        }),
        switchMap((segment: IFlightSegmentDto) =>
          // ── Step C: Fetch full flight details using the flightInstanceId ──
          this.flightsService.getFlightDetails(segment.flightInstanceId)
        ),
        takeUntil(this.destroy$),
        catchError((err: HttpErrorResponse) => {
          // ── Error: Resolve concierge message, update store ─────────────
          const message = this.resolveChainError(err, payload.flightNumber);
          this.store.setStatusChainError(message);
          return of(null); // absorb error, emit null to finalize
        }),
        finalize(() => {
          // Safety: ensure isSearching is cleared even on unexpected errors
          if (this.store.isSearching()) {
            this.store.isSearching.set(false);
          }
        })
      )
      .subscribe((details: IFlightDetailsDto | null) => {
        if (!details || !capturedSegment) return;

        // ── Step E: Atomic store update with both results ──────────────
        const result: IStatusChainResult = {
          segment: capturedSegment,
          details
        };
        this.store.setStatusChainResult(result);

        // ── Step F: Navigate to the viewer page ───────────────────────
        this.router.navigate(['/flight-info/status-viewer']);
      });
  }

  /** Called when the user clicks "Clear" in the form. */
  onClearSearch(): void {
    this.store.clearStatusResult();
  }

  // ── Private: error message resolution ─────────────────────────────────────

  private resolveChainError(err: HttpErrorResponse, flightNum: string): string {
    switch (err.status) {
      case 0:
        return 'Connection unavailable. Please verify your network and retry.';
      case 404:
        return `Flight ${flightNum} was not found for the selected date. Please verify the flight number and date.`;
      case 400:
        return err.error?.message
          ?? 'The search parameters appear to be invalid. Please review and try again.';
      case 429:
        return 'Too many requests. Please wait a moment before searching again.';
      case 503:
        return 'Our flight systems are momentarily unavailable. Please retry shortly.';
      default:
        return 'An unexpected issue occurred while tracking your journey. Our team has been notified.';
    }
  }
}