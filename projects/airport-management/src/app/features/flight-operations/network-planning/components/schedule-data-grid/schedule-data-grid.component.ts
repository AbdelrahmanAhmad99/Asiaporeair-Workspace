
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { IFlightScheduleDto } from '@shared-core';

const schedGridAnim = trigger('schedGrid', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(6px)' }),
      stagger(22, [
        animate('210ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ], { optional: true }),
    query(':leave', [
      animate('200ms ease', style({ opacity: 0, transform: 'translateX(8px)' })),
    ], { optional: true }),
  ]),
]);

interface IColumn { key: string; label: string; shimmerWidth: string; hideMd?: boolean; hideLg?: boolean; }

@Component({
  selector: 'aoms-schedule-data-grid',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [schedGridAnim],
  templateUrl: './schedule-data-grid.component.html',
  styleUrl: './schedule-data-grid.component.scss',
})
export class ScheduleDataGridComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly schedules = input.required<IFlightScheduleDto[]>();
  readonly loading = input<boolean>(false);
  readonly recordLabel = input<string>('');
  readonly deletingId = input<number | null>(null);
  readonly isProcessing = input<boolean>(false);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly onEdit = output<number>();
  readonly onDelete = output<number>();

  // ── Column definitions ─────────────────────────────────────────────────
  protected readonly columns: IColumn[] = [
    { key: 'id', label: 'ID', shimmerWidth: '40px', hideLg: true },
    { key: 'flightNo', label: 'Flight No.', shimmerWidth: '52px' },
    { key: 'route', label: 'Route', shimmerWidth: '48px', hideMd: true },
    { key: 'airlineIataCode', label: 'Airline', shimmerWidth: '48px', hideMd: true },
    { key: 'aircraftTypeModel', label: 'Aircraft', shimmerWidth: '48px', hideMd: true },
    { key: 'days', label: 'Days', shimmerWidth: '64px' },
    { key: 'dep', label: 'Departure', shimmerWidth: '48px' },
    { key: 'arr', label: 'Arrival', shimmerWidth: '48px' },
    { key: 'dates', label: 'Effective', shimmerWidth: '90px', hideMd: true },
    { key: 'status', label: 'Status', shimmerWidth: '52px' },
    { key: 'actions', label: '', shimmerWidth: '64px' },
  ];

  protected readonly shimmerRows = Array(8).fill(null);

  protected isDeleting(id: number): boolean {
    return this.deletingId() === id;
  }

  /** Convert "1,2,3,5" → "Mon Tue Wed Fri" short labels */
  protected formatDays(daysOfWeek: any): string {
    if (!daysOfWeek) return '—';
    const MAP: Record<string, string> = {
      '1': 'Mon', '2': 'Tue', '3': 'Wed',
      '4': 'Thu', '5': 'Fri', '6': 'Sat', '7': 'Sun',
    };

    let daysArray: string[] = [];
    if (Array.isArray(daysOfWeek)) {
      daysArray = daysOfWeek;
    } else if (typeof daysOfWeek === 'string') {
      daysArray = daysOfWeek.split(',');
    } else {
      daysArray = [String(daysOfWeek)];
    }

    return daysArray
      .map(d => MAP[String(d).trim()] ?? String(d).trim())
      .join(' ');
  }

  protected formatDate(d: string | Date | undefined | null): string {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: '2-digit',
    });
  }
}