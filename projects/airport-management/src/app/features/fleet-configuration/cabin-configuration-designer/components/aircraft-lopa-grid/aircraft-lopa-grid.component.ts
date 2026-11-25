
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
import { ILopaAircraftRow, ILopaPagination } from '../../store/cabin-designer.store';
import { AIRCRAFT_STATUS } from '../../../../fleet-configuration/fleet-inventory-lifecycle/store/fleet-inventory.store';

// Re-export the status constant type so the template can use it cleanly.
// If the import path differs in your project, adjust accordingly.

// ── Staggered row animation ───────────────────────────────────────────────
export const lopaRowAnimation = trigger('lopaRows', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(8px)' }),
      stagger(28, [
        animate(
          '240ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ], { optional: true }),
  ]),
]);

// ── Status badge config ───────────────────────────────────────────────────
interface IStatusBadge {
  label: string;
  cssClass: string;
  pulse: boolean;
}

const STATUS_BADGE_MAP: Record<string, IStatusBadge> = {
  ACTIVE: { label: 'Operational', cssClass: 'sb--active', pulse: false },
  MAINTENANCE: { label: 'Maintenance', cssClass: 'sb--maintenance', pulse: false },
  GROUNDED: { label: 'Grounded', cssClass: 'sb--grounded', pulse: true },
  AOG: { label: 'AOG', cssClass: 'sb--aog', pulse: true },
  RESERVE: { label: 'Reserve', cssClass: 'sb--reserve', pulse: false },
};

@Component({
  selector: 'aoms-aircraft-lopa-grid',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [lopaRowAnimation],
  templateUrl: './aircraft-lopa-grid.component.html',
  styleUrl: './aircraft-lopa-grid.component.scss',
})
export class AircraftLopaGridComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly rows = input.required<ILopaAircraftRow[]>();
  readonly pagination = input<ILopaPagination | null>(null);
  readonly loading = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly manageLopa = output<string>();    // emits tailNumber
  readonly pageChanged = output<number>();
  readonly nextPage = output<void>();
  readonly prevPage = output<void>();

  protected readonly shimmerRows = Array(7).fill(null);
  protected readonly Math = Math;

  // ── Helpers ───────────────────────────────────────────────────────────
  protected statusBadge(status: string): IStatusBadge {
    return STATUS_BADGE_MAP[status?.toUpperCase()] ?? {
      label: status ?? '—', cssClass: 'sb--reserve', pulse: false,
    };
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
      if (current > 3) visible.push(-1);
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        visible.push(i);
      }
      if (current < total - 2) visible.push(-2);
      visible.push(total);
    }
    return visible;
  }
}