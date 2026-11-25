
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aoms-fare-reactivation-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fare-reactivation-modal.component.html',
  styleUrl: './fare-reactivation-modal.component.scss',
})
export class FareReactivationModalComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly fareCode = input.required<string>();
  readonly fareDescription = input<string>('');
  readonly isProcessing = input<boolean>(false);
  readonly error = input<string | null>(null);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}