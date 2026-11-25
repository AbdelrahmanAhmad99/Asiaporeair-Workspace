// ============================================================================
// check-in-search.component.ts
// Asiaporeair | "Boarding & Services" — Check-in Entry Smart Page
// ============================================================================

import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger, keyframes
} from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { CheckInStore } from '../../../store/check-in.store';
import { BookingService } from '@shared-core';

import { CheckInStepperComponent } from '../../components/check-in-stepper/check-in-stepper.component';
import { CheckInLookupFormComponent, ICheckInLookupFormValue } from '../../components/check-in-lookup-form/check-in-lookup-form.component';
import { CheckInPolicyNoticeComponent } from '../../components/check-in-policy-notice/check-in-policy-notice.component';
import { EmptyStateErrorComponent } from '../../components/empty-state-error/empty-state-error.component';

// ── Page Animations ───────────────────────────────────────────────────────────
const PAGE_ANIMATIONS = [
  trigger('heroFadeDown', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-20px)' }),
      animate('560ms cubic-bezier(0.22,1,0.36,1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),
  trigger('cardDescend', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(36px) scale(0.98)' }),
      animate('600ms cubic-bezier(0.22,1,0.36,1)',
        style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
    ])
  ]),
  trigger('sidebarReveal', [
    transition(':enter', [
      query('.sidebar-item', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        stagger(110, [
          animate('440ms cubic-bezier(0.22,1,0.36,1)',
            style({ opacity: 1, transform: 'translateX(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('successGlow', [
    transition(':enter', [
      animate('700ms ease-out', keyframes([
        style({ opacity: 0, transform: 'scale(0.95)', boxShadow: '0 0 0px rgba(182,143,36,0)', offset: 0 }),
        style({ opacity: 1, transform: 'scale(1.01)', boxShadow: '0 0 40px rgba(182,143,36,0.35)', offset: 0.5 }),
        style({ opacity: 1, transform: 'scale(1)', boxShadow: '0 0 16px rgba(182,143,36,0.15)', offset: 1 })
      ]))
    ])
  ]),
  trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('300ms ease-out', style({ opacity: 1 }))
    ])
  ])
];

@Component({
  selector: 'app-check-in-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    CheckInStepperComponent,
    CheckInLookupFormComponent,
    CheckInPolicyNoticeComponent,
    EmptyStateErrorComponent
  ],
  animations: PAGE_ANIMATIONS,
  templateUrl: './check-in-search.component.html',
  styleUrls: ['./check-in-search.component.scss']
})
export class CheckInSearchComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────
  readonly store = inject(CheckInStore);
  private readonly bookingService = inject(BookingService);
  readonly router = inject(Router); // public — used in template navigation calls
  private readonly destroy$ = new Subject<void>();

  // ── Store signal aliases (exposed to template) ─────────────────────────
  readonly checkInStep = this.store.checkInStep;
  readonly isLoading = this.store.isLoading;
  readonly searchStatus = this.store.searchStatus;
  readonly error = this.store.error;
  readonly hasError = this.store.hasError;

  /** Used by *ngFor in the template to render ambient hero particles. */
  readonly particleArr = Array.from({ length: 12 }, (_, i) => i);

  // ── Lifecycle ─────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Reset to a clean search state each time this page loads
    this.store.resetSearchPhase();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Public Actions ────────────────────────────────────────────────────

  /**
   * Main submit handler — called by CheckInLookupFormComponent.
   *
   * Flow:
   *   1. Mark store as loading (drives form skeleton).
   *   2. Call bookingService.getBookingByReference() with PNR only.
   *   3. Client-side last-name validation against returned data.
   *   4. On pass → set currentBooking in store → navigate to passenger-selection.
   *   5. On fail → surface a concierge-toned error in the store.
   */
  onFormSubmit(value: ICheckInLookupFormValue): void {
    const { bookingReference, lastName } = value;

    this.store.beginSearch(bookingReference);

    this.bookingService
      .getBookingByReference(bookingReference)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          // isLoading is derived from searchStatus — no explicit reset needed
        }),
        catchError((err: HttpErrorResponse) => {
          this.store.setSearchError(
            this.resolveErrorStatus(err),
            this.resolveErrorMessage(err, bookingReference)
          );
          return of(null);
        })
      )
      .subscribe(booking => {
        if (!booking) return;

        // Client-side last-name cross-check
        const bookingLastName = booking.passengers?.[0]?.lastName?.toLowerCase() ?? '';
        const inputLastName = lastName.trim().toLowerCase();

        if (inputLastName && bookingLastName && !bookingLastName.includes(inputLastName)) {
          this.store.setSearchError(
            'not_found',
            'The last name entered does not match this booking record. Please ensure it matches your travel document exactly.'
          );
          return;
        }

        // Success → hydrate store and proceed
        this.store.setCurrentBooking(booking);
        this.store.advanceStep();

        // Short triumph pause for the success glow, then navigate
        setTimeout(() => {
          this.router.navigate(['/check-in/passenger-selection']);
        }, 900);
      });
  }

  /** Retry handler for EmptyStateErrorComponent. */
  onRetry(): void {
    this.store.resetSearchPhase();
  }

  // ── Private Helpers ───────────────────────────────────────────────────

  private resolveErrorStatus(err: HttpErrorResponse): 'not_found' | 'not_open' | 'error' {
    if (err.status === 404 || err.status === 400) return 'not_found';
    if (err.status === 409 || err.status === 422) return 'not_open';
    return 'error';
  }

  private resolveErrorMessage(err: HttpErrorResponse, ref: string): string {
    switch (err.status) {
      case 400:
      case 404:
        return `No booking was found for reference "${ref}". Please check your confirmation email and try again.`;
      case 409:
      case 422:
        return 'Online check-in for this flight is not currently available. Check-in opens 48 hours before departure and closes 90 minutes before.';
      case 429:
        return 'Too many requests. Please wait a moment before trying again.';
      default:
        return 'Our concierge services are momentarily unavailable. Please try again shortly.';
    }
  }
}