
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
import { Subject, takeUntil } from 'rxjs';

import { IContextualPricingAttributeDto } from '@shared-core';

// ── Form value contract shared with parent + visualizer ─────────────────────────────────────
export interface IRuleBuilderFormValue {
  timeUntilDeparture: number | null;
  lengthOfStay: number | null;
  competitorFares: string;
  willingnessToPay: number | null;
  attributeType?: string;
  targetValue?: string;
  modifierPercentage?: number | null;
  priority?: number | null;
}

// ── Attribute type catalogue (kept for future use) ──────────────────────────────
export const RULE_ATTRIBUTE_TYPES = [
  { label: 'Select attribute type…', value: '' },
  { label: 'Booking Class', value: 'BookingClass' },
  { label: 'KrisFlyer Tier', value: 'FrequentFlyerTier' },
  { label: 'Days to Departure', value: 'DaysToDeparture' },
  { label: 'Seasonality', value: 'Seasonality' },
  { label: 'Route', value: 'Route' },
  { label: 'Aircraft Type', value: 'AircraftType' },
];

@Component({
  selector: 'aoms-rule-builder-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rule-builder-form.component.html',
  styleUrl: './rule-builder-form.component.scss',
})
export class RuleBuilderFormComponent implements OnInit, OnChanges, OnDestroy {
  protected readonly Math = Math;
  private readonly fb = inject(FormBuilder);

  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly initialRule = input<IContextualPricingAttributeDto | null>(null);
  readonly isLoading = input<boolean>(false);
  readonly isSaving = input<boolean>(false);
  readonly isEditMode = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly valueChanged = output<IRuleBuilderFormValue>();
  readonly published = output<IRuleBuilderFormValue>();
  readonly cancelRequested = output<void>();

  // ── Form ─────────────────────────────────────────────────────────────────
  protected form!: FormGroup;
  protected readonly submitted = signal<boolean>(false);

  /** Which section is expanded (1 | 2). */
  protected readonly activeSection = signal<1 | 2>(1);

  // ── Option lists ──────────────────────────────────────────────────────────
  protected readonly attributeTypes = RULE_ATTRIBUTE_TYPES;

  // ── Skeleton ──────────────────────────────────────────────────────────────
  protected readonly skeletonFields = [1, 2, 3];

  private readonly _destroy$ = new Subject<void>();

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this._buildForm();
    this._subscribeToValueChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialRule'] && this.form) {
      const rule = this.initialRule();
      if (rule) {
        this.form.patchValue({
          timeUntilDeparture: rule.timeUntilDeparture ?? null,
          lengthOfStay: rule.lengthOfStay ?? null,
          competitorFares: rule.competitorFares ?? '',
          willingnessToPay: rule.willingnessToPay ?? null,
          attributeType: rule.attributeType ?? '',
          targetValue: rule.targetValue ?? '',
          modifierPercentage: rule.modifierPercentage ?? null,
          priority: rule.priority ?? null,
        });
        // Immediately feed the initial data to the visualizer
        this.valueChanged.emit(this.form.getRawValue() as IRuleBuilderFormValue);
      }
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  protected navigateTo(section: 1 | 2): void {
    this.activeSection.set(section);
  }

  // ── Submit (Publish) ───────────────────────────────────────────────────
  protected onPublish(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.isSaving()) return;
    this.published.emit(this.form.getRawValue() as IRuleBuilderFormValue);
  }

  protected onCancel(): void {
    this.cancelRequested.emit();
  }

  // ── Validation helpers ─────────────────────────────────────────────────
  protected isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.submitted());
  }

  protected getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['min']) return `Minimum value is ${ctrl.errors['min'].min}.`;
    if (ctrl.errors['max']) return `Maximum value is ${ctrl.errors['max'].max}.`;
    if (ctrl.errors['minlength']) return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    if (ctrl.errors['maxlength']) return `Maximum ${ctrl.errors['maxlength'].requiredLength} characters.`;
    return 'Invalid value.';
  }

  // ── Private ────────────────────────────────────────────────────────────
  private _buildForm(): void {
    const rule = this.initialRule();
    this.form = this.fb.group({
      timeUntilDeparture: [
        rule?.timeUntilDeparture ?? null,
        [Validators.min(0), Validators.max(365)],
      ],
      lengthOfStay: [
        rule?.lengthOfStay ?? null,
        [Validators.min(0), Validators.max(365)],
      ],
      competitorFares: [
        rule?.competitorFares ?? '',
        [Validators.maxLength(500)],
      ],
      willingnessToPay: [
        rule?.willingnessToPay ?? null,
        [Validators.min(0), Validators.max(999999)],
      ],
      attributeType: [
        rule?.attributeType ?? '',
        [Validators.required],
      ],
      targetValue: [
        rule?.targetValue ?? '',
        [Validators.required, Validators.maxLength(200)],
      ],
      modifierPercentage: [
        rule?.modifierPercentage ?? null,
        [Validators.required, Validators.min(-100), Validators.max(1000)],
      ],
      priority: [
        rule?.priority ?? null,
        [Validators.required, Validators.min(1), Validators.max(999)],
      ],
    });
  }

  private _subscribeToValueChanges(): void {
    this.form.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.valueChanged.emit(this.form.getRawValue() as IRuleBuilderFormValue);
      });
  }
}