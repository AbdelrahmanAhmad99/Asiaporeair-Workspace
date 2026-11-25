
import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IBcSearchFilters } from '../../store/booking-center.store';

// Payment status options for the dropdown
export const PAYMENT_STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Waitlisted', value: 'Waitlisted' },
  { label: 'Cancelled', value: 'Cancelled' },
  { label: 'Refunded', value: 'Refunded' },
];

@Component({
  selector: 'aoms-booking-search-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './booking-search-filters.component.html',
  styleUrl: './booking-search-filters.component.scss',
})
export class BookingSearchFiltersComponent implements OnChanges {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly currentFilters = input.required<IBcSearchFilters>();
  readonly isLoading = input<boolean>(false);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly filtersSubmitted = output<IBcSearchFilters>();
  readonly filtersReset = output<void>();
  readonly referenceSearchTriggered = output<string>();

  // ── Local form state (local signals, NOT store) ────────────────────────
  protected readonly form = signal<IBcSearchFilters>({
    bookingReference: '',
    flightNumber: '',
    departureDateFrom: '',
    departureDateTo: '',
    paymentStatus: '',
    passengerNameContains: '',
  });

  protected readonly statusOptions = PAYMENT_STATUS_OPTIONS;

  // ── Sync from parent ───────────────────────────────────────────────────
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentFilters']) {
      this.form.set({ ...this.currentFilters() });
    }
  }

  // ── Form helpers ───────────────────────────────────────────────────────
  protected onFieldChange(field: keyof IBcSearchFilters, value: string): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  protected onSubmit(): void {
    this.filtersSubmitted.emit({ ...this.form() });
  }

  protected onSearchByReference(): void {
    const ref = this.form().bookingReference?.trim();
    if (!ref) {
      return;
    }
    this.referenceSearchTriggered.emit(ref);
  }

  protected onReset(): void {
    this.form.set({
      bookingReference: '',
      flightNumber: '',
      departureDateFrom: '',
      departureDateTo: '',
      paymentStatus: '',
      passengerNameContains: '',
    });
    this.filtersReset.emit();
  }

  protected hasActiveFilters(): boolean {
    const f = this.form();
    return !!(
      f.bookingReference ||
      f.flightNumber ||
      f.departureDateFrom ||
      f.departureDateTo ||
      f.paymentStatus ||
      f.passengerNameContains
    );
  }

  /** Keyboard shortcut: Enter on any input submits */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSubmit();
    }
  }
}