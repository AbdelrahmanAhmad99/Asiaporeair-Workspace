// ============================================================================
// passenger-selection.component.ts
// Asiaporeair | Step 2 — Passenger Manifest & Boarding Pass Generation
// Smart Component: reads store, calls service, updates store, navigates.
// ============================================================================

import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, inject, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { CheckInStore } from '../../../store/check-in.store';
import { IBookingPassengerDetailDto } from '@shared-core';
import { CheckInService } from '@shared-core';
import { IGenerateBoardingPassRequest } from '@shared-core';

import { CheckInStepperComponent } from '../../../check-in-search/components/check-in-stepper/check-in-stepper.component';
import { PassengerCheckInCardComponent } from '../../components/passenger-check-in-card/passenger-check-in-card.component';

// ── Animations ────────────────────────────────────────────────────────────────
const PAGE_ANIMATIONS = [
  trigger('headerSlide', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-16px)' }),
      animate('500ms cubic-bezier(0.22, 1, 0.36, 1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),
  trigger('listStagger', [
    transition(':enter', [
      query('.pax-card-host', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger(90, [
          animate('420ms cubic-bezier(0.22, 1, 0.36, 1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('300ms ease-out', style({ opacity: 1 }))
    ])
  ]),
  trigger('summaryReveal', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.97)' }),
      animate('380ms cubic-bezier(0.22, 1, 0.36, 1)',
        style({ opacity: 1, transform: 'scale(1)' }))
    ])
  ])
];

@Component({
  selector: 'app-passenger-selection',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    CheckInStepperComponent,
    PassengerCheckInCardComponent
  ],
  animations: PAGE_ANIMATIONS,
  templateUrl: './passenger-selection.component.html',
  styleUrls: ['./passenger-selection.component.scss']
})
export class PassengerSelectionComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────────
  readonly store = inject(CheckInStore);
  readonly router = inject(Router);
  private readonly checkInService = inject(CheckInService);
  private readonly destroy$ = new Subject<void>();

  // ── Store signal aliases exposed to template ───────────────────────────────
  readonly checkInStep = this.store.checkInStep;
  readonly currentBooking = this.store.currentBooking;
  readonly passengers = this.store.passengers;
  readonly isGenerating = this.store.isGenerating;
  readonly allPassengersChecked = this.store.allPassengersCheckedIn;
  readonly checkedInCount = this.store.checkedInCount;
  readonly generationError = this.store.generationError;
  readonly flightRoute = this.store.flightRouteSummary;

  /** Formatted departure time — derived from the booking signal. */
  readonly departureTime = computed((): string => {
    const dt = this.currentBooking()?.flightDepartureTime;
    if (!dt) return '';
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short', day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).format(new Date(dt));
  });

  /** True when the booking is missing (direct URL access without Step 1). */
  readonly isMissingBooking = computed((): boolean => !this.currentBooking());

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Guard: if the store has no booking, redirect back to search
    if (!this.store.hasBooking()) {
      this.router.navigate(['/check-in/search']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Public Actions ─────────────────────────────────────────────────────────

  /**
   * Dispatches a boarding pass generation request for a specific passenger.
   *
   * Flow:
   *   1. Derive bookingId from the store's currentBooking.
   *   2. Mark the passenger as "generating" in the store (shows card skeleton).
   *   3. POST to checkInService.generateBoardingPass().
   *   4a. Success → store.setBoardingPassSuccess() → navigate to /check-in/success.
   *   4b. Failure → store.setBoardingPassError() → inline card error shown.
   */
  onGeneratePass(passenger: IBookingPassengerDetailDto): void {
    const bookingId = this.currentBooking()?.bookingId;
    if (!bookingId) return;

    const request: IGenerateBoardingPassRequest = {
      bookingId,
      passengerId: passenger.passengerId
    };

    this.store.beginGenerating(passenger.passengerId);

    this.checkInService
      .generateBoardingPass(request)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err: HttpErrorResponse) => {
          this.store.setBoardingPassError(
            passenger.passengerId,
            this.resolveGenerationError(err)
          );
          return of(null);
        })
      )
      .subscribe(boardingPass => {
        if (!boardingPass) return;

        this.store.setBoardingPassSuccess(boardingPass);

        // Navigate to success page after the gold success animation
        setTimeout(() => {
          this.store.advanceStep();
          this.router.navigate(['/check-in/success']);
        }, 750);
      });
  }

  /** Called by "View Pass" button on an already-checked-in card. */
  onViewPass(passengerId: number): void {
    // Re-surface the stored boarding pass for this passenger
    const pass = this.store.generatedBoardingPasses().find(
      p => p.passengerId === passengerId
    );
    if (pass) {
      this.store.setBoardingPassSuccess(pass); // sets activeBoardingPass
      this.router.navigate(['/check-in/success']);
    }
  }

  /** Back navigation — decrements stepper and returns to search. */
  onBack(): void {
    this.store.retreatStep();
    this.router.navigate(['/check-in/search']);
  }

  /** Helper for per-passenger generating state — used in template @if. */
  isGeneratingFor(passengerId: number): boolean {
    return this.store.isPassengerGenerating(passengerId);
  }

  /** Helper for per-passenger checked-in state — used in template @if. */
  isCheckedInFor(passengerId: number): boolean {
    return this.store.isPassengerCheckedIn(passengerId);
  }

  /** Helper for per-passenger error — used in template. */
  getErrorFor(passengerId: number): string | null {
    return this.store.getPassengerError(passengerId);
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  private resolveGenerationError(err: HttpErrorResponse): string {
    switch (err.status) {
      case 400:
        return 'Invalid boarding details. Please verify your booking and try again.';
      case 404:
        return 'Passenger record not found. Please return to search and re-enter your booking.';
      case 409:
        return 'A boarding pass has already been issued for this passenger.';
      case 422:
        return 'Check-in is not yet open for this flight. Please return 48 hours before departure.';
      case 429:
        return 'Too many requests. Please wait a moment before retrying.';
      default:
        return 'Unable to generate boarding pass. Our concierge team has been notified.';
    }
  }

  /** trackBy for passenger list @for loop. */
  trackByPassengerId(_: number, p: IBookingPassengerDetailDto): number {
    return p.passengerId;
  }
}