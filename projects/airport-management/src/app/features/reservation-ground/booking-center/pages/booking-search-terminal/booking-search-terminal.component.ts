

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookingCenterStore, IBcSearchFilters } from '../../store/booking-center.store';
import { BookingSearchFiltersComponent } from '../../components/booking-search-filters/booking-search-filters.component';
import { PnrStatusCardComponent } from '../../components/pnr-status-card/pnr-status-card.component';
import { PnrQuickViewDrawerComponent } from '../../components/pnr-quick-view-drawer/pnr-quick-view-drawer.component';
import { IBookingDto } from '@shared-core';

@Component({
  selector: 'aoms-booking-search-terminal',
  standalone: true,
  imports: [
    CommonModule,
    BookingSearchFiltersComponent,
    PnrStatusCardComponent,
    PnrQuickViewDrawerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking-search-terminal.component.html',
  styleUrl: './booking-search-terminal.component.scss',
})
export class BookingSearchTerminalComponent implements OnInit, OnDestroy {
  protected readonly store = inject(BookingCenterStore);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Load the full (unfiltered) booking list as soon as the terminal opens.
    this.store.executeSearch();
  }

  ngOnDestroy(): void {
    this.store.clearActionState();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Filter Bridge ──────────────────────────────────────────────────────
  protected onFiltersSubmitted(filters: IBcSearchFilters): void {
    this.store.executeSearch(filters);
  }

  protected onReferenceSearchTriggered(bookingReference: string): void {
    this.store.searchByReference(bookingReference);
  }

  protected onFiltersReset(): void {
    this.store.resetFilters();
    // After clearing filters, reload the full booking list.
    this.store.executeSearch();
  }

  // ── Card Interaction ───────────────────────────────────────────────────
  protected onCardQuickView(booking: IBookingDto): void {
    this.store.loadBookingQuickView(booking.bookingId);
  }

  protected onCardDeepExplore(booking: IBookingDto): void {
    this.store.navigateToPnrDetail(booking.bookingId);
  }

  // ── Drawer ─────────────────────────────────────────────────────────────
  protected onDrawerClose(): void {
    this.store.closeDrawer();
  }

  protected onDrawerDeepExplore(bookingId: number): void {
    this.store.navigateToPnrDetail(bookingId);
  }

  // ── Header Actions ─────────────────────────────────────────────────────
  protected onCreateBooking(): void {
    this.store.navigateToCreateBooking();
  }

  protected onPassengerIndex(): void {
    this.store.navigateToPassengerIndex();
  }

  // ── Pagination ─────────────────────────────────────────────────────────
  protected onNextPage(): void { this.store.nextPage(); }
  protected onPrevPage(): void { this.store.prevPage(); }
  protected onPageChanged(page: number): void { this.store.goToPage(page); }
}