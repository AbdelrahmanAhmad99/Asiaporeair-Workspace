
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
import { IAircraftDto } from '@shared-core';
import { IFleetPagination, AIRCRAFT_STATUS } from '../../store/fleet-inventory.store';

// ── Staggered row animation ───────────────────────────────────────────────
export const gridRowAnimation = trigger('gridRows', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(6px)' }),
      stagger(25, [
        animate(
          '220ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ], { optional: true }),
  ]),
]);

// ── Status configuration ──────────────────────────────────────────────────
interface IStatusConfig {
  label: string;
  cssClass: string;
  pulse: boolean;
}

const STATUS_CONFIG: Record<string, IStatusConfig> = {
  [AIRCRAFT_STATUS.ACTIVE]: { label: 'Operational', cssClass: 'status--active', pulse: false },
  [AIRCRAFT_STATUS.MAINTENANCE]: { label: 'Maintenance', cssClass: 'status--maintenance', pulse: false },
  [AIRCRAFT_STATUS.GROUNDED]: { label: 'Grounded', cssClass: 'status--grounded', pulse: true },
  [AIRCRAFT_STATUS.AOG]: { label: 'AOG — Critical', cssClass: 'status--aog', pulse: true },
  [AIRCRAFT_STATUS.RESERVE]: { label: 'Reserve', cssClass: 'status--reserve', pulse: false },
};

@Component({
  selector: 'aoms-aircraft-data-dense-grid',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [gridRowAnimation],
  templateUrl: './aircraft-data-dense-grid.component.html',
  styleUrl: './aircraft-data-dense-grid.component.scss',
})
export class AircraftDataDenseGridComponent {
  protected readonly Math = Math;

  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly aircraft = input.required<IAircraftDto[]>();
  readonly pagination = input<IFleetPagination | null>(null);
  readonly loading = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly viewSuite = output<string>();   // tailNumber → navigate to profile
  readonly pageChanged = output<number>();   // new page number
  readonly nextPage = output<void>();
  readonly prevPage = output<void>();

  protected readonly shimmerRows = Array(8).fill(null);

  // ── Helpers ───────────────────────────────────────────────────────────
  protected statusConfig(status: string): IStatusConfig {
    return STATUS_CONFIG[status?.toUpperCase()] ?? {
      label: status ?? 'Unknown',
      cssClass: 'status--reserve',
      pulse: false,
    };
  }

  protected formatHours(hours: number | undefined): string {
    if (hours == null) return '—';
    if (hours >= 1000) return `${(hours / 1000).toFixed(1)}k hrs`;
    return `${hours} hrs`;
  }

  protected formatDate(date: string | Date | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  protected get pageNumbers(): number[] {
    const p = this.pagination();
    if (!p) return [];
    const total = p.totalPages;
    const current = p.page;
    const visible: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) visible.push(i);
    } else {
      visible.push(1);
      if (current > 3) visible.push(-1); // ellipsis
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        visible.push(i);
      }
      if (current < total - 2) visible.push(-2); // ellipsis
      visible.push(total);
    }
    return visible;
  }
}