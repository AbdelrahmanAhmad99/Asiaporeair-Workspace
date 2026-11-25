
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IFleetStats } from '../../store/fleet-inventory.store';

interface IKpiCard {
  id: string;
  label: string;
  value: number;
  subLabel: string;
  variant: 'total' | 'active' | 'maintenance' | 'grounded';
  iconPath: string;
  trend?: string;
}

@Component({
  selector: 'aoms-fleet-status-overview',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fleet-status-overview.component.html',
  styleUrl: './fleet-status-overview.component.scss',
})
export class FleetStatusOverviewComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly stats = input.required<IFleetStats>();
  readonly loading = input<boolean>(false);

  protected readonly shimmerCards = Array(4).fill(null);

  // ── Derived card definitions ──────────────────────────────────────────
  readonly cards = computed<IKpiCard[]>(() => {
    const s = this.stats();
    return [
      {
        id: 'total',
        label: 'Fleet Assets',
        value: s.total,
        subLabel: 'Registered aircraft',
        variant: 'total',
        iconPath: 'M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5',
        trend: 'Current inventory',
      },
      {
        id: 'active',
        label: 'Operational',
        value: s.active,
        subLabel: 'Ready for service',
        variant: 'active',
        iconPath: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
        trend: `${s.total > 0 ? Math.round((s.active / s.total) * 100) : 0}% of fleet`,
      },
      {
        id: 'maintenance',
        label: 'Maintenance',
        value: s.maintenance,
        subLabel: 'Under scheduled service',
        variant: 'maintenance',
        iconPath: 'M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z',
        trend: 'Scheduled downtime',
      },
      {
        id: 'grounded',
        label: 'Grounded / AOG',
        value: s.grounded,
        subLabel: 'Aircraft on ground',
        variant: 'grounded',
        iconPath: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
        trend: s.aog > 0 ? `${s.aog} AOG critical` : 'No AOG alerts',
      },
    ];
  });
}