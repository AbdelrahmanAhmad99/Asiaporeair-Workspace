// ============================================================================
// personal-details-form.component.ts
// Asiaporeair | Dumb Component — Personal Details (Name, DOB, Passport)
// ============================================================================

import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, Validators
} from '@angular/forms';

export interface IPersonalDetailsFormValue {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  passportNumber: string;
  nationality: string;
}

@Component({
  selector: 'app-personal-details-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-details-form.component.html',
  styleUrls: ['./personal-details-form.component.scss']
})
export class PersonalDetailsFormComponent implements OnChanges {

  @Input() firstName: string = '';
  @Input() lastName: string = '';
  @Input() dateOfBirth: string = '';
  @Input() address: string = '';
  @Input() passportNumber: string = '';
  @Input() nationality: string = '';
  @Input() isSaving: boolean = false;
  @Input() saveState: 'idle' | 'saving' | 'success' | 'error' = 'idle';
  @Input() isLoading: boolean = false;

  @Output() formSave = new EventEmitter<IPersonalDetailsFormValue>();

  readonly isEditing = signal<boolean>(false);

  readonly form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: [''],
      address: [''],
      passportNumber: ['', [Validators.pattern(/^[A-Z0-9]{6,9}$/i)]],
      nationality: ['']
    });
    this.form.disable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['firstName'] || changes['lastName'] ||
      changes['dateOfBirth'] || changes['passportNumber'] || changes['nationality']) {
      this.form.patchValue({
        firstName: this.firstName,
        lastName: this.lastName,
        dateOfBirth: this.dateOfBirth,
        address: this.address,
        passportNumber: this.passportNumber,
        nationality: this.nationality
      }, { emitEvent: false });
    }
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      // Cancel — restore original values
      this.form.patchValue({
        firstName: this.firstName,
        lastName: this.lastName,
        dateOfBirth: this.dateOfBirth,
        address: this.address,
        passportNumber: this.passportNumber,
        nationality: this.nationality
      });
      this.form.disable();
      this.isEditing.set(false);
    } else {
      this.form.enable();
      this.isEditing.set(true);
    }
  }

  onSave(): void {
    if (this.form.invalid || !this.isEditing()) return;
    this.formSave.emit(this.form.value as IPersonalDetailsFormValue);
    this.form.disable();
    this.isEditing.set(false);
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl?.hasError(error));
  }
}