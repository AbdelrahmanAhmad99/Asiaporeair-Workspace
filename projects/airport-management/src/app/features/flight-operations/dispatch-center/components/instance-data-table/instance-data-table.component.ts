
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { IFlightInstanceDto } from '@shared-core';
import { FlightInstanceStatus } from '../../store/flight-dispatch.store';

const tableAnim = trigger('instanceTable', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(5px)' }),
      stagger(22, [
        animate('200ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ], { optional: true }),
    query(':leave', [
      animate('200ms ease', style({ opacity: 0, transform: 'translateX(10px)' })),
    ], { optional: true }),
  ]),
]);

interface IColumn { key: string; label: string; shimmerWidth: string; hideMd?: boolean; hideLg?: boolean; }

type StatusMeta = { label: string; cls: string; pulse: boolean; };

const STATUS_MAP: Record<FlightInstanceStatus, StatusMeta> = {
  SCHEDULED: { label: 'Scheduled', cls: 'scheduled', pulse: false },
  DELAYED: { label: 'Delayed', cls: 'delayed', pulse: true },
  BOARDING: { label: 'Boarding', cls: 'boarding', pulse: true },
  DEPARTED: { label: 'Departed', cls: 'inflight', pulse: true },
  IN_FLIGHT: { label: 'In Flight', cls: 'inflight', pulse: true },
  ARRIVED: { label: 'Arrived', cls: 'arrived', pulse: false },
  CANCELLED: { label: 'Cancelled', cls: 'cancelled', pulse: false },
  DIVERTED: { label: 'Diverted', cls: 'diverted', pulse: true },
};

@Component({
  selector: 'aoms-instance-data-table',
  standalone: true,
  imports: [CommonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [tableAnim],
  templateUrl: './instance-data-table.component.html',
  styleUrl: './instance-data-table.component.scss',
})
export class InstanceDataTableComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly instances = input.required<IFlightInstanceDto[]>();
  readonly loading = input<boolean>(false);
  readonly recordLabel = input<string>('');
  readonly cancellingId = input<number | null>(null);
  readonly isProcessing = input<boolean>(false);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly onAnalyse = output<number>();
  readonly onCancel = output<number>();

  // ── Column definitions ─────────────────────────────────────────────────
  protected readonly columns: IColumn[] = [
    { key: 'id', label: 'IDs', shimmerWidth: '60px' },
    { key: 'flight', label: 'Flight & Airline', shimmerWidth: '120px' },
    { key: 'aircraft', label: 'Aircraft', shimmerWidth: '100px' },
    { key: 'origin', label: 'Origin (Departure)', shimmerWidth: '140px' },
    { key: 'dest', label: 'Destination (Arrival)', shimmerWidth: '140px' },
    { key: 'times', label: 'Schedule vs Actual', shimmerWidth: '180px' },
    { key: 'status', label: 'Status', shimmerWidth: '80px' },
    { key: 'actions', label: '', shimmerWidth: '64px' },
  ];

  protected readonly shimmerRows = Array(10).fill(null);

  // ── Status helpers ─────────────────────────────────────────────────────

  protected statusMeta(status: string): StatusMeta {
    const s = (status ?? '').toUpperCase() as FlightInstanceStatus;
    return STATUS_MAP[s] ??
      { label: status, cls: 'unknown', pulse: false };
  }

  protected isCancelling(id: number): boolean {
    return this.cancellingId() === id;
  }

  /** Whether Cancel button should be visible (non-terminal statuses only) */
  protected canCancel(status: string): boolean {
    const s = (status ?? '').toUpperCase();
    return !['ARRIVED', 'CANCELLED', 'IN_FLIGHT', 'DEPARTED'].includes(s);
  }

  protected isCancelled(status: string): boolean {
    return (status ?? '').toUpperCase() === 'CANCELLED';
  }
}
