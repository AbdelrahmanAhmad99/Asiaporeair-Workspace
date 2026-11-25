import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aoms-deactivation-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deactivation-confirm-dialog.component.html',
  styleUrl: './deactivation-confirm-dialog.component.scss',
})
export class DeactivationConfirmDialogComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  /** The numeric ID of the rule pending deactivation. */
  readonly ruleId = input.required<number>();

  /**
   * Human-readable summary of the rule, e.g.:
   * "BookingClass → Economy (×+15%)"
   * Displayed in the modal body so the operator confirms they are acting
   * on the correct rule before committing.
   */
  readonly ruleSummary = input<string>('');

  /** True while the store is processing the deleteAttributeSet call. */
  readonly isProcessing = input<boolean>(false);

  /** Backend error message — displayed inside the modal if the action fails. */
  readonly error = input<string | null>(null);

  // ── Outputs ─────────────────────────────────────────────────────────────
  /** Emitted when the operator clicks "Deactivate Logic". */
  readonly confirmed = output<void>();

  /** Emitted when the operator clicks "Cancel" or the backdrop closes the modal. */
  readonly cancelled = output<void>();
}