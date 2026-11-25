
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aoms-config-empty-state',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './config-empty-state.component.html',
  styleUrl: './config-empty-state.component.scss',
})
export class ConfigEmptyStateComponent {
  readonly tailNumber = input<string>('');
  readonly createTriggered = output<void>();
}