
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ILopaKpiStats } from '../../store/cabin-designer.store';

interface ILopaKpiCard {
  id: string;
  label: string;
  value: string;  // pre-formatted for display
  subLabel: string;
  variant: 'capacity' | 'configs' | 'pending' | 'readiness';
  iconPath: string;
  badge?: string;  // optional secondary indicator (e.g., "% ready")
}

@Component({
  selector: 'aoms-lopa-fleet-kpi-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lopa-fleet-kpi-bar.component.html',
  styleUrl: './lopa-fleet-kpi-bar.component.scss',
})
export class LopaFleetKpiBarComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly stats = input.required<ILopaKpiStats>();
  readonly loading = input<boolean>(false);

  protected readonly shimmerCards = Array(4).fill(null);

  readonly cards = computed<ILopaKpiCard[]>(() => {
    const s = this.stats();
    const seats = s.totalSeatCapacity >= 1000
      ? `${(s.totalSeatCapacity / 1000).toFixed(1)}k`
      : s.totalSeatCapacity.toString();

    return [
      {
        id: 'capacity',
        label: 'Fleet Capacity',
        value: seats,
        subLabel: 'Configured seat positions',
        variant: 'capacity',
        iconPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z',
        badge: 'Total seats',
      },
      {
        id: 'configs',
        label: 'Active Layouts',
        value: s.activeConfigurations.toString(),
        subLabel: 'Aircraft with LOPA defined',
        variant: 'configs',
        iconPath: 'M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605',
        badge: undefined,
      },
      {
        id: 'pending',
        label: 'Layout Pending',
        value: s.maintenancePending.toString(),
        subLabel: 'Aircraft awaiting LOPA assignment',
        variant: 'pending',
        iconPath: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
        badge: s.maintenancePending > 0 ? 'Action needed' : undefined,
      },
      {
        id: 'readiness',
        label: 'Network Readiness',
        value: `${s.networkReadinessPct}%`,
        subLabel: 'Fleet with certified layout',
        variant: 'readiness',
        iconPath: 'M9 12.75 11.25 15 15 9.75m-10.5.75a8.25 8.25 0 1 1 16.5 0 8.25 8.25 0 0 1-16.5 0z',
        badge: s.networkReadinessPct === 100 ? 'Fully ready' : undefined,
      },
    ];
  });
}