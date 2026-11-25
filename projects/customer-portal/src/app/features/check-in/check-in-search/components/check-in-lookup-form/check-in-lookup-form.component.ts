// ============================================================================
// check-in-lookup-form.component.ts
// Asiaporeair | "Identify Your Journey" — Dumb Form Component
// Floating labels, gold focus, luxury validation UX
// ============================================================================

import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ICheckInLookupFormValue {
  bookingReference: string;
  lastName: string;
}

@Component({
  selector: 'app-check-in-lookup-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './check-in-lookup-form.component.html',
  styleUrls: ['./check-in-lookup-form.component.scss']
})
export class CheckInLookupFormComponent {
  @Input() isLoading: boolean = false;
  @Input() serverError: string | null = null;

  @Output() formSubmit = new EventEmitter<ICheckInLookupFormValue>();

  // ── Form state signals ──────────────────────────────────────────────────
  readonly pnr = signal<string>('');
  readonly lastName = signal<string>('');
  readonly pnrTouched = signal<boolean>(false);
  readonly lastNameTouched = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);

  // ── Validation ──────────────────────────────────────────────────────────
  readonly pnrError = computed(() => {
    if (!this.pnrTouched() && !this.submitted()) return null;
    const val = this.pnr().trim();
    if (!val) return 'Booking reference is required.';
    if (!/^[A-Za-z0-9]{6,10}$/.test(val))
      return 'Must be exactly 6 to 10 alphanumeric characters.';
    return null;
  });

  readonly lastNameError = computed(() => {
    if (!this.lastNameTouched() && !this.submitted()) return null;
    if (!this.lastName().trim()) return 'Last name is required.';
    return null;
  });

  readonly isFormValid = computed(() =>
    !this.pnrError() && !this.lastNameError() &&
    !!this.pnr().trim() && !!this.lastName().trim()
  );

  // ── Handlers ────────────────────────────────────────────────────────────

  onSubmit(): void {
    this.submitted.set(true);
    if (!this.isFormValid()) return;

    this.formSubmit.emit({
      bookingReference: this.pnr().trim().toUpperCase(),
      lastName: this.lastName().trim()
    });
  }

  onPnrInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.pnr.set(val.toUpperCase());
  }

  onLastNameInput(event: Event): void {
    this.lastName.set((event.target as HTMLInputElement).value);
  }
}