
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'aoms-config-action-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './config-action-toolbar.component.html',
  styleUrl: './config-action-toolbar.component.scss',
})
export class ConfigActionToolbarComponent {
  readonly tailNumber = input<string>('');
  readonly configCount = input<number>(0);
  readonly loading = input<boolean>(false);

  readonly backTriggered = output<void>();
  readonly newConfig = output<void>();
  readonly searchChanged = output<string>();
  readonly refreshTriggered = output<void>();

  protected searchValue = '';

  protected onSearchInput(val: string): void {
    this.searchValue = val;
    this.searchChanged.emit(val);
  }

  protected onClearSearch(): void {
    this.searchValue = '';
    this.searchChanged.emit('');
  }
}