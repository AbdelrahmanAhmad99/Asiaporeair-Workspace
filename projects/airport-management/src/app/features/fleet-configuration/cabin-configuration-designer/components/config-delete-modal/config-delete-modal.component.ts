
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type DeleteModalState = 'confirm' | 'loading' | 'error';

@Component({
  selector: 'aoms-config-delete-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './config-delete-modal.component.html',
  styleUrl: './config-delete-modal.component.scss',
})
export class ConfigDeleteModalComponent {
  readonly isVisible = input<boolean>(false);
  readonly configName = input<string>('');
  readonly isProcessing = input<boolean>(false);
  readonly errorMessage = input<string | null>(null);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
  readonly errorDismissed = output<void>();

  readonly modalState = computed<DeleteModalState>(() => {
    if (this.errorMessage()) return 'error';
    if (this.isProcessing()) return 'loading';
    return 'confirm';
  });
}