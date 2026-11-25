// ============================================================================
// booking-details.component.ts
// Asiaporeair | "Your Journey Manifest" — Booking Details Smart Page
// ============================================================================

import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { ManageBookingStore } from '../../../store/manage-booking.store';
import { BookingService } from '@shared-core';
import { IBookingDetailDto } from '@shared-core';

import { ItineraryTimelineComponent } from '../../components/itinerary-timeline/itinerary-timeline.component';
import { PassengerManifestComponent } from '../../components/passenger-manifest/passenger-manifest.component';
import { SeatAssignmentDisplayComponent } from '../../components/seat-assignment-display/seat-assignment-display.component';
import { AncillaryServicesListComponent } from '../../components/ancillary-services-list/ancillary-services-list.component';
import { PriceBreakdownAccordionComponent } from '../../components/price-breakdown-accordion/price-breakdown-accordion.component';
import { BoardingPassCardComponent } from '../../components/boarding-pass-card/boarding-pass-card.component';

// ── Animations ────────────────────────────────────────────────────────────────
const DETAILS_ANIMATIONS = [
  trigger('heroEnter', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-20px)' }),
      animate('500ms cubic-bezier(0.22,1,0.36,1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),
  trigger('sectionsCascade', [
    transition(':enter', [
      query('.section-animate', [
        style({ opacity: 0, transform: 'translateY(24px)' }),
        stagger(90, [
          animate('460ms cubic-bezier(0.22,1,0.36,1)',
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
  ])
];

@Component({
  selector: 'app-booking-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ItineraryTimelineComponent,
    PassengerManifestComponent,
    SeatAssignmentDisplayComponent,
    AncillaryServicesListComponent,
    PriceBreakdownAccordionComponent,
    BoardingPassCardComponent
  ],
  animations: DETAILS_ANIMATIONS,
  templateUrl: './booking-details.component.html',
  styleUrls: ['./booking-details.component.scss']
})
export class BookingDetailsComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────────
  private readonly store = inject(ManageBookingStore);
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  // ── Store aliases ─────────────────────────────────────────────────────────
  readonly detail = this.store.selectedBookingDetails;
  readonly isLoading = this.store.isDetailsLoading;
  readonly errorMessage = this.store.detailsError;
  readonly canModify = this.store.canModifySelected;
  readonly canCancel = this.store.canCancelSelected;

  // ── Local UI state ────────────────────────────────────────────────────────
  readonly showCancelModal = signal<boolean>(false);
  readonly showBoardingPasses = signal<boolean>(false);
  readonly isPrintMode = signal<boolean>(false);

  // ── Route param ───────────────────────────────────────────────────────────
  private bookingId: number | string = 0;

  // ── Computed display helpers ──────────────────────────────────────────────

  readonly statusConfig = computed(() => {
    const d = this.detail();
    if (!d) return null;
    if (d.isCancelled) return { label: 'Cancelled', cls: 'status--cancelled' };
    const s = (d.paymentStatus ?? '').toLowerCase();
    if (s.includes('pending')) return { label: 'Pending Payment', cls: 'status--pending' };
    if (s.includes('succeed') || s.includes('paid'))
      return { label: 'Confirmed', cls: 'status--confirmed' };
    return { label: d.paymentStatus, cls: 'status--default' };
  });

  readonly departureDisplay = computed(() => {
    const d = this.detail();
    if (!d?.flightDepartureTime) return null;
    const dt = new Date(d.flightDepartureTime);
    return {
      time: dt.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false }),
      date: dt.toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    };
  });

  readonly arrivalDisplay = computed(() => {
    const d = this.detail();
    if (!d?.flightArrivalTime) return null;
    const dt = new Date(d.flightArrivalTime);
    return {
      time: dt.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false }),
      date: dt.toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    };
  });

  readonly flightDuration = computed(() => {
    const d = this.detail();
    if (!d?.flightDepartureTime || !d?.flightArrivalTime) return '';
    const dep = new Date(d.flightDepartureTime);
    const arr = new Date(d.flightArrivalTime);
    const ms = arr.getTime() - dep.getTime();
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    return `${h}h ${m}m`;
  });

  readonly bookedOnDisplay = computed(() => {
    const raw = this.detail()?.bookingTime;
    if (!raw) return '';
    return new Date(raw).toLocaleDateString('en-SG', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  });

  readonly hasAncillaries = computed(() =>
    (this.detail()?.ancillarySales?.length ?? 0) > 0
  );

  readonly hasSeats = computed(() =>
    this.detail()?.passengers?.some(p => !!p.assignedSeatNumber) ?? false
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    this.bookingId = isNaN(Number(rawId)) ? (rawId ?? '') : Number(rawId);
    this.store.clearBookingDetails();
    this.loadDetail();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Private Loaders ───────────────────────────────────────────────────────

  private loadDetail(): void {
    this.store.setDetailsLoading(true);
    this.store.setDetailsError(null);

    // Determine whether to fetch by internal numeric ID or alphanumeric Reference (PNR)
    const call$ = typeof this.bookingId === 'number'
      ? this.bookingService.getBookingDetails(this.bookingId)
      : this.bookingService.getBookingByReference(this.bookingId);

    call$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.store.setDetailsLoading(false)),
        catchError(err => {
          this.store.setDetailsError(this.resolveError(err));
          return of(null);
        })
      )
      .subscribe(detail => {
        if (detail) this.store.setBookingDetails(detail);
      });
  }

  private resolveError(err: any): string {
    switch (err?.status) {
      case 401: return 'Please sign in to view this booking.';
      case 403: return 'Access restricted. Contact concierge support.';
      case 404: return 'Booking not found. Verify your reference and try again.';
      default: return 'Unable to load your booking. Please try again.';
    }
  }

  // ── Public Actions ────────────────────────────────────────────────────────

  onBack(): void {
    this.router.navigate(['/manage-booking/my-trips']);
  }

  onModifyJourney(): void {
    this.router.navigate(['/manage-booking/booking', this.bookingId, 'modify']);
  }

  onOpenCancelModal(): void { this.showCancelModal.set(true); }
  onCloseCancelModal(): void { this.showCancelModal.set(false); }

  onConfirmCancel(): void {
    const d = this.detail();
    if (!d) return;
    this.onCloseCancelModal();
    this.router.navigate(['/manage-booking/booking', this.bookingId, 'cancel']);
  }

  onAddServices(): void {
    this.router.navigate(['/manage-booking/booking', this.bookingId, 'add-services']);
  }

  onDownloadBoardingPasses(): void {
    this.showBoardingPasses.set(true);
    setTimeout(() => window.print(), 300);
  }

  onPrint(): void {
    this.isPrintMode.set(true);
    setTimeout(() => { window.print(); this.isPrintMode.set(false); }, 300);
  }

  // ── Template Helpers ──────────────────────────────────────────────────────

  formatPrice(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}