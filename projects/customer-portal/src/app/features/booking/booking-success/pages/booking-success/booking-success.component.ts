// ============================================================================
// booking-success.component.ts
// Asiaporeair | "Your Suite is Prepared" — Booking Success Smart Page
// ============================================================================

import {
  Component, OnInit, OnDestroy, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger, keyframes
} from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';

import { BookingStore, BookingStep } from '../../../store/booking.store';
import { BookingService } from '@shared-core';
import { IBookingDetailDto } from '@shared-core';

import { PnrStatusBannerComponent } from '../../components/pnr-status-banner/pnr-status-banner.component';
import { ItineraryConfirmationCardComponent } from '../../components/itinerary-confirmation-card/itinerary-confirmation-card.component';
import { PassengerManifestListComponent } from '../../components/passenger-manifest-list/passenger-manifest-list.component';
import { PaymentReceiptSummaryComponent } from '../../components/payment-receipt-summary/payment-receipt-summary.component';
import { ActionHubFooterComponent } from '../../components/action-hub-footer/action-hub-footer.component';

// ── Victory Animations ────────────────────────────────────────────────────────
const SUCCESS_ANIMATIONS = [
  trigger('victoryEnter', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.94) translateY(20px)' }),
      animate('600ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
    ])
  ]),
  trigger('detailsStagger', [
    transition('* => *', [
      query('.detail-card', [
        style({ opacity: 0, transform: 'translateY(28px)' }),
        stagger(110, [
          animate('500ms cubic-bezier(0.16,1,0.3,1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('checkmarkPop', [
    transition(':enter', [
      animate('600ms 200ms cubic-bezier(0.34,1.56,0.64,1)',
        keyframes([
          style({ opacity: 0, transform: 'scale(0)', offset: 0 }),
          style({ opacity: 1, transform: 'scale(1.18)', offset: 0.7 }),
          style({ opacity: 1, transform: 'scale(1)', offset: 1 })
        ])
      )
    ])
  ]),
  trigger('fadeUp', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(16px)' }),
      animate('450ms 100ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),
  trigger('pnrReveal', [
    transition(':enter', [
      style({ opacity: 0, letterSpacing: '0.3em' }),
      animate('700ms 500ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, letterSpacing: '0.12em' }))
    ])
  ])
];

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [
    CommonModule,
    PnrStatusBannerComponent,
    ItineraryConfirmationCardComponent,
    PassengerManifestListComponent,
    PaymentReceiptSummaryComponent,
    ActionHubFooterComponent
  ],
  animations: SUCCESS_ANIMATIONS,
  templateUrl: './booking-success.component.html',
  styleUrls: ['./booking-success.component.scss']
})
export class BookingSuccessComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────────
  readonly bookingStore = inject(BookingStore);
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // ── Store Reads ───────────────────────────────────────────────────────────
  readonly confirmedBooking = computed(() => this.bookingStore.confirmedBooking());
  readonly completedPayment = computed(() => this.bookingStore.completedPayment());
  readonly seatAssignments = computed(() => this.bookingStore.seatAssignments());
  readonly currency = signal<string>('SGD');

  // ── Page State ────────────────────────────────────────────────────────────
  readonly bookingDetail = signal<IBookingDetailDto | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly loadError = signal<string | null>(null);
  readonly detailsVisible = signal<boolean>(false);

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly bookingRef = computed(() =>
    this.bookingDetail()?.bookingReference ??
    this.confirmedBooking()?.bookingReference ?? '—'
  );

  readonly confirmedAt = computed(() => {
    const raw = this.bookingDetail()?.bookingTime ?? this.confirmedBooking()?.bookingTime;
    if (!raw) return '';
    return new Date(raw).toLocaleDateString('en-SG', {
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  });

  readonly grandTotal = computed(() =>
    this.bookingDetail()?.totalPrice ??
    this.confirmedBooking()?.totalPrice ?? 0
  );

  readonly passengerCount = computed(() =>
    this.bookingDetail()?.passengers?.length ??
    this.confirmedBooking()?.passengers?.length ?? 0
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.fetchFullDetail();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private fetchFullDetail(): void {
    const booking = this.confirmedBooking();
    if (!booking) {
      const summary = this.bookingStore.finalBookingSummary();
      if (summary) {
        this.isLoading.set(false);
        setTimeout(() => this.detailsVisible.set(true), 300);
      } else {
        this.loadError.set('Booking details are unavailable. Your confirmation has been emailed to you.');
        this.isLoading.set(false);
      }
      return;
    }

    this.bookingService.getBookingDetails(booking.bookingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (detail) => {
          this.bookingDetail.set(detail);
          this.isLoading.set(false);
          this.bookingStore.setFinalBookingSummary(detail, this.currency());
          setTimeout(() => this.detailsVisible.set(true), 300);
        },
        error: (err) => {
          console.error('Booking success detail error:', err);
          this.loadError.set('We could not retrieve all booking details, but your journey is confirmed. Please check your email.');
          this.isLoading.set(false);
          setTimeout(() => this.detailsVisible.set(true), 300);
        }
      });
  }

  // ── Public Actions ────────────────────────────────────────────────────────

  onManageJourney(): void {
    this.router.navigate(['/manage-booking/my-trips']);
  }

  onGoHome(): void {
    this.bookingStore.startNewBooking();
    this.router.navigate(['/Home']);
  }

  onGoToProfile(): void {
    this.router.navigate(['/profile/personal-info']);
  }

  onPrintReceipt(): void {
    window.print();
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}