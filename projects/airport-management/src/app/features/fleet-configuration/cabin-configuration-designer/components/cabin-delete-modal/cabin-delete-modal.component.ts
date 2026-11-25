
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

type CabinDeleteState = 'confirm' | 'loading' | 'error';

@Component({
  selector: 'aoms-cabin-delete-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cabin-delete-modal.component.html',
  styleUrl: './cabin-delete-modal.component.scss',
})
export class CabinDeleteModalComponent {
  readonly isVisible = input<boolean>(false);
  readonly cabinName = input<string>('');
  readonly isProcessing = input<boolean>(false);
  readonly errorMessage = input<string | null>(null);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
  readonly errorDismissed = output<void>();

  readonly modalState = computed<CabinDeleteState>(() => {
    if (this.errorMessage()) return 'error';
    if (this.isProcessing()) return 'loading';
    return 'confirm';
  });
}