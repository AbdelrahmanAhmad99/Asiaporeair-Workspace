
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type FooterAction = 'discard' | 'delete' | 'save';

@Component({
  selector: 'aoms-action-footer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './action-footer.component.html',
  styleUrl: './action-footer.component.scss',
})
export class ActionFooterComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  /** True when editing an existing record — reveals the Delete Model button. */
  readonly isEditMode = input<boolean>(false);
  /** True while the API save call is in flight — disables all CTA buttons. */
  readonly isSaving = input<boolean>(false);
  /** True when the form has unsaved changes — enables Discard button. */
  readonly isDirty = input<boolean>(false);
  /** True when all required fields are valid — enables the primary CTA. */
  readonly isValid = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly actionTriggered = output<FooterAction>();
}