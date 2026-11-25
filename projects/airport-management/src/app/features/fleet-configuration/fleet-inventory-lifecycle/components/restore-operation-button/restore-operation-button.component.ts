
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aoms-restore-operation-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './restore-operation-button.component.html',
  styleUrl: './restore-operation-button.component.scss',
})
export class RestoreOperationButtonComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly tailNumber = input.required<string>();
  readonly isReactivating = input<boolean>(false);
  readonly justRestored = input<boolean>(false);

  // ── Output ──────────────────────────────────────────────────────────────
  readonly restoreClicked = output<string>();
}