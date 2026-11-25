

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IFlightInstanceDto } from '@shared-core';

@Component({
  selector: 'aoms-instance-status-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './instance-status-card.component.html',
  styleUrl: './instance-status-card.component.scss',
})
export class InstanceStatusCardComponent {
  readonly instance = input<IFlightInstanceDto | null>(null);
  readonly loading = input<boolean>(false);

  protected readonly isAssigned = computed<boolean>(() =>
    !!(this.instance()?.assignedAircraftTailNumber || this.instance()?.tailNumber)
  );

  protected readonly displayTail = computed<string>(() =>
    this.instance()?.assignedAircraftTailNumber ??
    this.instance()?.tailNumber ??
    'Unassigned'
  );

  protected readonly statusCls = computed<string>(() => {
    const s = this.instance()?.status?.toUpperCase() ?? '';
    const map: Record<string, string> = {
      SCHEDULED: 'scheduled', DELAYED: 'delayed', BOARDING: 'boarding',
      IN_FLIGHT: 'inflight', DEPARTED: 'inflight', ARRIVED: 'arrived',
      CANCELLED: 'cancelled', DIVERTED: 'diverted',
    };
    return map[s] ?? 'unknown';
  });

  protected readonly statusLabel = computed<string>(() => {
    const s = this.instance()?.status?.toUpperCase() ?? '';
    const map: Record<string, string> = {
      SCHEDULED: 'Scheduled', DELAYED: 'Delayed', BOARDING: 'Boarding',
      IN_FLIGHT: 'In Flight', DEPARTED: 'Departed', ARRIVED: 'Arrived',
      CANCELLED: 'Cancelled', DIVERTED: 'Diverted',
    };
    return map[s] ?? (this.instance()?.status ?? '—');
  });
}