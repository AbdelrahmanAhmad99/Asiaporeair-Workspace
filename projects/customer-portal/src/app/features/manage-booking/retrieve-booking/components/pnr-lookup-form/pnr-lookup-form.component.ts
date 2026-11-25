// pnr-lookup-form.component.ts
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, OnInit, OnChanges, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

// Booking reference: 6–9 uppercase alphanumeric characters
const REF_PATTERN = /^[A-Z0-9]{6,9}$/;

@Component({
  selector: 'app-pnr-lookup-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  animations: [
    trigger('fieldSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms cubic-bezier(0.22,1,0.36,1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  templateUrl: './pnr-lookup-form.component.html',
  styleUrls: ['./pnr-lookup-form.component.scss']
})
export class PnrLookupFormComponent implements OnInit, OnChanges {

  private readonly fb = inject(FormBuilder);

  @Input() isLoading = false;
  @Input() prefillRef = '';

  @Output() search = new EventEmitter<{ bookingReference: string; lastName: string }>();

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      bookingReference: [
        this.prefillRef ?? '',
        [Validators.required, Validators.pattern(REF_PATTERN)]
      ],
      lastName: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(60)]
      ]
    });
  }

  ngOnChanges(): void {
    if (this.form && this.prefillRef) {
      this.form.get('bookingReference')?.setValue(
        this.prefillRef, { emitEvent: false }
      );
    }
  }

  // ── Formatting helpers ────────────────────────────────────────────────────

  onRefInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    const val = el.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
    el.value = val;
    this.form.get('bookingReference')?.setValue(val, { emitEvent: true });
  }

  onLastNameInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    // Allow letters, hyphens, spaces, apostrophes
    const val = el.value.replace(/[^a-zA-Z\s\-']/g, '').slice(0, 60);
    el.value = val;
    this.form.get('lastName')?.setValue(val, { emitEvent: true });
  }

  // ── Error helpers ─────────────────────────────────────────────────────────

  getError(field: string): string | null {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched || ctrl.valid) return null;
    const e = ctrl.errors;
    if (e?.['required']) return 'This field is required.';
    if (e?.['pattern']) return field === 'bookingReference'
      ? 'Enter 6–9 uppercase alphanumeric characters (e.g. ABCD12 or D40584A4).'
      : 'Invalid format.';
    if (e?.['minlength']) return `Minimum ${e['minlength'].requiredLength} characters.`;
    if (e?.['maxlength']) return `Maximum ${e['maxlength'].requiredLength} characters.`;
    return 'Invalid value.';
  }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl?.invalid);
  }

  isFilled(field: string): boolean {
    return !!(this.form.get(field)?.value);
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid || this.isLoading) {
      this.form.markAllAsTouched();
      return;
    }
    const { bookingReference, lastName } = this.form.value;
    this.search.emit({
      bookingReference: bookingReference.trim().toUpperCase(),
      lastName: lastName.trim()
    });
  }
}