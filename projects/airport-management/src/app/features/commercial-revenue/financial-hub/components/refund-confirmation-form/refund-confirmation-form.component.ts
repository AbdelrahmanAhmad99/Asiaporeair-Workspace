

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

import { IRefundRequest } from '@shared-core';

export const REFUND_REASON_OPTIONS: { label: string; value: string }[] = [
  { value: 'Flight cancellation by airline', label: 'Flight Cancellation — Airline Initiated' },
  { value: 'Schedule change — passenger declined', label: 'Schedule Change — Passenger Declined' },
  { value: 'Duplicate payment', label: 'Duplicate Payment' },
  { value: 'Service not delivered', label: 'Service Not Delivered' },
  { value: 'Customer complaint — goodwill', label: 'Customer Complaint — Goodwill Refund' },
  { value: 'Medical / compassionate grounds', label: 'Medical / Compassionate Grounds' },
  { value: 'Regulatory requirement', label: 'Regulatory / Legal Requirement' },
  { value: 'Other', label: 'Other (provide details in notes)' },
];

export interface IRefundFormValue {
  reason: string;
  amount: number;
}

@Component({
  selector: 'aoms-refund-confirmation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './refund-confirmation-form.component.html',
  styleUrl: './refund-confirmation-form.component.scss',
})
export class RefundConfirmationFormComponent implements OnInit, OnChanges, OnDestroy {
  private readonly fb = inject(FormBuilder);

  readonly maxAmount = input.required<number>();
  readonly paymentId = input.required<number>();
  readonly currency = input<string>('SGD');
  readonly isProcessing = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly confirmed = output<IRefundRequest>();
  readonly validityChanged = output<boolean>();

  protected form!: FormGroup;
  protected readonly reasons = REFUND_REASON_OPTIONS;

  protected readonly awaitingDoubleConfirm = signal<boolean>(false);
  protected readonly processingKey = signal<number>(0);

  private readonly _destroy$ = new Subject<void>();

  protected readonly maxAmountLabel = computed<string>(() => {
    try {
      return new Intl.NumberFormat('en-SG', {
        style: 'currency',
        currency: (this.currency() || 'SGD').toUpperCase(),
        minimumFractionDigits: 2,
      }).format(this.maxAmount());
    } catch {
      return `${this.currency()} ${this.maxAmount().toFixed(2)}`;
    }
  });

  ngOnInit(): void {
    this.form = this.fb.group({
      reason: ['', [Validators.required]],
      amount: [
        this.maxAmount(),
        [Validators.required, Validators.min(0.01), Validators.max(this.maxAmount())],
      ],
    });

    this.form.statusChanges
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this.validityChanged.emit(this.form.valid));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['maxAmount'] && this.form) {
      const ctrl = this.form.get('amount');
      ctrl?.setValidators([Validators.required, Validators.min(0.01), Validators.max(this.maxAmount())]);
      ctrl?.updateValueAndValidity();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  protected isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }

  protected getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['min']) return 'Refund amount must be greater than zero.';
    if (ctrl.errors['max']) return `Amount exceeds the original payment (max ${this.maxAmountLabel()}).`;
    return 'Invalid value.';
  }

  protected onFirstSubmit(): void {
    if (this.form.invalid || this.disabled() || this.isProcessing()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.awaitingDoubleConfirm.set(true);
  }

  protected onConfirmRefund(): void {
    if (this.form.invalid) return;
    const { reason, amount } = this.form.getRawValue() as IRefundFormValue;
    this.processingKey.update(k => k + 1);
    this.confirmed.emit({ paymentId: this.paymentId(), reason, amount } as unknown as IRefundRequest);
  }

  protected onCancelDoubleConfirm(): void {
    this.awaitingDoubleConfirm.set(false);
  }

  protected onSetFullAmount(): void {
    this.form.get('amount')?.setValue(this.maxAmount());
  }
}