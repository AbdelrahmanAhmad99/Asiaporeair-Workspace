
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { IFlightInstanceDto } from '@shared-core';
import { OpsFlightStatus, VALID_TRANSITIONS } from '../../store/ops-surveillance.store';
import { StatusUpdateDropdownComponent, IStatusChangePayload } from '../status-update-dropdown/status-update-dropdown.component';

const gridAnim = trigger('gridAnim', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(6px)' }),
      stagger(18, [animate('200ms cubic-bezier(0.22,1,0.36,1)', style({ opacity: 1, transform: 'translateY(0)' }))]),
    ], { optional: true }),
  ]),
]);

export interface IGridStatusChangeEvent {
  instanceId: number;
  status: OpsFlightStatus;
  reason?: string;
}

function _isDelayedMoreThan15(f: IFlightInstanceDto): boolean {
  if (f.status?.toUpperCase() !== 'DELAYED') return false;
  const diffMs = Date.now() - new Date(f.scheduledDeparture).getTime();
  return diffMs > 15 * 60 * 1000;
}

@Component({
  selector: 'aoms-live-flight-grid',
  standalone: true,
  imports: [CommonModule, DatePipe, ScrollingModule, StatusUpdateDropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [gridAnim],
  templateUrl: './live-flight-grid.component.html',
  styleUrl: './live-flight-grid.component.scss',
})
export class LiveFlightGridComponent {
  readonly flights = input.required<IFlightInstanceDto[]>();
  readonly loading = input<boolean>(false);
  readonly isUpdating = input<boolean>(false);
  readonly selectedFlightId = input<number | null>(null);
  readonly recordLabel = input<string>('');
  readonly validTransitions = input<OpsFlightStatus[]>([]);

  readonly onSelect = output<IFlightInstanceDto>();
  readonly onStatusChange = output<IGridStatusChangeEvent>();
  readonly onAdjustTime = output<IFlightInstanceDto>();

  protected readonly shimmerRows = Array(8).fill(null);

  protected isCriticalDelay(f: IFlightInstanceDto): boolean {
    return _isDelayedMoreThan15(f);
  }

  protected isSelected(f: IFlightInstanceDto): boolean {
    return f.instanceId === this.selectedFlightId();
  }

  protected validTransitionsFor(f: IFlightInstanceDto): OpsFlightStatus[] {
    // For the selected flight, use store's pre-computed valid transitions
    if (f.instanceId === this.selectedFlightId()) return this.validTransitions();
    // For all other rows, compute inline
    return VALID_TRANSITIONS[f.status?.toUpperCase() ?? ''] ?? [];
  }

  protected isTerminal(f: IFlightInstanceDto): boolean {
    const next = VALID_TRANSITIONS[f.status?.toUpperCase() ?? ''];
    return Array.isArray(next) && next.length === 0;
  }

  protected onDropdownChange(f: IFlightInstanceDto, payload: IStatusChangePayload): void {
    this.onStatusChange.emit({ instanceId: f.instanceId, status: payload.status, reason: payload.reason });
  }

  protected trackById(_: number, f: IFlightInstanceDto): number {
    return f.instanceId;
  }
}