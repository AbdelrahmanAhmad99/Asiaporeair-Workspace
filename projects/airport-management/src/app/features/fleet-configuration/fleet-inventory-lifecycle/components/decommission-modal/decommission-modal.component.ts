
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
  selector: 'aoms-decommission-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './decommission-modal.component.html',
  styleUrl: './decommission-modal.component.scss',
})
export class DecommissionModalComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly tailNumber = input.required<string>();
  readonly isVisible = input<boolean>(false);
  readonly isProcessing = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  // ── Local State ──────────────────────────────────────────────────────────
  protected readonly confirmInput = signal<string>('');

  protected readonly isConfirmValid = computed(() =>
    this.confirmInput().trim().toUpperCase() === this.tailNumber().trim().toUpperCase()
  );

  protected onConfirm(): void {
    if (!this.isConfirmValid() || this.isProcessing()) return;
    this.confirmed.emit();
    this.confirmInput.set('');
  }

  protected onCancel(): void {
    this.confirmInput.set('');
    this.cancelled.emit();
  }
}