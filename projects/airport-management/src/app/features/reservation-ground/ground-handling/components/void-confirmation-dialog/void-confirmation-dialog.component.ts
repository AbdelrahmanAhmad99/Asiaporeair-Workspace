
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aoms-void-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './void-confirmation-dialog.component.html',
  styleUrl: './void-confirmation-dialog.component.scss',
})
export class VoidConfirmationDialogComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly passId = input.required<number>();
  readonly passengerName = input.required<string>();
  readonly ticketCode = input.required<string>();
  readonly seatNumber = input.required<string>();
  readonly isProcessing = input<boolean>(false);
  readonly error = input<string | null>(null);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  // ── Escape key listener ────────────────────────────────────────────────
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (!this.isProcessing()) {
      this.cancelled.emit();
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────
  protected onConfirm(): void {
    if (this.isProcessing()) return;
    this.confirmed.emit();
  }

  protected onCancel(): void {
    if (this.isProcessing()) return;
    this.cancelled.emit();
  }

  protected onBackdropClick(): void {
    if (!this.isProcessing()) this.cancelled.emit();
  }
}