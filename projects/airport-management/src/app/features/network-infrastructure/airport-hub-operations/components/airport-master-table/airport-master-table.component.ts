
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
import { IAirportDto } from '@shared-core';

// ── Animation ─────────────────────────────────────────────────────────────
export const tableRowAnimation = trigger('tableAnim', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(6px)' }),
        stagger(28, [
          animate(
            '220ms cubic-bezier(0.22, 1, 0.36, 1)',
            style({ opacity: 1, transform: 'translateY(0)' })
          ),
        ]),
      ],
      { optional: true }
    ),
  ]),
]);

// ── Action types ──────────────────────────────────────────────────────────
export type AirportTableAction = 'view' | 'edit' | 'deactivate';

export interface IAirportTableActionEvent {
  action: AirportTableAction;
  iataCode: string;
}

// ── Column definition ─────────────────────────────────────────────────────
interface IColumnDef {
  key: string;
  label: string;
  shimmerWidth: string;
  hideOnMd?: boolean;
  hideOnLg?: boolean;
  hideOnXl?: boolean;
}

@Component({
  selector: 'aoms-airport-master-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [tableRowAnimation],
  templateUrl: './airport-master-table.component.html',
  styleUrl: './airport-master-table.component.scss',
})
export class AirportMasterTableComponent {
  // ── Inputs ────────────────────────────────────────────────────────────
  readonly airports = input.required<IAirportDto[]>();
  readonly loading = input<boolean>(false);
  readonly recordLabel = input<string>('');
  readonly hasActiveSearch = input<boolean>(false);

  // ── Output ────────────────────────────────────────────────────────────
  readonly actionTriggered = output<IAirportTableActionEvent>();

  // ── Column definitions ────────────────────────────────────────────────
  protected readonly columns: IColumnDef[] = [
    { key: 'iataCode', label: 'IATA', shimmerWidth: '48px' },
    { key: 'icaoCode', label: 'ICAO', shimmerWidth: '56px' },
    { key: 'name', label: 'Airport', shimmerWidth: '65%' },
    { key: 'city', label: 'City', shimmerWidth: '45%', hideOnMd: true },
    { key: 'countryName', label: 'Country', shimmerWidth: '40%', hideOnLg: true },
    { key: 'countryIsoCode', label: 'ISO', shimmerWidth: '32px', hideOnMd: true },
    { key: 'latitude', label: 'Lat', shimmerWidth: '55px', hideOnXl: true },
    { key: 'longitude', label: 'Lon', shimmerWidth: '55px', hideOnXl: true },
    { key: 'altitude', label: 'Alt (m)', shimmerWidth: '44px', hideOnLg: true },
    { key: 'actions', label: 'Actions', shimmerWidth: '80px' },
  ];

  protected readonly shimmerRows = Array(10).fill(null);

  // ── Formatters ────────────────────────────────────────────────────────

  protected formatCoord(val: number | undefined): string {
    if (val === undefined || val === null) return '—';
    return val.toFixed(4);
  }

  protected formatAlt(val: number | undefined): string {
    if (val === undefined || val === null) return '—';
    return val.toLocaleString();
  }

  // ── Action handler ────────────────────────────────────────────────────
  protected onAction(action: AirportTableAction, iataCode: string): void {
    this.actionTriggered.emit({ action, iataCode });
  }
}