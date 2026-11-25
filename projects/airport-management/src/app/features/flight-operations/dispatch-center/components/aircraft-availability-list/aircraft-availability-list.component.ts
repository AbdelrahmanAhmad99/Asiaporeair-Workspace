
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IFlightInstanceBriefDto } from '@shared-core';

@Component({
  selector: 'aoms-aircraft-availability-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aircraft-availability-list.component.html',
  styleUrl: './aircraft-availability-list.component.scss',
})
export class AircraftAvailabilityListComponent {
  readonly timeline = input.required<IFlightInstanceBriefDto[]>();
  readonly targetInstanceId = input<number | null>(null);
  readonly loading = input<boolean>(false);

  protected readonly shimmerRows = Array(5).fill(null);

  /** Sort by scheduledDepartureTime ascending. */
  protected readonly sortedTimeline = computed<IFlightInstanceBriefDto[]>(() =>
    [...this.timeline()].sort(
      (a, b) =>
        new Date(a.scheduledDeparture).getTime() -
        new Date(b.scheduledDeparture).getTime()
    )
  );

  protected isTarget(inst: IFlightInstanceBriefDto): boolean {
    return inst.instanceId === this.targetInstanceId();
  }

  protected nodeClass(inst: IFlightInstanceBriefDto): string {
    if (this.isTarget(inst)) return 'aal-node--target';
    const s = inst.status?.toUpperCase() ?? '';
    if (s === 'IN_FLIGHT' || s === 'DEPARTED') return 'aal-node--inflight';
    if (s === 'ARRIVED') return 'aal-node--arrived';
    if (s === 'CANCELLED') return 'aal-node--cancelled';
    return 'aal-node--default';
  }

  protected statusLabel(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'Scheduled', DELAYED: 'Delayed', BOARDING: 'Boarding',
      IN_FLIGHT: 'In Flight', DEPARTED: 'Departed', ARRIVED: 'Arrived',
      CANCELLED: 'Cancelled', DIVERTED: 'Diverted',
    };
    return map[status?.toUpperCase() ?? ''] ?? status;
  }
}