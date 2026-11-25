
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';

import {
  PAYMENT_STATUS_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from '../../store/financial-hub.store';
import { IPaymentFilter } from '@shared-core';

@Component({
  selector: 'aoms-payment-filter-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-filter-bar.component.html',
  styleUrl: './payment-filter-bar.component.scss',
})
export class PaymentFilterBarComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);

  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly filters = input<IPaymentFilter | null>(null);
  readonly loading = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  /** Emitted (debounced) whenever any field changes — live filter sync. */
  readonly filtersChanged = output<Partial<IPaymentFilter>>();
  /** Emitted when the operator clicks "Search". */
  readonly searchTriggered = output<void>();
  /** Emitted when the operator clicks "Reset". */
  readonly resetTriggered = output<void>();

  // ── Form ─────────────────────────────────────────────────────────────────
  protected form!: FormGroup;
  protected readonly statusOptions = PAYMENT_STATUS_OPTIONS;
  protected readonly methodOptions = PAYMENT_METHOD_OPTIONS;
  protected readonly methodLabels: Record<string, string> = {
    card: 'Card',
    paypal: 'PayPal',
    bank_transfer: 'Bank Transfer',
    apple_pay: 'Apple Pay',
    google_pay: 'Google Pay',
  };

  private readonly _destroy$ = new Subject<void>();

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    const f = this.filters();
    this.form = this.fb.group({
      bookingId: [f?.bookingId ?? null],
      minAmount: [f?.minAmount ?? null],
      maxAmount: [f?.maxAmount ?? null],
      startDate: [f?.startDate ?? null],
      endDate: [f?.endDate ?? null],
      status: [f?.status ?? ''],
      paymentMethod: [f?.paymentMethod ?? ''],
    });

    this.form.valueChanges
      .pipe(debounceTime(300), takeUntil(this._destroy$))
      .subscribe(value => {
        this.filtersChanged.emit(this._normalize(value));
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // ── Actions ─────────────────────────────────────────────────────────────
  protected onSearch(): void {
    this.filtersChanged.emit(this._normalize(this.form.getRawValue()));
    this.searchTriggered.emit();
  }

  protected onReset(): void {
    this.form.reset({
      bookingId: null,
      minAmount: null,
      maxAmount: null,
      startDate: null,
      endDate: null,
      status: '',
      paymentMethod: '',
    }, { emitEvent: false });
    this.resetTriggered.emit();
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  /** Converts empty strings to null and ensures numeric fields are numbers. */
  private _normalize(value: Record<string, unknown>): Partial<IPaymentFilter> {
    const norm = (v: unknown) => (v === '' || v === undefined ? null : v);
    return {
      bookingId: norm(value['bookingId']) as number | null,
      minAmount: norm(value['minAmount']) as number | null,
      maxAmount: norm(value['maxAmount']) as number | null,
      startDate: norm(value['startDate']) as string | null,
      endDate: norm(value['endDate']) as string | null,
      status: norm(value['status']) as string | null,
      paymentMethod: norm(value['paymentMethod']) as string | null,
    };
  }

  protected methodLabel(value: string): string {
    return this.methodLabels[value] ?? value;
  }
}