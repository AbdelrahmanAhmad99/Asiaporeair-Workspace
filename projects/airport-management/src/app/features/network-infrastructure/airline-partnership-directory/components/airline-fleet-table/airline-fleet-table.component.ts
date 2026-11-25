
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
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
import { IAircraftDto } from '@shared-core';

// ── Animation ─────────────────────────────────────────────────────────────
export const fleetRowAnimation = trigger('fleetAnim', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      stagger(20, [
        animate(
          '250ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ], { optional: true }),
  ]),
]);

// ── Column definition ─────────────────────────────────────────────────────
interface IFleetColumn {
  key: string;
  label: string;
  shimmerWidth: string;
  hideOnMd?: boolean;
  hideOnLg?: boolean;
}

@Component({
  selector: 'aoms-airline-fleet-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fleetRowAnimation],
  templateUrl: './airline-fleet-table.component.html',
  styleUrl: './airline-fleet-table.component.scss',
})
export class AirlineFleetTableComponent {
  // ── Signal Inputs ─────────────────────────────────────────────────────
  readonly fleet = input.required<IAircraftDto[]>();
  readonly loading = input<boolean>(false);

  // ── Column definitions ─────────────────────────────────────────────────
  protected readonly columns: IFleetColumn[] = [
    { key: 'icon', label: '', shimmerWidth: '28px' },
    { key: 'tailNumber', label: 'Tail Number', shimmerWidth: '56px' },
    { key: 'typeName', label: 'Aircraft Type', shimmerWidth: '55%' },
    { key: 'acquisitionDate', label: 'Acquisition Date', shimmerWidth: '42%', hideOnMd: true },
    { key: 'configuration', label: 'Configuration', shimmerWidth: '50px' },
    { key: 'age', label: 'Age (yrs)', shimmerWidth: '36px', hideOnLg: true },
    { key: 'seatCapacity', label: 'Seats', shimmerWidth: '36px', hideOnMd: true },
    { key: 'totalHours', label: 'Flight Hours', shimmerWidth: '52px', hideOnLg: true },
    { key: 'status', label: 'Status', shimmerWidth: '60px' },
  ];

  protected readonly shimmerRows = Array(8).fill(null);

  // ── Computed ───────────────────────────────────────────────────────────

  readonly totalFleet = computed(() => this.fleet().length);
  readonly activeCount = computed(() =>
    this.fleet().filter(a => a.status === 'Active').length
  );

  // ── Formatters ─────────────────────────────────────────────────────────

  protected getAge(acquisitionDate: string | Date | undefined): string {
    if (!acquisitionDate) return '—';
    const year = new Date(acquisitionDate).getFullYear();
    if (isNaN(year)) return '—';
    return `${new Date().getFullYear() - year}`;
  }

  protected formatHours(hours: number | undefined): string {
    if (hours === undefined || hours === null) return '—';
    return hours.toLocaleString();
  }

  /** Maps status string to SCSS modifier class for status pills. */
  protected statusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'status--active';
      case 'maintenance': return 'status--maintenance';
      case 'retired':
      case 'decommissioned': return 'status--retired';
      default: return 'status--unknown';
    }
  }
}