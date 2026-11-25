// ============================================================================
// my-trips.component.ts
// Asiaporeair | "My Trips" — Smart Page
// ============================================================================

import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, inject, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import {
  ManageBookingStore,
  BookingFilter,
  IManageBookingDto,
  IPaginatedResult
} from '../../../store/manage-booking.store';
import { BookingService } from '@shared-core';

import { TripCardComponent } from '../../components/trip-card/trip-card.component';
import { BookingStatusBadgeComponent } from '../../components/booking-status-badge/booking-status-badge.component';
import { EmptyTripsStateComponent } from '../../components/empty-trips-state/empty-trips-state.component';

@Component({
  selector: 'app-my-trips',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    TripCardComponent,
    BookingStatusBadgeComponent,
    EmptyTripsStateComponent
  ],
  templateUrl: './my-trips.component.html',
  styleUrls: ['./my-trips.component.scss']
})
export class MyTripsComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────────
  private readonly store = inject(ManageBookingStore);
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // ── Store signal aliases exposed to template ──────────────────────────────
  readonly bookings = this.store.filteredBookings;
  readonly isLoading = this.store.isLoading;
  readonly isEmpty = this.store.isFilteredEmpty;
  readonly activeFilter = this.store.activeFilter;
  readonly currentPage = this.store.currentPage;
  readonly totalPages = this.store.totalPages;
  readonly totalCount = this.store.totalCount;
  readonly upcomingCount = this.store.upcomingCount;
  readonly errorMessage = this.store.errorMessage;
  readonly hasPrevious = this.store.hasPreviousPage;
  readonly hasNext = this.store.hasNextPage;
  readonly pageSize = this.store.pageSize;

  // ── Filter tab config ─────────────────────────────────────────────────────
  readonly filterTabs: { key: BookingFilter; label: string }[] = [
    { key: 'all', label: 'All Bookings' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past Trips' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  // Skeleton indices for loading state
  readonly skeletonItems = [0, 1, 2];

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.loadBookings(this.currentPage());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Private Loaders ───────────────────────────────────────────────────────

  loadBookings(page: number): void {
    this.store.setLoading(true);
    this.store.setError(null);

    this.bookingService
      .getMyBookings(page, this.pageSize())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.store.setLoading(false)),
        catchError(err => {
          this.store.setError(this.resolveErrorMessage(err));
          return of(null);
        })
      )
      .subscribe(result => {
        if (result) {
          // Map IBookingDto to IManageBookingDto shape
          const mapped = this.mapToManageDto(result as any);
          this.store.setBookings(mapped);
        }
      });
  }

  /**
   * Maps the existing IBookingDto API shape to IManageBookingDto.
   * Bridges the two DTOs until the API is updated to return the
   * richer manage-booking shape directly.
   */
  private mapToManageDto(result: any): IPaginatedResult<IManageBookingDto> {
    const items: IManageBookingDto[] = (result.items ?? []).map((b: any) => ({
      id: String(b.bookingId ?? b.id ?? ''),
      pnrCode: b.bookingReference ?? b.pnrCode ?? '',
      bookingDate: b.bookingTime ?? b.bookingDate ?? '',
      status: this.deriveStatus(b),
      originCity: b.originAirportName ?? b.originCity ?? '',
      originCode: b.originAirportCode ?? b.originCode ?? '',
      destinationCity: b.destinationAirportName ?? b.destinationCity ?? '',
      destinationCode: b.destinationAirportCode ?? b.destinationCode ?? '',
      departureDateTime: b.flightDepartureTime ?? b.departureDateTime ?? '',
      arrivalDateTime: b.flightArrivalTime ?? b.arrivalDateTime ?? '',
      flightDuration: b.flightDuration ?? '',
      flightNumber: b.flightNumber ?? '',
      isRoundTrip: b.isRoundTrip ?? false,
      returnDepartureDateTime: b.returnDepartureDateTime,
      returnArrivalDateTime: b.returnArrivalDateTime,
      passengerCount: b.passengers?.length ?? b.passengerCount ?? 1,
      cabinClass: (b.cabinClass ?? 'Economy') as any,
      totalAmount: b.totalPrice ?? b.totalAmount ?? 0,
      currency: b.currency ?? 'SGD',
      canModify: b.canModify ?? (this.deriveStatus(b) === 'Confirmed'),
      canCancel: b.canCancel ?? (this.deriveStatus(b) === 'Confirmed'),
      canCheckIn: b.canCheckIn ?? false,
      boardingPassAvailable: b.boardingPassAvailable ?? false
    }));

    return {
      items,
      totalCount: result.totalCount ?? items.length,
      pageNumber: result.pageNumber ?? 1,
      pageSize: result.pageSize ?? 10,
      totalPages: result.totalPages ?? 1,
      hasPrevious: result.hasPreviousPage ?? result.hasPrevious ?? false,
      hasNext: result.hasNextPage ?? result.hasNext ?? false
    };
  }

  private deriveStatus(b: any): IManageBookingDto['status'] {
    const rawStatus = (b.status ?? '').toLowerCase();
    const payStatus = (b.paymentStatus ?? '').toLowerCase();

    if (b.isCancelled || rawStatus.includes('cancel') || payStatus.includes('cancel')) {
      return 'Cancelled';
    }

    if (rawStatus.includes('check')) return 'CheckedIn';
    if (rawStatus.includes('fly') || rawStatus.includes('flown')) return 'Flown';
    if (payStatus.includes('pending')) return 'PendingPayment';

    return 'Confirmed';
  }

  private resolveErrorMessage(err: any): string {
    switch (err?.status) {
      case 401: return 'Please sign in to view your trips.';
      case 403: return 'Access restricted. Contact concierge support.';
      case 404: return 'No bookings found for this account.';
      case 500:
      case 503: return 'Our systems are momentarily unavailable.';
      default: return 'Unable to load your trips. Please try again.';
    }
  }

  // ── Public Actions ────────────────────────────────────────────────────────

  onFilterChange(filter: BookingFilter): void {
    this.store.setFilter(filter);
    this.loadBookings(1);
  }

  onPageChange(page: number): void {
    this.store.currentPage.set(page);
    this.loadBookings(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onViewDetails(booking: IManageBookingDto): void {
    this.store.selectBooking(booking);
    this.router.navigate(['/manage-booking/booking', booking.pnrCode]);
  }

  onModify(pnrCode: string): void {
    this.router.navigate(['/manage-booking/booking', pnrCode, 'modify']);
  }

  onCancel(pnrCode: string): void {
    this.router.navigate(['/manage-booking/booking', pnrCode, 'cancel']);
  }

  onAddServices(pnrCode: string): void {
    this.router.navigate(['/manage-booking/booking', pnrCode, 'add-services']);
  }

  onCheckIn(pnrCode: string): void {
    this.router.navigate(['/check-in/start', pnrCode]);
  }

  onBeginJourney(): void {
    this.router.navigate(['/booking/flight-search']);
  }

  // ── Template Helpers ──────────────────────────────────────────────────────

  formatCurrency(amount: number, currency: string): string {
    return `${currency} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  trackByPnr(_: number, booking: IManageBookingDto): string {
    return booking.pnrCode;
  }

  trackByFilter(_: number, tab: { key: BookingFilter }): string {
    return tab.key;
  }
}