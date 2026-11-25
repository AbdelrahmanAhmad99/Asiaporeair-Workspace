
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aoms-restore-action-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './restore-action-button.component.html',
  styleUrl: './restore-action-button.component.scss',
})
export class RestoreActionButtonComponent {
  // ── Signal Inputs ──────────────────────────────────────────────────────
  readonly iataCode = input.required<string>();
  readonly restoringCode = input<string | null>(null);
  readonly disabled = input<boolean>(false);

  // ── Output ─────────────────────────────────────────────────────────────
  readonly restore = output<string>();

  // ── Derived ────────────────────────────────────────────────────────────

  /** True only when THIS specific record's restore call is in-flight. */
  protected readonly isThisRestoring = computed<boolean>(
    () => this.restoringCode() === this.iataCode()
  );

  /** True when any restore is running (global disable). */
  protected readonly isAnyRestoring = computed<boolean>(
    () => this.restoringCode() !== null
  );

  // ── Action ─────────────────────────────────────────────────────────────

  protected onRestore(): void {
    if (this.disabled() || this.isAnyRestoring()) return;
    this.restore.emit(this.iataCode());
  }
}