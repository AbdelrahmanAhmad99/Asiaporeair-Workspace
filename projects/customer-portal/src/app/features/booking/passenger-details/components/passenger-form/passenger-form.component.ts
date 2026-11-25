// ============================================================================
// passenger-form.component.ts
// Asiaporeair | "Traveller Profiles" — Single Passenger Dumb Form
// ============================================================================

import {
  Component, OnInit, OnDestroy, OnChanges, SimpleChanges,
  inject, input, output, signal, computed, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// ── Output Model ──────────────────────────────────────────────────────────────
export interface IPassengerFormValue {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  loyaltyProgram: string;
  loyaltyNumber: string;
  // Contact (primary passenger only)
  email?: string;
  phone?: string;
  countryCode?: string;
  notificationsVia?: 'sms' | 'whatsapp';
}

// ── Country Codes Data ────────────────────────────────────────────────────────
export const COUNTRY_CODES = [
  { code: '+65', label: 'Singapore (+65)', flag: '🇸🇬' },
  { code: '+1', label: 'United States (+1)', flag: '🇺🇸' },
  { code: '+44', label: 'United Kingdom (+44)', flag: '🇬🇧' },
  { code: '+61', label: 'Australia (+61)', flag: '🇦🇺' },
  { code: '+81', label: 'Japan (+81)', flag: '🇯🇵' },
  { code: '+86', label: 'China (+86)', flag: '🇨🇳' },
  { code: '+91', label: 'India (+91)', flag: '🇮🇳' },
  { code: '+20', label: 'Egypt (+20)', flag: '🇪🇬' },
  { code: '+971', label: 'UAE (+971)', flag: '🇦🇪' },
  { code: '+49', label: 'Germany (+49)', flag: '🇩🇪' },
  { code: '+33', label: 'France (+33)', flag: '🇫🇷' },
  { code: '+39', label: 'Italy (+39)', flag: '🇮🇹' },
  { code: '+34', label: 'Spain (+34)', flag: '🇪🇸' },
  { code: '+60', label: 'Malaysia (+60)', flag: '🇲🇾' },
  { code: '+66', label: 'Thailand (+66)', flag: '🇹🇭' },
  { code: '+82', label: 'South Korea (+82)', flag: '🇰🇷' },
  { code: '+62', label: 'Indonesia (+62)', flag: '🇮🇩' },
];

export const NATIONALITIES = [
  'Singaporean', 'American', 'British', 'Australian', 'Japanese',
  'Chinese', 'Indian', 'Egyptian', 'Emirati', 'German', 'French',
  'Italian', 'Spanish', 'Malaysian', 'Thai', 'South Korean', 'Indonesian',
  'Canadian', 'Brazilian', 'South African', 'Dutch', 'Swedish', 'Norwegian',
  'Swiss', 'Austrian', 'Belgian', 'Portuguese', 'Greek', 'Turkish',
  'Saudi Arabian', 'Qatari', 'Kuwaiti', 'Bahraini', 'Jordanian',
  'Filipino', 'Vietnamese', 'Cambodian', 'Myanmar', 'Sri Lankan',
  'Pakistani', 'Bangladeshi', 'Nepalese', 'New Zealander',
];

export const LOYALTY_PROGRAMS = [
  { value: '', label: 'Select a programme' },
  { value: 'ASIAPOREAIR_PRESTIGE', label: 'Asiaporeair Prestige' },
  { value: 'KRISFLYER', label: 'KrisFlyer (Singapore Airlines)' },
  { value: 'FFYOU', label: 'FlyingBlue (Air France/KLM)' },
  { value: 'AVIOS', label: 'Avios (British Airways)' },
  { value: 'MILEAGE_PLUS', label: 'MileagePlus (United)' },
  { value: 'AADVANTAGE', label: 'AAdvantage (American Airlines)' },
  { value: 'SKYWARDS', label: 'Skywards (Emirates)' },
  { value: 'ENRICH', label: 'Enrich (Malaysia Airlines)' },
];

// ── Custom Validators ─────────────────────────────────────────────────────────

function passportNumberValidator(control: AbstractControl) {
  if (!control.value) return null;
  // Generic: 6-12 alphanumeric chars
  const pattern = /^[A-Z0-9]{6,12}$/i;
  return pattern.test(control.value) ? null : { invalidPassport: true };
}

function passportExpiryValidator(control: AbstractControl) {
  if (!control.value) return null;
  const expiryDate = new Date(control.value);
  const sixMonthsAhead = new Date();
  sixMonthsAhead.setMonth(sixMonthsAhead.getMonth() + 6);
  return expiryDate >= sixMonthsAhead ? null : { passportExpired: true };
}

function futureDateValidator(control: AbstractControl) {
  if (!control.value) return null;
  const date = new Date(control.value);
  const today = new Date();
  return date < today ? null : { futureDate: true };
}

@Component({
  selector: 'app-passenger-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './passenger-form.component.html',
  styleUrls: ['./passenger-form.component.scss']
})
export class PassengerFormComponent implements OnInit, OnDestroy, OnChanges {

  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly passengerIndex = input.required<number>();
  readonly passengerType = input.required<'adult' | 'child' | 'infant'>();
  readonly submitAttempted = input<boolean>(false);

  // ── Outputs ───────────────────────────────────────────────────────────────
  readonly formValueChange = output<IPassengerFormValue | null>();
  readonly validityChange = output<boolean>();

  // ── DI ────────────────────────────────────────────────────────────────────
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  // ── Data ──────────────────────────────────────────────────────────────────
  readonly countryCodes = COUNTRY_CODES;
  readonly nationalities = NATIONALITIES;
  readonly loyaltyPrograms = LOYALTY_PROGRAMS;

  // ── UI State ──────────────────────────────────────────────────────────────
  readonly showLoyaltyNumber = signal(false);
  readonly showPassportTips = signal(false);
  readonly activeField = signal<string | null>(null);

  // ── Form ──────────────────────────────────────────────────────────────────
  passengerForm!: FormGroup;

  // ── Computed ──────────────────────────────────────────────────────────────
  get isPrimary(): boolean {
    return this.passengerIndex() === 0;
  }

  get isAdult(): boolean {
    return this.passengerType() === 'adult';
  }

  get isInfant(): boolean {
    return this.passengerType() === 'infant';
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.buildForm();
    this.subscribeToFormChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['submitAttempted'] && changes['submitAttempted'].currentValue) {
      this.passengerForm?.markAllAsTouched();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Form Builder ──────────────────────────────────────────────────────────
  private buildForm(): void {
    const baseControls = {
      title: [this.isInfant ? '' : '', this.isAdult ? [Validators.required] : []],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60), Validators.pattern(/^[A-Za-z\s\-']+$/)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60), Validators.pattern(/^[A-Za-z\s\-']+$/)]],
      dateOfBirth: ['', [Validators.required, futureDateValidator]],
      nationality: ['', [Validators.required]],
      passportNumber: ['', [Validators.required, passportNumberValidator]],
      passportExpiry: ['', [Validators.required, passportExpiryValidator]],
      loyaltyProgram: [''],
      loyaltyNumber: [''],
    };

    const contactControls = this.isPrimary ? {
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{6,15}$/)]],
      countryCode: ['+65', [Validators.required]],
      notificationsVia: ['sms'],
    } : {};

    this.passengerForm = this.fb.group({ ...baseControls, ...contactControls });
  }

  private subscribeToFormChanges(): void {
    this.passengerForm.valueChanges
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.validityChange.emit(this.passengerForm.valid);
        if (this.passengerForm.valid) {
          this.formValueChange.emit(this.passengerForm.value as IPassengerFormValue);
        } else {
          this.formValueChange.emit(null);
        }
      });

    // Watch loyalty program selection
    this.passengerForm.get('loyaltyProgram')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(val => {
        this.showLoyaltyNumber.set(!!val);
        if (!val) {
          this.passengerForm.get('loyaltyNumber')?.setValue('', { emitEvent: false });
        }
      });
  }

  // ── Public Handlers ───────────────────────────────────────────────────────

  onFieldFocus(fieldName: string): void {
    this.activeField.set(fieldName);
  }

  onFieldBlur(): void {
    this.activeField.set(null);
  }

  togglePassportTips(): void {
    this.showPassportTips.update(v => !v);
  }

  // ── Template Helpers ──────────────────────────────────────────────────────

  isFieldInvalid(fieldName: string): boolean {
    const control = this.passengerForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched || this.submitAttempted()));
  }

  isFieldActive(fieldName: string): boolean {
    return this.activeField() === fieldName;
  }

  hasValue(fieldName: string): boolean {
    const val = this.passengerForm.get(fieldName)?.value;
    return val !== null && val !== undefined && val !== '';
  }

  getError(fieldName: string): string | null {
    const control = this.passengerForm.get(fieldName);
    if (!control || !control.errors) return null;

    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters required`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters allowed`;
    if (errors['pattern'] && fieldName === 'firstName') return 'Only letters, spaces, hyphens, and apostrophes allowed';
    if (errors['pattern'] && fieldName === 'lastName') return 'Only letters, spaces, hyphens, and apostrophes allowed';
    if (errors['pattern'] && fieldName === 'phone') return 'Please enter a valid phone number (digits only)';
    if (errors['invalidPassport']) return 'Passport number must be 6–12 alphanumeric characters';
    if (errors['passportExpired']) return 'Passport must be valid for at least 6 months from travel date';
    if (errors['futureDate']) return 'Date of birth cannot be in the future';

    return 'Invalid value';
  }

  getMaxDob(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  getMinPassportExpiry(): string {
    const sixMonthsAhead = new Date();
    sixMonthsAhead.setMonth(sixMonthsAhead.getMonth() + 6);
    return sixMonthsAhead.toISOString().split('T')[0];
  }
}