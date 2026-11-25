
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aoms-delete-account-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './delete-account-modal.component.html',
  styleUrl: './delete-account-modal.component.scss',
})
export class DeleteAccountModalComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly accountName = input.required<string>();
  readonly cardNumber = input.required<string>();
  readonly isProcessing = input<boolean>(false);
  readonly error = input<string | null>(null);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (!this.isProcessing()) this.cancelled.emit();
  }

  protected onConfirm(): void {
    if (!this.isProcessing()) this.confirmed.emit();
  }

  protected onCancel(): void {
    if (!this.isProcessing()) this.cancelled.emit();
  }

  protected onBackdropClick(): void {
    if (!this.isProcessing()) this.cancelled.emit();
  }
}