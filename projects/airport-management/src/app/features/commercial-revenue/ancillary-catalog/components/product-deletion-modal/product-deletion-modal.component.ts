
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aoms-product-deletion-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-deletion-modal.component.html',
  styleUrl: './product-deletion-modal.component.scss',
})
export class ProductDeletionModalComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  /** Name of the product being deleted — displayed in the modal body. */
  readonly productName = input<string>('');

  /** True while the store is processing the deleteProduct call. */
  readonly isProcessing = input<boolean>(false);

  /** Backend error message — displayed inside the modal if the action fails. */
  readonly error = input<string | null>(null);

  // ── Outputs ─────────────────────────────────────────────────────────────
  /** Emitted when the operator clicks "Confirm Deletion". */
  readonly confirmed = output<void>();

  /** Emitted when the operator clicks "Cancel". */
  readonly cancelled = output<void>();
}