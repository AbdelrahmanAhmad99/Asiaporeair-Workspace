

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

import { IEmployeeSummaryDto } from '@shared-core';

type SortCol = 'employeeId' | 'fullName' | 'role' | 'department' | 'hireDate';
type SortDir = 'asc' | 'desc';

const ROW_STAGGER = trigger('rowsIn', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(8px)' }),
      stagger(14, [
        animate('240ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ], { optional: true }),
  ]),
]);

@Component({
  selector: 'aoms-staffing-report-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [ROW_STAGGER],
  templateUrl: './staffing-report-table.component.html',
  styleUrl: './staffing-report-table.component.scss',
})
export class StaffingReportTableComponent {
  readonly employees = input.required<IEmployeeSummaryDto[]>();
  readonly loading = input<boolean>(false);
  readonly totalHired = input<number>(0);

  readonly viewEmployee = output<number>(); // employeeId

  protected readonly shimmerRows = Array(8).fill(null);

  protected sortCol = signal<SortCol>('hireDate');
  protected sortDir = signal<SortDir>('desc');

  protected readonly sorted = computed(() => {
    const col = this.sortCol();
    const dir = this.sortDir();
    return [...this.employees()].sort((a, b) => {
      let va: string | number;
      let vb: string | number;
      switch (col) {
        case 'employeeId': va = a.employeeId; vb = b.employeeId; break;
        case 'fullName':
          va = (a.fullName ?? `${a.firstName ?? ''} ${a.lastName ?? ''}`).trim().toLowerCase();
          vb = (b.fullName ?? `${b.firstName ?? ''} ${b.lastName ?? ''}`).trim().toLowerCase();
          break;
        case 'role':
          va = (a.role ?? '').toLowerCase();
          vb = (b.role ?? '').toLowerCase();
          break;
        case 'department':
          va = (a.department ?? a.crewBaseAirportIata ?? '').toLowerCase();
          vb = (b.department ?? b.crewBaseAirportIata ?? '').toLowerCase();
          break;
        case 'hireDate':
          va = new Date(a.hireDate ?? a.dateOfHire ?? 0).getTime();
          vb = new Date(b.hireDate ?? b.dateOfHire ?? 0).getTime();
          break;
        default: return 0;
      }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  protected onSortClick(col: SortCol): void {
    if (this.sortCol() === col) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortCol.set(col);
      this.sortDir.set('asc');
    }
  }

  protected formatDate(d: string | Date): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  protected fullName(emp: IEmployeeSummaryDto): string {
    if (emp.fullName) return emp.fullName;
    return `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.trim() || 'Unknown';
  }

  protected initials(emp: IEmployeeSummaryDto): string {
    if (emp.firstName && emp.lastName) {
      return `${emp.firstName[0]}${emp.lastName[0]}`.toUpperCase();
    }
    const name = emp.fullName || `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.trim();
    if (name) {
      const parts = name.split(/\s+/);
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    return '??';
  }

  protected trackById(_: number, e: IEmployeeSummaryDto): number { return e.employeeId; }
}