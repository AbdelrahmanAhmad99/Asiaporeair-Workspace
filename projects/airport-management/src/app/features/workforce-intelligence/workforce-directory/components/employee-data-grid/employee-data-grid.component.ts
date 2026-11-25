

import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  animate, query, stagger, style, transition, trigger,
} from '@angular/animations';
import { IEmployeeSummaryDto, EmployeeStatus } from '../../store/employee.model';
import { IWdoPagination } from '../../store/workforce-wdo.store';

export const gridRowAnimation = trigger('gridRows', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(8px)' }),
      stagger(22, [
        animate('260ms cubic-bezier(0.4,0,0.2,1)',
          style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ], { optional: true }),
  ]),
]);

interface IRoleConfig {
  label: string;
  iconPath: string;
  cssClass: string;
}

const ROLE_CONFIG: Record<string, IRoleConfig> = {
  pilot: {
    label: 'Pilot',
    iconPath: 'M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5',
    cssClass: 'role--pilot',
  },
  attendant: {
    label: 'Cabin Crew',
    iconPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z',
    cssClass: 'role--crew',
  },
  admin: {
    label: 'Admin',
    iconPath: 'M9 12.75 11.25 15 15 9.75m-10.5.75a8.25 8.25 0 1 1 16.5 0 8.25 8.25 0 0 1-16.5 0z',
    cssClass: 'role--admin',
  },
  supervisor: {
    label: 'Supervisor',
    iconPath: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    cssClass: 'role--supervisor',
  },
  superadmin: {
    label: 'Super Admin',
    iconPath: 'M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0',
    cssClass: 'role--superadmin',
  },
};

@Component({
  selector: 'aoms-employee-data-grid',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [gridRowAnimation],
  templateUrl: './employee-data-grid.component.html',
  styleUrl: './employee-data-grid.component.scss',
})
export class EmployeeDataGridComponent {
  readonly employees = input.required<IEmployeeSummaryDto[]>();
  readonly pagination = input<IWdoPagination | null>(null);
  readonly loading = input<boolean>(false);
  readonly processingId = input<number | null>(null);

  readonly manageClicked = output<number>();     // employeeId
  readonly accessManagerClicked = output<{ employeeId: number; appUserId: string; role: string }>();
  readonly deactivateClicked = output<number>();
  readonly reactivateClicked = output<number>();
  readonly nextPage = output<void>();
  readonly prevPage = output<void>();
  readonly pageChanged = output<number>();

  protected readonly shimmerRows = Array(8).fill(null);

  protected roleConfig(role: string): IRoleConfig {
    const key = role?.toLowerCase().replace(/\s/g, '') ?? '';
    return ROLE_CONFIG[key] ?? ROLE_CONFIG['admin'];
  }

  protected initials(emp: IEmployeeSummaryDto): string {
    return `${emp.firstName[0] ?? ''}${emp.lastName[0] ?? ''}`.toUpperCase();
  }

  protected trackByEmployee(_: number, e: IEmployeeSummaryDto): number {
    return e.employeeId;
  }

  protected compactAppUserId(appUserId: string): string {
    if (!appUserId) return '';
    if (appUserId.length <= 16) return appUserId;
    return `${appUserId.slice(0, 8)}...${appUserId.slice(-4)}`;
  }

  protected get pageNumbers(): number[] {
    const p = this.pagination();
    if (!p) return [];
    const total = p.totalPages;
    const curr = p.page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1];
    if (curr > 3) pages.push(-1);
    for (let i = Math.max(2, curr - 1); i <= Math.min(total - 1, curr + 1); i++) pages.push(i);
    if (curr < total - 2) pages.push(-2);
    pages.push(total);
    return pages;
  }

  protected endIndex(): number {
    const p = this.pagination();
    if (!p) return 0;
    return Math.min(p.page * p.size, p.total);
  }
}