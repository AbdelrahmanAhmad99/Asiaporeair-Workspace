

import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'aoms-void-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './void-confirmation-dialog.component.html',
  styleUrl: './void-confirmation-dialog.component.scss',
})
export class VoidConfirmationDialogComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly ticketCode = input.required<string>();
  readonly isProcessing = input<boolean>(false);
  readonly error = input<string | null>(null);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly confirmed = output<string>(); // emits reason string
  readonly cancelled = output<void>();

  // ── Local form state ───────────────────────────────────────────────────
  protected readonly reason = signal<string>('');

  // ── Computed ───────────────────────────────────────────────────────────
  readonly canConfirm = computed<boolean>(
    () => this.reason().trim().length >= 5 && !this.isProcessing()
  );

  readonly charCount = computed<number>(() => this.reason().trim().length);

  // ── Handlers ───────────────────────────────────────────────────────────
  protected onReasonInput(value: string): void {
    this.reason.set(value);
  }

  protected onConfirm(): void {
    if (!this.canConfirm()) return;
    this.confirmed.emit(this.reason().trim());
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }

  protected onBackdropClick(): void {
    if (!this.isProcessing()) this.cancelled.emit();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !this.isProcessing()) {
      this.cancelled.emit();
    }
  }
}