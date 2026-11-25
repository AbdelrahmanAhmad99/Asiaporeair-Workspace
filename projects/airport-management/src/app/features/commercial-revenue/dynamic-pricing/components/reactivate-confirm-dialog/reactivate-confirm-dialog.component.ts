import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aoms-reactivate-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reactivate-confirm-dialog.component.html',
  styleUrl: './reactivate-confirm-dialog.component.scss',
})
export class ReactivateConfirmDialogComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  /** Numeric ID of the rule being restored. */
  readonly ruleId = input.required<number>();

  /** Dynamic pricing fields */
  readonly timeUntilDeparture = input<number | null | undefined>(null);
  readonly lengthOfStay = input<number | null | undefined>(null);
  readonly competitorFares = input<string | null | undefined>(null);
  readonly willingnessToPay = input<number | null | undefined>(null);

  /** Legacy / optional fields */
  readonly ruleType = input<string>('');
  readonly ruleTarget = input<string>('');
  readonly modifierPercentage = input<number>(0);

  /** True while the store is processing reactivateAttributeSet. */
  readonly isProcessing = input<boolean>(false);

  /** Backend error message — displayed inside the modal on failure. */
  readonly error = input<string | null>(null);

  // ── Outputs ─────────────────────────────────────────────────────────────
  /** Emitted when the operator clicks "Confirm Restoration". */
  readonly confirmed = output<void>();

  /** Emitted when the operator clicks "Cancel" or the backdrop. */
  readonly cancelled = output<void>();

  // ── Template helpers ──────────────────────────────────────────────────
  protected get modifierLabel(): string {
    const pct = this.modifierPercentage();
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  }

  protected get modifierClass(): string {
    const pct = this.modifierPercentage();
    if (pct > 0) return 'rcd-impact--positive';
    if (pct < 0) return 'rcd-impact--negative';
    return 'rcd-impact--neutral';
  }
}