
import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { IAircraftTypeDto } from '@shared-core';
import { ICreateAircraftDto } from '@shared-core';
import { IAircraftDto } from '@shared-core';
import { AIRCRAFT_STATUS } from '../../store/fleet-inventory.store';

// ── Custom Validators ─────────────────────────────────────────────────────

/**
 * Validates ICAO-style tail number format.
 * Accepted patterns: 9V-XXX, VH-XXX, N12345, B-1234, G-ABCD, etc.
 * Rules: 2–8 chars, alphanumeric + optional single hyphen.
 */
function tailNumberValidator(ctrl: AbstractControl): ValidationErrors | null {
  const v: string = ctrl.value ?? '';
  if (!v) return null; // required handled separately
  const valid = /^[A-Z0-9]{1,3}(-[A-Z0-9]{1,5})?$/.test(v.toUpperCase());
  return valid ? null : { tailFormat: true };
}

// ── Status options ─────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: AIRCRAFT_STATUS.ACTIVE, label: 'Operational' },
  { value: AIRCRAFT_STATUS.MAINTENANCE, label: 'Under Maintenance' },
  { value: AIRCRAFT_STATUS.RESERVE, label: 'Reserve' },
];

@Component({
  selector: 'aoms-aircraft-base-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aircraft-base-form.component.html',
  styleUrl: './aircraft-base-form.component.scss',
})
export class AircraftBaseFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);

  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly availableTypes = input<IAircraftTypeDto[]>([]);
  readonly loadingTypes = input<boolean>(false);
  readonly isEditMode = input<boolean>(false);
  readonly initialValue = input<IAircraftDto | null>(null);
  readonly serverErrors = input<Record<string, string>>({});
  readonly isSubmitting = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly formChanged = output<Partial<ICreateAircraftDto>>();
  readonly validityChanged = output<boolean>();

  // ── Constants ─────────────────────────────────────────────────────────
  protected readonly statusOptions = STATUS_OPTIONS;

  // ── Reactive Form ─────────────────────────────────────────────────────
  protected form!: FormGroup;

  // ── Local UI State ────────────────────────────────────────────────────
  protected readonly activeSection = signal<'identity' | 'config' | 'acquisition'>('identity');

  protected readonly sectionValidity = computed(() => {
    if (!this.form) return { identity: false, config: false, acquisition: false };
    return {
      identity: this._isSectionValid(['tailNumber', 'airlineIataCode']),
      config: this._isSectionValid(['aircraftTypeId']),
      acquisition: this._isSectionValid(['status']),
    };
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    this._buildForm();
    this._subscribeToChanges();
    const init = this.initialValue();
    if (init) this._patchForm(init);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && this.form) {
      const v = this.initialValue();
      if (v) this._patchForm(v);
    }
    if (changes['serverErrors'] && this.form) {
      this._applyServerErrors(this.serverErrors());
    }
    if (changes['isSubmitting'] && this.form) {
      this.isSubmitting() ? this.form.disable() : this.form.enable();
    }
  }

  // ── Field helpers ──────────────────────────────────────────────────────
  protected field(name: string): AbstractControl { return this.form.get(name)!; }

  protected fieldError(name: string): string | null {
    const ctrl = this.form.get(name);
    if (!ctrl || !(ctrl.invalid && (ctrl.dirty || ctrl.touched))) return null;
    const e = ctrl.errors!;
    if (e['required']) return 'This field is required.';
    if (e['minlength']) return `Minimum ${e['minlength'].requiredLength} characters required.`;
    if (e['maxlength']) return `Maximum ${e['maxlength'].requiredLength} characters allowed.`;
    if (e['tailFormat']) return 'Invalid format. Use: 9V-SWA, N12345, VH-OEJ';
    if (e['pattern']) return 'Invalid format — please check the input.';
    if (e['server']) return e['server'];
    return 'Invalid value.';
  }

  protected isFieldValid(name: string): boolean {
    const c = this.form.get(name);
    return !!c?.valid && !!c.dirty;
  }

  protected isFieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c?.invalid && !!(c.dirty || c.touched);
  }

  // ── Section Navigation ─────────────────────────────────────────────────
  protected setSection(id: 'identity' | 'config' | 'acquisition'): void {
    this.activeSection.set(id);
  }

  // ── Private ───────────────────────────────────────────────────────────
  private _buildForm(): void {
    this.form = this.fb.group({
      // Identity
      tailNumber: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(8), tailNumberValidator]],
      airlineIataCode: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(3), Validators.pattern(/^[A-Z0-9]{2,3}$/)]],
      // Configuration
      aircraftTypeId: [null, Validators.required],
      // Acquisition
      acquisitionDate: [''],
      status: [AIRCRAFT_STATUS.ACTIVE, Validators.required],
    });
  }

  private _patchForm(v: IAircraftDto): void {
    this.form.patchValue({
      tailNumber: v.tailNumber,
      airlineIataCode: v.airlineIataCode,
      aircraftTypeId: v.aircraftTypeId,
      status: v.status,
      acquisitionDate: v.acquisitionDate
        ? new Date(v.acquisitionDate).toISOString().split('T')[0]
        : '',
    }, { emitEvent: false });

    // Lock tail number in edit mode
    if (this.isEditMode()) {
      this.form.get('tailNumber')?.disable();
    }
  }

  private _subscribeToChanges(): void {
    this.form.valueChanges.subscribe(() => {
      this.formChanged.emit(this.form.getRawValue() as Partial<ICreateAircraftDto>);
      this.validityChanged.emit(this.form.valid);
    });
  }

  private _applyServerErrors(errors: Record<string, string>): void {
    Object.entries(errors).forEach(([field, message]) => {
      const ctrl = this.form.get(field);
      if (ctrl) { ctrl.setErrors({ ...ctrl.errors, server: message }); ctrl.markAsTouched(); }
    });
  }

  private _isSectionValid(fields: string[]): boolean {
    return fields.every(f => {
      const c = this.form.get(f);
      return c ? (c.valid && c.dirty) : true;
    });
  }
}