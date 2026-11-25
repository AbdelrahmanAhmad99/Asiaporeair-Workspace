

import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IAdjustmentFormData, AdjustmentType, LastAdjustmentStatus } from '../../store/loyalty-intelligence.store';

// ── Reason codes — regulatory / audit standard ─────────────────────────
export const ADJUSTMENT_REASON_CODES = [
  { code: 'GOODWILL', label: 'Goodwill Gesture' },
  { code: 'FLIGHT_DELAY', label: 'Flight Disruption Compensation' },
  { code: 'MISSING_MILES', label: 'Missing Miles Correction' },
  { code: 'SYSTEM_ERROR', label: 'System Error Rectification' },
  { code: 'TIER_UPGRADE', label: 'Tier Upgrade Bonus' },
  { code: 'PROMOTION', label: 'Promotional Award' },
  { code: 'PARTNER_CREDIT', label: 'Partner Miles Credit' },
  { code: 'FRAUD_DEDUCTION', label: 'Fraud / Policy Violation Deduction' },
  { code: 'EXPIRY_REVERSAL', label: 'Points Expiry Reversal' },
  { code: 'ADMIN_CORRECTION', label: 'Administrative Correction' },
] as const;

@Component({
  selector: 'aoms-manual-adjustment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './manual-adjustment-form.component.html',
  styleUrl: './manual-adjustment-form.component.scss',
})
export class ManualAdjustmentFormComponent implements OnChanges {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly currentBalance = input.required<number>();
  readonly isProcessing = input<boolean>(false);
  readonly lastStatus = input<LastAdjustmentStatus>('idle');

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly preview = output<{ type: AdjustmentType; amount: number }>();
  readonly submitted = output<IAdjustmentFormData>();
  readonly formReset = output<void>();

  // ── Form state ─────────────────────────────────────────────────────────
  protected readonly type = signal<AdjustmentType>('add');
  protected readonly amount = signal<number>(0);
  protected readonly reasonCode = signal<string>('');
  protected readonly comments = signal<string>('');

  /** Flag: did we just succeed? Used for subtle animation trigger. */
  protected showSuccess = false;

  protected readonly reasonCodes = ADJUSTMENT_REASON_CODES;

  // ── Computed ───────────────────────────────────────────────────────────
  readonly canSubmit = computed<boolean>(() =>
    this.amount() > 0 && !!this.reasonCode() && !this.isProcessing()
  );

  readonly typeLabel = computed<string>(
    () => this.type() === 'add' ? 'Credit' : 'Deduct'
  );

  // ── Sync: animate success flash when lastStatus goes to success ────────
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lastStatus']) {
      if (this.lastStatus() === 'success') {
        this.showSuccess = true;
        this._resetFormFields();
        setTimeout(() => { this.showSuccess = false; }, 1800);
      }
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────
  protected setType(type: AdjustmentType): void {
    this.type.set(type);
    this._emitPreview();
  }

  protected onAmountInput(val: string): void {
    const parsed = parseFloat(val);
    this.amount.set(isNaN(parsed) || parsed < 0 ? 0 : parsed);
    this._emitPreview();
  }

  protected onReasonCodeChange(val: string): void {
    this.reasonCode.set(val);
  }

  protected onCommentsInput(val: string): void {
    this.comments.set(val);
  }

  protected onSubmit(): void {
    if (!this.canSubmit()) return;
    this.submitted.emit({
      type: this.type(),
      amount: this.amount(),
      reasonCode: this.reasonCode(),
      comments: this.comments(),
    });
  }

  protected onReset(): void {
    this._resetFormFields();
    this.formReset.emit();
  }

  // ── Privates ───────────────────────────────────────────────────────────
  private _emitPreview(): void {
    this.preview.emit({ type: this.type(), amount: this.amount() });
  }

  private _resetFormFields(): void {
    this.type.set('add');
    this.amount.set(0);
    this.reasonCode.set('');
    this.comments.set('');
    this.preview.emit({ type: 'add', amount: 0 });
  }
}