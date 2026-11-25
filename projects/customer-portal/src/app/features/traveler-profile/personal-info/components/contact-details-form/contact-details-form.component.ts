// ============================================================================
// contact-details-form.component.ts
// Asiaporeair | Dumb Component — Contact Details (Email + Phone)
// ============================================================================

import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, Validators
} from '@angular/forms';

export interface IContactDetailsFormValue {
  phoneNumber: string;
  phoneCountryCode: string;
}

// Country code lookup (representative subset)
export interface ICountryCode {
  code: string;
  dial: string;
  flag: string;
}

@Component({
  selector: 'app-contact-details-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-details-form.component.html',
  styleUrls: ['./contact-details-form.component.scss']
})
export class ContactDetailsFormComponent implements OnChanges {

  @Input() email: string = '';
  @Input() phoneNumber: string = '';
  @Input() isEmailVerified: boolean = true;
  @Input() isSaving: boolean = false;
  @Input() saveState: 'idle' | 'saving' | 'success' | 'error' = 'idle';
  @Input() isLoading: boolean = false;

  @Output() formSave = new EventEmitter<IContactDetailsFormValue>();

  readonly isEditing = signal<boolean>(false);
  readonly isCountryDropdownOpen = signal<boolean>(false);
  readonly selectedCountry = signal<ICountryCode>({ code: 'SG', dial: '+65', flag: '🇸🇬' });

  readonly form: FormGroup;

  readonly countryCodes: ICountryCode[] = [
    { code: 'SG', dial: '+65', flag: '🇸🇬' },
    { code: 'US', dial: '+1', flag: '🇺🇸' },
    { code: 'GB', dial: '+44', flag: '🇬🇧' },
    { code: 'AU', dial: '+61', flag: '🇦🇺' },
    { code: 'JP', dial: '+81', flag: '🇯🇵' },
    { code: 'AE', dial: '+971', flag: '🇦🇪' },
    { code: 'IN', dial: '+91', flag: '🇮🇳' },
    { code: 'CN', dial: '+86', flag: '🇨🇳' },
    { code: 'DE', dial: '+49', flag: '🇩🇪' },
    { code: 'FR', dial: '+33', flag: '🇫🇷' },
    { code: 'CA', dial: '+1', flag: '🇨🇦' },
    { code: 'MY', dial: '+60', flag: '🇲🇾' },
    { code: 'EG', dial: '+20', flag: '🇪🇬' },
    { code: 'SA', dial: '+966', flag: '🇸🇦' },
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      phoneNumber: ['', [Validators.pattern(/^[0-9\s\-().]{6,15}$/)]]
    });
    this.form.disable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['phoneNumber']) {
      // Try to extract dial code from number
      const raw = this.phoneNumber ?? '';
      const match = this.countryCodes.find(c => raw.startsWith(c.dial));
      if (match) {
        this.selectedCountry.set(match);
        this.form.patchValue({ phoneNumber: raw.replace(match.dial, '').trim() }, { emitEvent: false });
      } else {
        this.form.patchValue({ phoneNumber: raw }, { emitEvent: false });
      }
    }
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      // Cancel
      this.form.patchValue({ phoneNumber: this.phoneNumber });
      this.form.disable();
      this.isEditing.set(false);
    } else {
      this.form.enable();
      this.isEditing.set(true);
    }
  }

  selectCountry(country: ICountryCode): void {
    this.selectedCountry.set(country);
    this.isCountryDropdownOpen.set(false);
  }

  onSave(): void {
    if (this.form.invalid || !this.isEditing()) return;
    this.formSave.emit({
      phoneNumber: `${this.selectedCountry().dial} ${this.form.value.phoneNumber}`,
      phoneCountryCode: this.selectedCountry().code
    });
    this.form.disable();
    this.isEditing.set(false);
    this.isCountryDropdownOpen.set(false);
  }

  closeDropdown(): void {
    this.isCountryDropdownOpen.set(false);
  }
}