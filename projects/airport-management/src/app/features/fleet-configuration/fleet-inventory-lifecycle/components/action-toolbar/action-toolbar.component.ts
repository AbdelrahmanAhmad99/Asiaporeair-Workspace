
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToolbarAction = 'cancel' | 'decommission' | 'save';

@Component({
  selector: 'aoms-action-toolbar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './action-toolbar.component.html',
  styleUrl: './action-toolbar.component.scss',
})
export class ActionToolbarComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly isEditMode = input<boolean>(false);
  readonly isSubmitting = input<boolean>(false);
  readonly isFormValid = input<boolean>(false);
  readonly isDirty = input<boolean>(false);
  readonly tailNumber = input<string>('');

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly actionTriggered = output<ToolbarAction>();
}