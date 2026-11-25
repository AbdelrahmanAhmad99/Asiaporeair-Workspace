// passenger-edit-form.component.ts
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, OnInit, OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { inject } from '@angular/core';
import {
  trigger, transition, style, animate
} from '@angular/animations';

import { IPassengerEditDraft } from '../../../store/manage-booking.store';
import { IUpdatePassengerDto } from '@shared-core';

// Passport number: 6-9 uppercase alphanumeric chars
const PASSPORT_PATTERN = /^[A-Z0-9]{6,9}$/;

@Component({
  selector: 'app-passenger-edit-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-16px)' }),
        animate('360ms cubic-bezier(0.22,1,0.36,1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ],
  templateUrl: './passenger-edit-form.component.html',
  styleUrls: ['./passenger-edit-form.component.scss']
})
export class PassengerEditFormComponent implements OnInit, OnChanges {

  private readonly fb = inject(FormBuilder);

  @Input({ required: true }) draft!: IPassengerEditDraft;
  @Input() passengerIndex = 1;

  @Output() requestSave = new EventEmitter<{
    passengerId: number;
    dto: IUpdatePassengerDto;
  }>();

  form!: FormGroup;
  isExpanded = true;

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(): void {
    if (this.form) {
      this.patchForm();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      firstName: [this.draft.firstName, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: [this.draft.lastName, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      dateOfBirth: [this.toInputDate(this.draft.dateOfBirth), []],
      passportNumber: [this.draft.passportNumber, [Validators.pattern(PASSPORT_PATTERN), Validators.maxLength(9)]]
    });
  }

  private patchForm(): void {
    this.form.patchValue({
      firstName: this.draft.firstName,
      lastName: this.draft.lastName,
      dateOfBirth: this.toInputDate(this.draft.dateOfBirth),
      passportNumber: this.draft.passportNumber ?? ''
    }, { emitEvent: false });
  }

  private toInputDate(iso: string | Date | null): string {
    if (!iso) return '';
    try {
      return new Date(iso).toISOString().split('T')[0]; // YYYY-MM-DD
    } catch { return ''; }
  }

  /** Max selectable birth date — must be at least 1 day old. */
  get maxDob(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  /** Min selectable birth date — 120 years ago. */
  get minDob(): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 120);
    return d.toISOString().split('T')[0];
  }

  getError(field: string): string | null {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched || ctrl.valid) return null;
    const e = ctrl.errors;
    if (e?.['required']) return 'This field is required.';
    if (e?.['minlength']) return `Minimum ${e['minlength'].requiredLength} characters.`;
    if (e?.['maxlength']) return `Maximum ${e['maxlength'].requiredLength} characters.`;
    if (e?.['pattern']) return field === 'passportNumber'
      ? 'Passport must be 6–9 uppercase letters/numbers (e.g. A1234567).'
      : 'Invalid format.';
    return 'Invalid value.';
  }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl?.invalid);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const dto: IUpdatePassengerDto = {
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      dateOfBirth: v.dateOfBirth || null,
      passportNumber: v.passportNumber?.trim().toUpperCase() || null
    };
    this.requestSave.emit({ passengerId: this.draft.passengerId, dto });
  }

  onCancel(): void {
    this.patchForm();
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  toggleExpanded(): void { this.isExpanded = !this.isExpanded; }
}