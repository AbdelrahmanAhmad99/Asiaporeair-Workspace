
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aoms-account-status-indicator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account-status-indicator.component.html',
  styleUrl: './account-status-indicator.component.scss',
})
export class AccountStatusIndicatorComponent {
  readonly isActive = input.required<boolean>();
  readonly compact = input<boolean>(false);

  readonly theme = computed<'active' | 'inactive'>(
    () => this.isActive() ? 'active' : 'inactive'
  );

  readonly label = computed<string>(
    () => this.isActive() ? 'Active' : 'Inactive'
  );
}