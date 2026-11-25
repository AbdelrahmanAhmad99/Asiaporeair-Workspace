
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aoms-restore-action-cell',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './restore-action-cell.component.html',
  styleUrl: './restore-action-cell.component.scss',
})
export class RestoreActionCellComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly typeId = input.required<number>();
  readonly isDeleted = input<boolean>(false);
  /** True while the parent is in the process of restoring THIS specific row. */
  readonly isRestoring = input<boolean>(false);

  // ── Output ──────────────────────────────────────────────────────────────
  /** Emits the typeId after the user confirms the restoration. */
  readonly confirmed = output<number>();

  // ── Local micro-confirmation state ────────────────────────────────────
  protected readonly pendingConfirm = signal<boolean>(false);

  protected onInitiateRestore(): void {
    this.pendingConfirm.set(true);
  }

  protected onConfirmRestore(): void {
    this.pendingConfirm.set(false);
    this.confirmed.emit(this.typeId());
  }

  protected onCancelRestore(): void {
    this.pendingConfirm.set(false);
  }
}