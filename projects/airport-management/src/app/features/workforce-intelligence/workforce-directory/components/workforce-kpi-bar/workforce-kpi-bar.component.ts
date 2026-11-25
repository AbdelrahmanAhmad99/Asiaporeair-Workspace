

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IEmployeeAnalyticsDto } from '../../store/employee.model';

interface IWdoKpiCard {
  id: string;
  label: string;
  value: number;
  subLabel: string;
  variant: 'total' | 'pilots' | 'crew' | 'admins';
  iconPath: string;
  badge?: string;
}

@Component({
  selector: 'aoms-workforce-kpi-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workforce-kpi-bar.component.html',
  styleUrl: './workforce-kpi-bar.component.scss',
})
export class WorkforceKpiBarComponent {
  readonly analytics = input.required<IEmployeeAnalyticsDto>();
  readonly loading = input<boolean>(false);

  protected readonly shimmerCards = Array(4).fill(null);

  readonly cards = computed<IWdoKpiCard[]>(() => {
    const a = this.analytics();
    const adminTotal = (a.totalAdmins ?? 0) + (a.totalSupervisors ?? 0) + (a.totalSuperAdmins ?? 0);
    return [
      {
        id: 'total', label: 'Total Workforce', value: a.totalEmployees,
        subLabel: `${a.activeCount ?? 0} active · ${a.inactiveCount ?? 0} inactive`,
        variant: 'total',
        iconPath: 'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0z',
        badge: `${a.onLeaveCount ?? 0} on leave`,
      },
      {
        id: 'pilots', label: 'Flight Deck Crew', value: a.totalPilots,
        subLabel: 'Active pilots & co-pilots',
        variant: 'pilots',
        iconPath: 'M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5',
        badge: undefined,
      },
      {
        id: 'crew', label: 'Cabin Crew', value: a.totalAttendants,
        subLabel: 'Flight attendants',
        variant: 'crew',
        iconPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z',
        badge: undefined,
      },
      {
        id: 'admins', label: 'Management & Admin', value: adminTotal,
        subLabel: `Admins · Supervisors · SuperAdmins`,
        variant: 'admins',
        iconPath: 'M9 12.75 11.25 15 15 9.75m-10.5.75a8.25 8.25 0 1 1 16.5 0 8.25 8.25 0 0 1-16.5 0z',
        badge: undefined,
      },
    ];
  });
}