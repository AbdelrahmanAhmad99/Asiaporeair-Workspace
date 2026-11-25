
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IGateStats } from '../../store/ground-handling.store';

@Component({
  selector: 'aoms-boarding-status-monitor',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './boarding-status-monitor.component.html',
  styleUrl: './boarding-status-monitor.component.scss',
})
export class BoardingStatusMonitorComponent {
  readonly stats = input.required<IGateStats>();
  readonly isComplete = input<boolean>(false);

  // SVG circular progress: circumference = 2π × r (r=42 in viewBox)
  private readonly CIRCUMFERENCE = 2 * Math.PI * 42;

  readonly strokeDashoffset = computed<number>(() => {
    const pct = this.stats().percentageBoarded / 100;
    return this.CIRCUMFERENCE * (1 - pct);
  });

  readonly circumference = this.CIRCUMFERENCE;
}