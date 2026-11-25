
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalState = 'confirm' | 'loading' | 'error';

@Component({
  selector: 'aoms-restore-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './restore-confirmation-modal.component.html',
  styleUrl: './restore-confirmation-modal.component.scss',
})
export class RestoreConfirmationModalComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly isVisible = input<boolean>(false);
  readonly tailNumber = input<string>('');
  readonly isProcessing = input<boolean>(false);
  readonly errorMessage = input<string | null>(null);
  readonly isConflict = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
  readonly errorDismissed = output<void>();

  // ── Computed state ────────────────────────────────────────────────────
  readonly modalState = computed<ModalState>(() => {
    if (this.errorMessage()) return 'error';
    if (this.isProcessing()) return 'loading';
    return 'confirm';
  });
}