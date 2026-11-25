

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  effect,
  inject,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { IFormDraft, ValidationErrors } from '../../store/aircraft-types.store';

// ── Section definition ────────────────────────────────────────────────────
interface IFormSection {
  id: 'identity' | 'performance' | 'payload';
  title: string;
  sub: string;
  iconPath: string;
}

// ── Known manufacturer list for the datalist ─────────────────────────────
export const KNOWN_MANUFACTURERS = [
  'Airbus',
  'Boeing',
  'Embraer',
  'Bombardier',
  'ATR',
  'De Havilland Canada',
  'Comac',
  'Mitsubishi',
  'Sukhoi',
];

@Component({
  selector: 'aoms-aircraft-type-form-ui',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aircraft-type-form-ui.component.html',
  styleUrl: './aircraft-type-form-ui.component.scss',
})
export class AircraftTypeFormUiComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);

  // ── Inputs ──────────────────────────────────────────────────────────────
  /** Pre-populated values when in edit mode (seeded from the store). */
  readonly initialValue = input<IFormDraft | null>(null);
  /** Server-side validation errors keyed by field name. */
  readonly serverErrors = input<ValidationErrors>({});
  /** True when an API call is in-flight — disables all fields. */
  readonly isSaving = input<boolean>(false);
  /** Distinguishes between create and edit UI hints. */
  readonly isEditMode = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  /** Emits the current raw form value on every valid change. */
  readonly formChanged = output<Partial<IFormDraft>>();
  /** Emits `true` when the form becomes valid, `false` when it becomes invalid. */
  readonly validityChanged = output<boolean>();

  // ── Constants ─────────────────────────────────────────────────────────
  protected readonly knownManufacturers = KNOWN_MANUFACTURERS;

  // ── Section Definitions ──────────────────────────────────────────────
  protected readonly sections: IFormSection[] = [
    {
      id: 'identity',
      title: 'Primary Identity',
      sub: 'Manufacturer origin and aircraft model designation',
      iconPath: '2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21',
    },
    {
      id: 'performance',
      title: 'Performance Specifications',
      sub: 'Operational range and propulsion characteristics',
      iconPath: 'M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5',
    },
    {
      id: 'payload',
      title: 'Payload & Capacity',
      sub: 'Passenger configuration and cargo volume envelope',
      iconPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z',
    },
  ];

  // ── Reactive Form ────────────────────────────────────────────────────
  protected form!: FormGroup;

  // ── Local UI State ───────────────────────────────────────────────────
  protected readonly activeSection = signal<IFormSection['id']>('identity');

  /** Returns true when a section's fields are all valid AND at least one is dirty. */
  protected readonly sectionValid = computed(() => {
    if (!this.form) return {} as Record<IFormSection['id'], boolean>;
    return {
      identity: this._isSectionValid(['manufacturer', 'model']),
      performance: this._isSectionValid(['rangeKm', 'cruisingVelocity']),
      payload: this._isSectionValid(['maxSeats', 'cargoCapacity']),
    };
  });

  // ── Lifecycle ────────────────────────────────────────────────────────
  ngOnInit(): void {
    this._buildForm();
    this._subscribeToFormChanges();

    // Seed form when initial value arrives after ngOnInit (edit mode)
    const init = this.initialValue();
    if (init) this._patchForm(init);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-seed if parent pushes a new initialValue (e.g., data arrives async)
    if (changes['initialValue'] && this.form) {
      const val = this.initialValue();
      if (val) this._patchForm(val);
    }

    // Apply or clear server-side errors
    if (changes['serverErrors'] && this.form) {
      this._applyServerErrors(this.serverErrors());
    }

    // Disable / enable all controls based on isSaving
    if (changes['isSaving'] && this.form) {
      this.isSaving() ? this.form.disable() : this.form.enable();
    }
  }

  // ── Field Accessors ─────────────────────────────────────────────────
  protected field(name: string): AbstractControl {
    return this.form.get(name)!;
  }

  protected fieldError(name: string): string | null {
    const ctrl = this.form.get(name);
    if (!ctrl || !(ctrl.invalid && (ctrl.dirty || ctrl.touched))) return null;

    const e = ctrl.errors!;
    if (e['required']) return 'This field is required.';
    if (e['minlength']) return `Minimum ${e['minlength'].requiredLength} characters required.`;
    if (e['min']) return `Value must be at least ${e['min'].min}.`;
    if (e['max']) return `Value must be no more than ${e['max'].max}.`;
    if (e['server']) return e['server'];
    return 'Invalid value.';
  }

  protected isFieldValid(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!ctrl?.valid && !!ctrl?.dirty;
  }

  protected isFieldInvalid(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!ctrl?.invalid && !!(ctrl.dirty || ctrl.touched);
  }

  // ── Section navigation ───────────────────────────────────────────────
  protected setActiveSection(id: IFormSection['id']): void {
    this.activeSection.set(id);
  }

  // ── Private helpers ──────────────────────────────────────────────────
  private _buildForm(): void {
    this.form = this.fb.group({
      // Identity
      manufacturer: ['', [Validators.required, Validators.minLength(2)]],
      model: ['', [Validators.required, Validators.minLength(2)]],
      // Performance
      rangeKm: [null, [Validators.min(100), Validators.max(25000)]],
      cruisingVelocity: [null, [Validators.min(200), Validators.max(1200)]],
      // Payload
      maxSeats: [null, [Validators.min(1), Validators.max(1000)]],
      cargoCapacity: [null, [Validators.min(0), Validators.max(2000)]],
    });
  }

  private _patchForm(draft: IFormDraft): void {
    this.form.patchValue({
      manufacturer: draft.manufacturer,
      model: draft.model,
      rangeKm: draft.rangeKm,
      cruisingVelocity: draft.cruisingVelocity,
      maxSeats: draft.maxSeats,
      cargoCapacity: draft.cargoCapacity,
    }, { emitEvent: false });
  }

  private _subscribeToFormChanges(): void {
    this.form.valueChanges.subscribe(() => {
      this.formChanged.emit(this.form.getRawValue() as Partial<IFormDraft>);
      this.validityChanged.emit(this.form.valid);
    });
  }

  private _applyServerErrors(errors: ValidationErrors): void {
    Object.entries(errors).forEach(([field, message]) => {
      const ctrl = this.form.get(field);
      if (ctrl) {
        ctrl.setErrors({ ...ctrl.errors, server: message });
        ctrl.markAsTouched();
      }
    });
  }

  private _isSectionValid(fields: string[]): boolean {
    return fields.every(f => {
      const ctrl = this.form.get(f);
      return ctrl ? (ctrl.valid && ctrl.dirty) : true;
    });
  }
}