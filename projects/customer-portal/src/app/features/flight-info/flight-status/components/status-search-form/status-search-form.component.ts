// ============================================================================
// status-search-form.component.ts
// Asiaporeair | "Track Your Journey" — Flight Status Search Form
// Dumb Component: floating labels, gold focus rings, custom calendar.
// Zero service injection — pure input → validation → output.
// ============================================================================

import {
  Component, Output, EventEmitter, Input,
  ChangeDetectionStrategy, signal, computed, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// ── Payload shape emitted to the smart component ──────────────────────────────
export interface IStatusSearchPayload {
  /** Normalised uppercase flight number, e.g. "ASP101" */
  flightNumber: string;
  /** ISO 8601 date string "YYYY-MM-DDT00:00:00.000Z" */
  flightDate: string;
}

@Component({
  selector: 'app-status-search-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './status-search-form.component.html',
  styleUrls: ['./status-search-form.component.scss']
})
export class StatusSearchFormComponent implements OnInit {

  // ── Inputs ────────────────────────────────────────────────────────────────

  /**
   * Drives the gold-shimmer skeleton overlay.
   * When true, the form controls are visually replaced by the shimmer
   * and the submit button shows a spinner. Set by the smart component.
   */
  @Input() isSearching: boolean = false;

  /** If the user navigates back, re-populate the last searched number. */
  @Input() initialFlightNumber: string = '';

  /** If the user navigates back, re-populate the last searched date. */
  @Input() initialDate: string = '';

  // ── Outputs ───────────────────────────────────────────────────────────────

  /** Emitted when the form is valid and the user clicks submit. */
  @Output() formSubmit = new EventEmitter<IStatusSearchPayload>();

  /** Emitted when the user explicitly clicks "Clear" or "New Search". */
  @Output() clearSearch = new EventEmitter<void>();

  // ── Form field signals ────────────────────────────────────────────────────

  readonly flightNumber = signal<string>('');
  readonly selectedDate = signal<string>('');  // ISO date "YYYY-MM-DD"
  readonly fnTouched = signal<boolean>(false);
  readonly dateTouched = signal<boolean>(false);
  readonly formSubmitted = signal<boolean>(false);

  // ── Calendar state ────────────────────────────────────────────────────────

  readonly showCalendar = signal<boolean>(false);
  readonly calendarMonth = signal<Date>(new Date());

  readonly weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  readonly calendarMonthLabel = computed(() =>
    this.calendarMonth().toLocaleDateString('en-GB', {
      month: 'long', year: 'numeric'
    })
  );

  readonly calendarDays = computed<(Date | null)[]>(() => {
    const m = this.calendarMonth();
    const first = new Date(m.getFullYear(), m.getMonth(), 1);
    const last = new Date(m.getFullYear(), m.getMonth() + 1, 0);
    const days: (Date | null)[] = [];
    // Leading empty cells for correct weekday alignment
    for (let i = 0; i < first.getDay(); i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(m.getFullYear(), m.getMonth(), d));
    }
    return days;
  });

  // ── Validation computed signals ───────────────────────────────────────────

  /** Accepts IATA-style: 2–3 alpha prefix + 1–4 numeric suffix (e.g. ASP101, SQ22) */
  private readonly fnPattern = /^[A-Za-z]{1,3}\d{1,4}$/;

  readonly flightNumberError = computed<string | null>(() => {
    if (!this.fnTouched() && !this.formSubmitted()) return null;
    const v = this.flightNumber().trim();
    if (!v) return 'Flight number is required.';
    if (!this.fnPattern.test(v)) return 'Enter a valid number (e.g. ASP101).';
    return null;
  });

  readonly dateError = computed<string | null>(() => {
    if (!this.dateTouched() && !this.formSubmitted()) return null;
    if (!this.selectedDate()) return 'Please select a departure date.';
    return null;
  });

  readonly isFormValid = computed<boolean>(() =>
    !this.flightNumberError() && !this.dateError() &&
    !!this.flightNumber().trim() && !!this.selectedDate()
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    if (this.initialFlightNumber) this.flightNumber.set(this.initialFlightNumber);
    if (this.initialDate) this.selectedDate.set(this.initialDate);
  }

  // ── Field handlers ────────────────────────────────────────────────────────

  onFlightNumberInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    // Auto-uppercase as user types for a polished concierge feel
    this.flightNumber.set(val.toUpperCase());
  }

  onFlightNumberBlur(): void {
    this.fnTouched.set(true);
  }

  // ── Form submission ───────────────────────────────────────────────────────

  onSubmit(): void {
    this.formSubmitted.set(true);
    this.fnTouched.set(true);
    this.dateTouched.set(true);

    if (!this.isFormValid() || this.isSearching) return;

    // Convert local date string to full ISO for the API
    const isoDateTime = new Date(
      this.selectedDate()
    ).toISOString();

    this.formSubmit.emit({
      flightNumber: this.flightNumber().trim().toUpperCase(),
      flightDate: isoDateTime
    });
  }

  onClearSearch(): void {
    this.flightNumber.set('');
    this.selectedDate.set('');
    this.fnTouched.set(false);
    this.dateTouched.set(false);
    this.formSubmitted.set(false);
    this.clearSearch.emit();
  }

  // ── Calendar methods ──────────────────────────────────────────────────────

  toggleCalendar(): void { this.showCalendar.update(v => !v); }
  closeCalendar(): void { this.showCalendar.set(false); }

  prevMonth(): void {
    this.calendarMonth.update(d =>
      new Date(d.getFullYear(), d.getMonth() - 1, 1)
    );
  }

  nextMonth(): void {
    this.calendarMonth.update(d =>
      new Date(d.getFullYear(), d.getMonth() + 1, 1)
    );
  }

  selectDate(day: Date): void {
    if (this.isDateDisabled(day)) return;
    this.selectedDate.set(this.toIsoDate(day));
    this.dateTouched.set(true);
    this.showCalendar.set(false);
  }

  isDateSelected(day: Date): boolean {
    return this.toIsoDate(day) === this.selectedDate();
  }

  isToday(day: Date): boolean {
    return this.toIsoDate(day) === this.toIsoDate(new Date());
  }

  /**
   * Status searches are valid from 90 days in the past (historical lookup)
   * up to 365 days in the future (advance status check).
   */
  isDateDisabled(day: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() - 90);
    const maxDate = new Date(today);
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    return day < minDate || day > maxDate;
  }

  /** Human-readable date shown inside the date trigger button. */
  get formattedDateDisplay(): string {
    if (!this.selectedDate()) return '';
    const d = new Date(this.selectedDate() + 'T00:00:00');
    return d.toLocaleDateString('en-GB', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  private toIsoDate(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}