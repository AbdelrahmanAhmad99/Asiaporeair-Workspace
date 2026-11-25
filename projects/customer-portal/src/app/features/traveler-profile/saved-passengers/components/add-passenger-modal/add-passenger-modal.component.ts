// ============================================================================
// add-passenger-modal.component.ts
// Asiaporeair | Dumb Component — Add / Edit Passenger Modal
// ============================================================================

import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, Validators
} from '@angular/forms';
import { IPassengerDto, IUpdatePassengerDto } from '@shared-core';

export interface IPassengerFormValue {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber: string;
}

@Component({
  selector: 'app-add-passenger-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-passenger-modal.component.html',
  styleUrls: ['./add-passenger-modal.component.scss']
})
export class AddPassengerModalComponent implements OnChanges {

  /** Set to true to show the modal */
  @Input() isOpen: boolean = false;

  /** Pass a passenger object to switch to Edit mode */
  @Input() passenger: IPassengerDto | null = null;

  /** True while the save API call is in flight */
  @Input() isSaving: boolean = false;

  @Output() modalClose = new EventEmitter<void>();
  @Output() formSubmit = new EventEmitter<IPassengerFormValue>();

  readonly form: FormGroup;

  get isEditMode(): boolean { return !!this.passenger; }
  get modalTitle(): string { return this.isEditMode ? 'Edit Companion' : 'Add Travel Companion'; }
  get submitLabel(): string { return this.isEditMode ? 'Save Changes' : 'Add Companion'; }

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: [''],
      passportNumber: ['', [Validators.pattern(/^[A-Z0-9]{6,9}$/i)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['passenger'] || changes['isOpen']) {
      if (this.isOpen && this.passenger) {
        this.form.patchValue({
          firstName: this.passenger.firstName,
          lastName: this.passenger.lastName,
          dateOfBirth: this.passenger.dateOfBirth ?? '',
          passportNumber: this.passenger.passportNumber ?? ''
        });
      } else if (this.isOpen && !this.passenger) {
        this.form.reset();
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSaving) return;
    this.formSubmit.emit(this.form.value as IPassengerFormValue);
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }

  close(): void {
    if (!this.isSaving) {
      this.form.reset();
      this.modalClose.emit();
    }
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl?.hasError(error));
  }

  // Floating label helpers
  hasValue(field: string): boolean {
    return !!this.form.get(field)?.value;
  }
}