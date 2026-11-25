

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkforceWdoStore } from '../../store/workforce-wdo.store';
import { WorkforceKpiBarComponent } from '../../components/workforce-kpi-bar/workforce-kpi-bar.component';
import { DirectoryFilterBarComponent } from '../../components/directory-filter-bar/directory-filter-bar.component';
import { EmployeeDataGridComponent } from '../../components/employee-data-grid/employee-data-grid.component';
import { IWdoFilters } from '../../store/workforce-wdo.store';
import { IEmployeeAnalyticsDto } from '../../store/employee.model';

// Empty analytics placeholder for shimmer state
const EMPTY_ANALYTICS: IEmployeeAnalyticsDto = {
  totalEmployees: 0, totalPilots: 0, totalAttendants: 0,
  totalAdmins: 0, totalSupervisors: 0, totalSuperAdmins: 0,
  activeCount: 0, inactiveCount: 0, onLeaveCount: 0,
};

@Component({
  selector: 'aoms-employee-inventory-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    WorkforceKpiBarComponent,
    DirectoryFilterBarComponent,
    EmployeeDataGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './employee-inventory-dashboard.component.html',
  styleUrl: './employee-inventory-dashboard.component.scss',
})
export class EmployeeInventoryDashboardComponent implements OnInit, OnDestroy {
  protected readonly store = inject(WorkforceWdoStore);

  // ── Deactivation modal ────────────────────────────────────────────
  protected readonly showDeactivateModal = signal<boolean>(false);
  protected readonly pendingDeactivateId = signal<number | null>(null);
  protected readonly pendingDeactivateName = signal<string>('');

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  protected readonly emptyAnalytics = EMPTY_ANALYTICS;

  // ── Lifecycle ──────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.loadWorkforceAnalytics();
    this.store.loadEmployees();
  }

  ngOnDestroy(): void {
    this.store.clearActionState();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Filters ────────────────────────────────────────────────────────
  protected onFiltersChanged(partial: Partial<IWdoFilters>): void {
    this.store.updateFilters(partial);
  }

  protected onFiltersReset(): void {
    this.store.resetFilters();
  }

  // ── Pagination ─────────────────────────────────────────────────────
  protected onNextPage(): void { this.store.nextPage(); }
  protected onPrevPage(): void { this.store.prevPage(); }
  protected onPageChanged(page: number): void { this.store.goToPage(page); }

  // ── Navigation ─────────────────────────────────────────────────────
  protected onManageEmployee(employeeId: number): void {
    this.store.navigateToProfile(employeeId);
  }

  protected onAccessManagerRequested(payload: { employeeId: number; appUserId: string; role: string }): void {
    this.store.navigateToAccessManager(payload.appUserId, payload.role);
  }

  protected onOnboardEmployee(): void {
    this.store.navigateToOnboarding();
  }

  // ── Deactivate Flow ────────────────────────────────────────────────
  protected onDeactivateRequested(employeeId: number): void {
    const emp = this.store.employees().find(e => e.employeeId === employeeId);
    this.pendingDeactivateId.set(employeeId);
    this.pendingDeactivateName.set(emp?.fullName ?? `Employee #${employeeId}`);
    this.store.clearActionState();
    this.showDeactivateModal.set(true);
  }

  protected async onDeactivateConfirmed(): Promise<void> {
    const id = this.pendingDeactivateId();
    if (!id) return;
    const ok = await this.store.deactivateAccount(id);
    if (ok) {
      this.showDeactivateModal.set(false);
      this.pendingDeactivateId.set(null);
    }
  }

  protected onDeactivateCancelled(): void {
    this.showDeactivateModal.set(false);
    this.pendingDeactivateId.set(null);
    this.store.clearActionState();
  }

  // ── Reactivate ─────────────────────────────────────────────────────
  protected async onReactivateEmployee(employeeId: number): Promise<void> {
    await this.store.reactivateAccount(employeeId);
  }
}