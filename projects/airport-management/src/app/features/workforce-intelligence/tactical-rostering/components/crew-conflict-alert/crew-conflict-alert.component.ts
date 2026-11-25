
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'aoms-crew-conflict-alert',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './crew-conflict-alert.component.html',
  styleUrl: './crew-conflict-alert.component.scss',
})
export class CrewConflictAlertComponent {
  readonly errors = input.required<string[]>();
  readonly clearAll = output<void>();
  readonly dismissError = output<number>();
}

