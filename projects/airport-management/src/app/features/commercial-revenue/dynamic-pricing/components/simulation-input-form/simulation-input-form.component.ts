
import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ISimulationContext } from '../../store/dynamic-pricing.store';

// ── Option maps ───────────────────────────────────────────────────────────
export const BOOKING_CLASSES = [
  { label: 'All Classes', value: '' },
  { label: 'Suites (A)', value: 'Suites' },
  { label: 'First Class (F)', value: 'First' },
  { label: 'Business (J)', value: 'Business' },
  { label: 'Premium Economy (W)', value: 'PremiumEconomy' },
  { label: 'Economy (Y)', value: 'Economy' },
];

export const LOYALTY_TIERS = [
  { label: 'No Tier / Guest', value: '' },
  { label: 'Classic', value: 'Classic' },
  { label: 'Silver', value: 'Silver' },
  { label: 'Gold', value: 'Gold' },
  { label: 'Elite', value: 'Elite' },
];

export const SEASONALITY_OPTIONS = [
  { label: 'Not Specified', value: '' },
  { label: 'Peak Season', value: 'Peak' },
  { label: 'Off-Peak', value: 'OffPeak' },
  { label: 'Shoulder Season', value: 'Shoulder' },
  { label: 'Holiday / Festival', value: 'Holiday' },
];

@Component({
  selector: 'aoms-simulation-input-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './simulation-input-form.component.html',
  styleUrl: './simulation-input-form.component.scss',
})
export class SimulationInputFormComponent implements OnInit, OnChanges, OnDestroy {
  private readonly fb = inject(FormBuilder);

  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly initialScenario = input<ISimulationContext | null>(null);
  readonly isSimulating = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly formSubmit = output<ISimulationContext>();
  readonly resetRequested = output<void>();

  // ── Form ─────────────────────────────────────────────────────────────────
  protected form!: FormGroup;
  protected readonly submitted = signal<boolean>(false);

  // ── Option lists ──────────────────────────────────────────────────────────
  protected readonly bookingClasses = BOOKING_CLASSES;
  protected readonly loyaltyTiers = LOYALTY_TIERS;
  protected readonly seasonalityOptions = SEASONALITY_OPTIONS;

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this._buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialScenario'] && this.form) {
      const s = this.initialScenario();
      if (s) {
        this.form.patchValue({
          origin: s.origin,
          destination: s.destination,
          travelDate: s.travelDate,
          bookingClass: s.bookingClass,
          frequentFlyerTier: s.frequentFlyerTier,
          daysToDeparture: s.daysToDeparture,
          seasonality: s.seasonality,
        }, { emitEvent: false });
      }
    }
  }

  ngOnDestroy(): void {
    // Component can safely destroy; state lives in the store.
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  protected onSubmit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.isSimulating()) return;

    const v = this.form.value;
    const context: ISimulationContext = {
      origin: v.origin?.trim().toUpperCase() || '',
      destination: v.destination?.trim().toUpperCase() || '',
      travelDate: v.travelDate || '',
      bookingClass: v.bookingClass || '',
      frequentFlyerTier: v.frequentFlyerTier || '',
      daysToDeparture: v.daysToDeparture != null ? Number(v.daysToDeparture) : null,
      seasonality: v.seasonality || '',
    };
    this.formSubmit.emit(context);
  }

  protected onReset(): void {
    this.form.reset({ bookingClass: '', frequentFlyerTier: '', seasonality: '' });
    this.submitted.set(false);
    this.resetRequested.emit();
  }

  // ── Validation helpers ─────────────────────────────────────────────────
  protected isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.submitted());
  }

  protected getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return 'Required.';
    if (ctrl.errors['minlength']) return `Min ${ctrl.errors['minlength'].requiredLength} chars.`;
    if (ctrl.errors['maxlength']) return `Max ${ctrl.errors['maxlength'].requiredLength} chars.`;
    if (ctrl.errors['min']) return `Minimum value: ${ctrl.errors['min'].min}.`;
    if (ctrl.errors['max']) return `Maximum value: ${ctrl.errors['max'].max}.`;
    if (ctrl.errors['pattern']) return 'Uppercase letters only (IATA code).';
    return 'Invalid value.';
  }

  // ── Private ────────────────────────────────────────────────────────────
  private _buildForm(): void {
    const scenario = this.initialScenario();
    this.form = this.fb.group({
      origin: [
        scenario?.origin ?? '',
        [Validators.minLength(3), Validators.maxLength(3), Validators.pattern(/^[A-Z]*$/)],
      ],
      destination: [
        scenario?.destination ?? '',
        [Validators.minLength(3), Validators.maxLength(3), Validators.pattern(/^[A-Z]*$/)],
      ],
      travelDate: [scenario?.travelDate ?? ''],
      bookingClass: [scenario?.bookingClass ?? ''],
      frequentFlyerTier: [scenario?.frequentFlyerTier ?? ''],
      daysToDeparture: [
        scenario?.daysToDeparture ?? null,
        [Validators.min(0), Validators.max(365)],
      ],
      seasonality: [scenario?.seasonality ?? ''],
    });
  }
}