
import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-success-message-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './success-message-state.component.html',
  styleUrls: ['./success-message-state.component.scss'],
})
export class SuccessMessageStateComponent {
  /** The email address the recovery link was sent to. */
  @Input() email: string | null = null;
  /** Custom success message from the API. Falls back to default copy. */
  @Input() message: string | null = null;

  /** Emits when the user wants to try a different email. */
  @Output() retry = new EventEmitter<void>();
}