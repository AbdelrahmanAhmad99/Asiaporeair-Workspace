

import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { IAncillaryProduct } from '@shared-core';

// ── Form value contract — Pricing section ───────────────────────────────────
export interface IProductPricingFormValue {
  baseCost: number;
  /** UI-only — not persisted to the backend model. */
  taxPercentage: number;
  /** UI-only — not persisted to the backend model. */
  currency: string;
  unitOfMeasure: string;
}

// ── Currency options (UI-only — display purposes) ───────────────────────────
export const CURRENCY_OPTIONS = [
  { label: 'SGD — Singapore Dollar', value: 'SGD', symbol: 'S$' },
  { label: 'USD — US Dollar', value: 'USD', symbol: '$' },
  { label: 'EUR — Euro', value: 'EUR', symbol: '€' },
  { label: 'GBP — British Pound', value: 'GBP', symbol: '£' },
  { label: 'JPY — Japanese Yen', value: 'JPY', symbol: '¥' },
];

// ── Unit of Measure options ──────────────────────────────────────────────────
export const UNIT_OF_MEASURE_OPTIONS = [
  { label: 'Per Item', value: 'piece' },
  { label: 'Per Kilogram', value: 'kg' },
  { label: 'Per Segment', value: 'segment' },
  { label: 'Per Passenger', value: 'passenger' },
  { label: 'Per Day', value: 'day' },
];

@Component({
  selector: 'aoms-pricing-adjustment-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pricing-adjustment-group.component.html',
  styleUrl: './pricing-adjustment-group.component.scss',
})
export class PricingAdjustmentGroupComponent implements OnInit, OnChanges, OnDestroy {
  private readonly fb = inject(FormBuilder);

  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly initialProduct = input<IAncillaryProduct | null>(null);
  readonly isLoading = input<boolean>(false);
  readonly forceValidate = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly valueChanged = output<IProductPricingFormValue>();
  readonly validityChanged = output<boolean>();

  // ── Form ─────────────────────────────────────────────────────────────────
  protected form!: FormGroup;
  protected readonly currencies = CURRENCY_OPTIONS;
  protected readonly units = UNIT_OF_MEASURE_OPTIONS;
  protected readonly skeletonFields = [1, 2, 3];

  // ── Live form snapshot for computed Net Price ──────────────────────────
  private readonly _baseCost = signal<number>(0);
  private readonly _taxPct = signal<number>(0);
  private readonly _currency = signal<string>('SGD');

  // ── Computed Net Price ───────────────────────────────────────────────────
  /** Net Price = Base Cost + (Base Cost × Tax% / 100), live-updated. */
  readonly netPrice = computed<number>(() => {
    const base = this._baseCost() || 0;
    const tax = this._taxPct() || 0;
    return base + base * (tax / 100);
  });

  /** Tax amount portion only (for breakdown display). */
  readonly taxAmount = computed<number>(() => {
    const base = this._baseCost() || 0;
    const tax = this._taxPct() || 0;
    return base * (tax / 100);
  });

  /** Currency symbol for the selected currency. */
  readonly currencySymbol = computed<string>(() => {
    const found = CURRENCY_OPTIONS.find(c => c.value === this._currency());
    return found?.symbol ?? '$';
  });

  private readonly _destroy$ = new Subject<void>();

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this._buildForm();
    this._subscribeToChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialProduct'] && this.form) {
      const p = this.initialProduct();
      if (p) {
        this.form.patchValue({
          baseCost: p.baseCost,
          unitOfMeasure: p.unitOfMeasure || 'piece',
          // taxPercentage / currency are UI-only — default values retained
        }, { emitEvent: false });
        this._syncSignalsFromForm();
        this.valueChanged.emit(this.form.getRawValue() as IProductPricingFormValue);
        this.validityChanged.emit(this.form.valid);
      }
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // ── Validation helpers ─────────────────────────────────────────────────
  protected isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.forceValidate());
  }

  protected getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['min']) return `Minimum value is ${ctrl.errors['min'].min}.`;
    if (ctrl.errors['max']) return `Maximum value is ${ctrl.errors['max'].max}.`;
    return 'Invalid value.';
  }

  // ── Quick tax presets ──────────────────────────────────────────────────
  protected readonly taxPresets = [0, 7, 9, 15, 20];

  protected applyTaxPreset(value: number): void {
    this.form.get('taxPercentage')?.setValue(value);
  }

  // ── Private ────────────────────────────────────────────────────────────
  private _buildForm(): void {
    const p = this.initialProduct();
    this.form = this.fb.group({
      baseCost: [
        p?.baseCost ?? 0,
        [Validators.required, Validators.min(0), Validators.max(100000)],
      ],
      taxPercentage: [
        0,
        [Validators.min(0), Validators.max(100)],
      ],
      currency: ['SGD'],
      unitOfMeasure: [
        p?.unitOfMeasure ?? 'piece',
        [Validators.required],
      ],
    });

    this._syncSignalsFromForm();
  }

  private _subscribeToChanges(): void {
    this.form.valueChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this._syncSignalsFromForm();
        this.valueChanged.emit(this.form.getRawValue() as IProductPricingFormValue);
        this.validityChanged.emit(this.form.valid);
      });
  }

  private _syncSignalsFromForm(): void {
    const v = this.form.getRawValue();
    this._baseCost.set(Number(v.baseCost) || 0);
    this._taxPct.set(Number(v.taxPercentage) || 0);
    this._currency.set(v.currency || 'SGD');
  }
}