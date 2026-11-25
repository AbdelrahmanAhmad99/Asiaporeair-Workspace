

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';

import { WorkforceWadStore } from '../../store/workforce-wad.store';
import {
  AnalyticsDateFilterComponent,
  IReportDateRange
} from '../../components/analytics-date-filter/analytics-date-filter.component';
import { HiringVelocityGraphComponent } from '../../components/hiring-velocity-graph/hiring-velocity-graph.component';
import { StaffingReportTableComponent } from '../../components/staffing-report-table/staffing-report-table.component';

const WAD_BASE = 'aoms/workforce-intelligence/workforce-analytics';
const WI_BASE = 'aoms/workforce-intelligence';

const PAGE_ENTER = trigger('pageEnter', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(12px)' }),
    animate('350ms 30ms cubic-bezier(0.4,0,0.2,1)',
      style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

const SECTION_IN = trigger('sectionIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(16px)' }),
    animate('300ms cubic-bezier(0.4,0,0.2,1)', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

@Component({
  selector: 'aoms-recruitment-trends-report',
  standalone: true,
  imports: [
    CommonModule,
    AnalyticsDateFilterComponent,
    HiringVelocityGraphComponent,
    StaffingReportTableComponent,
  ],
  animations: [PAGE_ENTER, SECTION_IN],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recruitment-trends-report.component.html',
  styleUrl: './recruitment-trends-report.component.scss',
})
export class RecruitmentTrendsReportComponent implements OnInit, OnDestroy {
  protected readonly store = inject(WorkforceWadStore);
  private readonly router = inject(Router);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // Expose computed report for dumb components
  protected readonly report = computed(() => this.store.recruitmentReport());

  // Track export processing state
  protected readonly isExporting = signal<boolean>(false);

  ngOnInit(): void {
    // Initialize default 6-month range
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 6);
    start.setDate(1);
    this.store.loadRecruitmentReport({ start, end });
  }

  ngOnDestroy(): void {
    this.store.clearReportError();
  }

  // ── Navigation ──────────────────────────────────────────────────────
  protected goToEnterpriseDashboard(): void {
    this.router.navigate([WAD_BASE, 'enterprise-dashboard']);
  }

  protected goToCrewIntelligence(): void {
    this.router.navigate([WAD_BASE, 'crew-intelligence']);
  }

  protected goToWorkforceDirectory(): void {
    this.router.navigate([WI_BASE, 'workforce-directory', 'inventory-dashboard']);
  }

  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Date Range ──────────────────────────────────────────────────────
  protected onRangeChanged(range: IReportDateRange): void {
    this.store.updateReportRange(range);
  }

  // ── Actions ─────────────────────────────────────────────────────────
  protected onRetry(): void {
    this.store.clearReportError();
    this.store.loadRecruitmentReport(this.store.reportDateRange());
  }

  protected onExportCsv(): void {
    // Build CSV from current hiringData signal
    const data = this.store.hiringData();
    if (!data.length) return;

    const headers = 'Employee ID,Full Name,Email,Role,Department,Hire Date,Active';
    const rows = data.map(e => {
      const name = e.fullName || `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim();
      const role = e.role || e.position || 'Unknown';
      const dept = e.department || e.crewBaseAirportIata || 'N/A';
      const date = new Date(e.hireDate ?? e.dateOfHire ?? 0).toISOString().slice(0, 10);

      return [
        e.employeeId,
        name,
        e.email,
        role,
        dept,
        date,
        e.isActive ? 'Yes' : 'No'
      ].join(',');
    });

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recruitment_report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  protected onViewEmployee(employeeId: number): void {
    this.router.navigate([WI_BASE, 'workforce-directory', 'profile-hub', employeeId]);
  }
}