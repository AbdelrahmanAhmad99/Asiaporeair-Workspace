
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aoms-fare-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fare-delete-confirm-dialog.component.html',
  styleUrl: './fare-delete-confirm-dialog.component.scss',
})
export class FareDeleteConfirmDialogComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly fareCode = input.required<string>();
  readonly fareDescription = input<string>('');
  readonly isProcessing = input<boolean>(false);
  readonly error = input<string | null>(null);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}