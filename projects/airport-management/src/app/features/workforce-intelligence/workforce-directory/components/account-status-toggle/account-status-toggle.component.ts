

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aoms-account-status-toggle',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-status-toggle.component.html',
  styleUrl: './account-status-toggle.component.scss',
})
export class AccountStatusToggleComponent {
  readonly isActive = input.required<boolean>();
  readonly employeeName = input<string>('');
  readonly isProcessing = input<boolean>(false);

  readonly deactivateConfirmed = output<void>();
  readonly reactivateConfirmed = output<void>();

  protected readonly showModal = signal<boolean>(false);

  protected readonly statusLabel = computed(() =>
    this.isActive() ? 'Account Active' : 'Account Inactive'
  );

  protected onDeactivateClick(): void {
    this.showModal.set(true);
  }

  protected onModalConfirm(): void {
    this.showModal.set(false);
    this.deactivateConfirmed.emit();
  }

  protected onModalCancel(): void {
    this.showModal.set(false);
  }

  protected onReactivate(): void {
    this.reactivateConfirmed.emit();
  }
}