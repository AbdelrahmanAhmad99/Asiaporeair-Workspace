// ============================================================================
// retrieve-booking.component.ts
// Asiaporeair | "Locate Your Journey" — Retrieve Booking Smart Page
// ============================================================================

import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { ManageBookingStore } from '../../../store/manage-booking.store';
import { BookingService } from '@shared-core';

import { PnrLookupFormComponent } from '../../components/pnr-lookup-form/pnr-lookup-form.component';
import { LookupHelperCardComponent } from '../../components/lookup-helper-card/lookup-helper-card.component';

// ── Animations ────────────────────────────────────────────────────────────────
const RETRIEVE_ANIMATIONS = [
  trigger('heroEnter', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-16px)' }),
      animate('480ms cubic-bezier(0.22,1,0.36,1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),
  trigger('contentFadeUp', [
    transition(':enter', [
      query('.content-item', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger(80, [
          animate('400ms cubic-bezier(0.22,1,0.36,1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('280ms ease-out', style({ opacity: 1 }))
    ]),
    transition(':leave', [
      animate('200ms ease-in', style({ opacity: 0 }))
    ])
  ]),
  trigger('toastSlide', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(20px)' }),
      animate('320ms cubic-bezier(0.22,1,0.36,1)',
        style({ opacity: 1, transform: 'translateX(0)' }))
    ]),
    transition(':leave', [
      animate('200ms ease-in',
        style({ opacity: 0, transform: 'translateX(20px)' }))
    ])
  ])
];

export type RetrieveFlowState = 'idle' | 'searching' | 'success' | 'error';

@Component({
  selector: 'app-retrieve-booking',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    PnrLookupFormComponent,
    LookupHelperCardComponent
  ],
  animations: RETRIEVE_ANIMATIONS,
  templateUrl: './retrieve-booking.component.html',
  styleUrls: ['./retrieve-booking.component.scss']
})
export class RetrieveBookingComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────────
  private readonly store = inject(ManageBookingStore);
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // ── Store aliases ─────────────────────────────────────────────────────────
  readonly searchLoading = this.store.searchLoading;
  readonly searchError = this.store.searchError;
  readonly lastRef = this.store.lastRetrievedRef;

  // ── Local UI state ────────────────────────────────────────────────────────
  readonly flowState = signal<RetrieveFlowState>('idle');
  readonly showToast = signal<boolean>(false);
  readonly toastMsg = signal<string>('');
  readonly toastType = signal<'success' | 'error'>('success');

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly isSearching = computed(() => this.flowState() === 'searching');
  readonly hasError = computed(() => !!this.searchError() && this.flowState() === 'error');

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.store.resetSearchState();
    this.flowState.set('idle');
  }

  ngOnDestroy(): void {
    this.store.resetSearchState();
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Public Actions ────────────────────────────────────────────────────────

  onSearch(event: { bookingReference: string; lastName: string }): void {
    const ref = event.bookingReference.trim().toUpperCase();

    this.store.setSearchLoading(true);
    this.store.setSearchError(null);
    this.flowState.set('searching');

    this.bookingService
      .getBookingByReference(ref)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.store.setSearchLoading(false)),
        catchError(err => {
          const msg = this.resolveError(err, ref);
          this.store.setSearchError(msg);
          this.flowState.set('error');
          this.showErrorToast(msg);
          return of(null);
        })
      )
      .subscribe(detail => {
        if (!detail) return;

        // Client-side last-name validation against returned data
        const bookingLastName = detail.passengers?.[0]?.lastName?.toLowerCase() ?? '';
        const inputLastName = event.lastName.trim().toLowerCase();

        if (inputLastName && bookingLastName && !bookingLastName.includes(inputLastName)) {
          const msg = 'The last name entered does not match the booking record. Please check your details.';
          this.store.setSearchError(msg);
          this.flowState.set('error');
          this.showErrorToast(msg);
          return;
        }

        this.store.setCurrentBooking(detail);
        this.flowState.set('success');
        this.showSuccessToast(`Booking ${ref} located. Redirecting…`);

        // Brief celebration pause, then navigate
        setTimeout(() => {
          this.router.navigate(['/manage-booking/booking', ref]);
        }, 1400);
      });
  }

  onGoToMyTrips(): void {
    this.router.navigate(['/manage-booking/my-trips']);
  }

  onGoHome(): void {
    this.router.navigate(['/']);
  }

  onClearSearch(): void {
    this.store.resetSearchState();
    this.flowState.set('idle');
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  private resolveError(err: any, ref: string): string {
    switch (err?.status) {
      case 404: return `No booking found for reference "${ref}". Please check your confirmation email.`;
      case 403: return 'This booking is not accessible. Please sign in to view your bookings.';
      case 429: return 'Too many search attempts. Please wait a moment before trying again.';
      default: return 'Our systems are momentarily unavailable. Please try again shortly.';
    }
  }

  private showSuccessToast(msg: string): void {
    this.toastMsg.set(msg);
    this.toastType.set('success');
    this.showToast.set(true);
    this.scheduleToastDismissal();
  }

  private showErrorToast(msg: string): void {
    this.toastMsg.set(msg);
    this.toastType.set('error');
    this.showToast.set(true);
    this.scheduleToastDismissal();
  }

  private scheduleToastDismissal(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.showToast.set(false), 4500);
  }
}