

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  effect,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import { ICountryDto, ICreateCountryDto, IUpdateCountryDto } from '@shared-core';
import { StatusToggleSwitchComponent } from '../status-toggle-switch/status-toggle-switch.component';

// ── Form Payload ──────────────────────────────────────────────────────────
export interface ICountryFormPayload {
  isoCode: string;
  name: string;
  continent: string;
  currencyCode?: string;
  phoneCode?: string;
}

// ── Available Continents ──────────────────────────────────────────────────
export const CONTINENT_OPTIONS: string[] = [
  'Africa',
  'Antarctica',
  'Asia',
  'Europe',
  'North America',
  'Oceania',
  'South America',
];

// ── Custom Validator: uppercase letters only ──────────────────────────────
function uppercaseLettersOnly(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value ?? '';
  if (!val) return null; // let `required` handle empty
  return /^[A-Z]+$/.test(val) ? null : { uppercaseOnly: true };
}

// ── Custom Validator: digits only ────────────────────────────────────────
function digitsOnly(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value ?? '';
  if (!val) return null;
  return /^\d+$/.test(val) ? null : { digitsOnly: true };
}

@Component({
  selector: 'aoms-country-form-ui',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './country-form-ui.component.html',
  styleUrl: './country-form-ui.component.scss',
})
export class CountryFormUiComponent implements OnInit {
  // ── Signal Inputs ─────────────────────────────────────────────────────────
  /**
   * Pre-populated data for Edit mode.
   * null / undefined signals Create mode.
   */
  readonly initialData = input<ICountryDto | null | undefined>(null);

  /** Reflects the isSaving state from the Smart Component. Disables the Save button. */
  readonly isLoading = input<boolean>(false);

  /**
   * Set of ISO codes already present in the database.
   * Used by the duplicate-check validator in Create mode.
   */
  readonly existingIsoCodes = input<Set<string>>(new Set());

  /** Whether the form is in Edit mode (controls isoCode field lock). */
  readonly isEditMode = input<boolean>(false);

  // ── Outputs ───────────────────────────────────────────────────────────────
  readonly onSave = output<ICountryFormPayload>();
  readonly onCancel = output<void>();

  // ── Reactive Form ─────────────────────────────────────────────────────────
  protected readonly form: FormGroup;
  protected readonly continents = CONTINENT_OPTIONS;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      isoCode: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(3),
          uppercaseLettersOnly,
        ],
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      continent: ['', [Validators.required]],
      currencyCode: [
        '',
        [Validators.minLength(3), Validators.maxLength(3), uppercaseLettersOnly],
      ],
      phoneCode: [
        '',
        [Validators.minLength(1), Validators.maxLength(7), digitsOnly],
      ],
    });

    // ── Re-populate the form whenever initialData changes ──────────────────
    effect(() => {
      const data = this.initialData();
      if (data) {
        this.form.patchValue({
          isoCode: data.isoCode ?? '',
          name: data.name ?? '',
          continent: data.continent ?? '',
          currencyCode: data.currencyCode ?? '',
          phoneCode: data.phoneCode ?? '',
        });
      }
    });

    // ── In Edit mode, lock the isoCode field ─────────────────────────────
    effect(() => {
      if (this.isEditMode()) {
        this.form.get('isoCode')?.disable();
      } else {
        this.form.get('isoCode')?.enable();
      }
    });
  }

  ngOnInit(): void {
    // Auto-uppercase isoCode and currencyCode as the user types
    this._autoUppercase('isoCode');
    this._autoUppercase('currencyCode');
  }

  // ── Getters for template DRYness ──────────────────────────────────────────
  get isoCodeCtrl() { return this.form.get('isoCode')!; }
  get nameCtrl() { return this.form.get('name')!; }
  get continentCtrl() { return this.form.get('continent')!; }
  get currencyCtrl() { return this.form.get('currencyCode')!; }
  get phoneCtrl() { return this.form.get('phoneCode')!; }

  protected isFieldInvalid(controlName: string): boolean {
    const ctrl = this.form.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  protected isDuplicateIso(): boolean {
    if (this.isEditMode()) return false;
    const val = (this.isoCodeCtrl.value ?? '').toUpperCase();
    return val.length >= 2 && this.existingIsoCodes().has(val);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  protected submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.isDuplicateIso()) return;

    const raw = this.form.getRawValue(); // getRawValue includes disabled fields
    const payload: ICountryFormPayload = {
      isoCode: (raw.isoCode as string).toUpperCase().trim(),
      name: (raw.name as string).trim(),
      continent: raw.continent as string,
      currencyCode: (raw.currencyCode as string)?.toUpperCase().trim() || undefined,
      phoneCode: (raw.phoneCode as string)?.trim() || undefined,
    };

    this.onSave.emit(payload);
  }

  protected cancel(): void {
    this.onCancel.emit();
  }

  // ── Private helpers ───────────────────────────────────────────────────────
  private _autoUppercase(controlName: string): void {
    const ctrl = this.form.get(controlName);
    if (!ctrl) return;
    ctrl.valueChanges.subscribe((val: string) => {
      if (val && val !== val.toUpperCase()) {
        ctrl.setValue(val.toUpperCase(), { emitEvent: false });
      }
    });
  }
}