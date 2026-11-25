
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { NetworkPlanningStore, IScheduleFilters } from '../../store/network-planning.store';
import { ScheduleFilterPanelComponent } from '../../components/schedule-filter-panel/schedule-filter-panel.component';
import { ScheduleDataGridComponent } from '../../components/schedule-data-grid/schedule-data-grid.component';
import { NetworkSummarySidebarComponent } from '../../components/network-summary-sidebar/network-summary-sidebar.component';
import { IFlightScheduleDto } from '@shared-core';

interface IToast { id: string; type: 'success' | 'error'; message: string; }

@Component({
  selector: 'aoms-schedule-master-inventory',
  standalone: true,
  imports: [
    CommonModule,
    ScheduleFilterPanelComponent,
    ScheduleDataGridComponent,
    NetworkSummarySidebarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedule-master-inventory.component.html',
  styleUrl: './schedule-master-inventory.component.scss',
})
export class ScheduleMasterInventoryComponent implements OnInit, OnDestroy {
  protected readonly store = inject(NetworkPlanningStore);
  private readonly router = inject(Router);

  // ── Store passthrough ─────────────────────────────────────────────────
  protected readonly schedules = this.store.schedules;
  protected readonly isLoading = this.store.isLoading;
  protected readonly errorMessage = this.store.errorMessage;
  protected readonly recordLabel = this.store.recordLabel;
  protected readonly hasFilter = this.store.hasActiveFilter;
  protected readonly summaryStats = this.store.summaryStats;
  protected readonly canGoPrev = this.store.canGoPrev;
  protected readonly canGoNext = this.store.canGoNext;
  protected readonly pagination = this.store.pagination;
  protected readonly isProcessing = this.store.isLoading;

  // ── Deletion modal state ──────────────────────────────────────────────
  protected readonly targetSchedule = signal<IFlightScheduleDto | null>(null);
  protected readonly isDeleting = signal<boolean>(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly modalError = signal<string | null>(null);
  protected readonly showModal = computed(() => this.targetSchedule() !== null);

  // ── Toast state ───────────────────────────────────────────────────────
  protected readonly toasts = signal<IToast[]>([]);
  private _toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.store.fetchSchedules({ page: 1 });
  }

  ngOnDestroy(): void {
    this.store.clearError();
    this._toastTimers.forEach(t => clearTimeout(t));
    this._toastTimers.clear();
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected constructNewSchedule(): void {
    this.router.navigate([
      'aoms/flight-operations/network-planning/schedule-configuration',
    ]);
  }

  protected openAuditLogs(): void {
    // Audit logs module — future sprint placeholder
    this.router.navigate([
      'aoms/flight-operations/network-planning',
    ]);
  }

  protected refresh(): void {
    this.store.fetchSchedules({ page: this.pagination().pageNumber });
  }

  // ── Filter ────────────────────────────────────────────────────────────

  protected onFilterChange(partial: Partial<IScheduleFilters>): void {
    this.store.updateFilters(partial);
    this.store.fetchSchedules({ page: 1 });
  }

  protected onFilterReset(): void {
    this.store.resetFilters();
    this.store.fetchSchedules({ page: 1 });
  }

  // ── Pagination ────────────────────────────────────────────────────────

  protected prevPage(): void {
    const p = this.pagination().pageNumber - 1;
    this.store.goToPage(p);
    this.store.fetchSchedules({ page: p });
  }

  protected nextPage(): void {
    const p = this.pagination().pageNumber + 1;
    this.store.goToPage(p);
    this.store.fetchSchedules({ page: p });
  }

  // ── Edit ──────────────────────────────────────────────────────────────

  protected onEdit(scheduleId: number): void {
    this.router.navigate([
      'aoms/flight-operations/network-planning/schedule-configuration',
      scheduleId,
    ]);
  }

  // ── Deletion modal ────────────────────────────────────────────────────

  protected openDeleteModal(scheduleId: number): void {
    const sched = this.schedules().find(s => s.scheduleId === scheduleId) ?? null;
    this.targetSchedule.set(sched);
    this.modalError.set(null);
    this.store.clearError();
  }

  protected closeModal(): void {
    if (this.isDeleting()) return;
    this.targetSchedule.set(null);
    this.modalError.set(null);
  }

  protected async confirmDelete(): Promise<void> {
    const sched = this.targetSchedule();
    if (!sched) return;

    this.isDeleting.set(true);
    this.deletingId.set(sched.scheduleId);
    this.modalError.set(null);

    const result = await this.store.removeSchedule(sched.scheduleId);

    this.isDeleting.set(false);
    this.deletingId.set(null);

    if (result.success) {
      this.targetSchedule.set(null);
      this._pushToast({
        id: _gid(),
        type: 'success',
        message: `Schedule ${sched.flightNo} (#${sched.scheduleId}) has been removed from the inventory.`,
      });
    } else {
      this.modalError.set(result.error ?? 'Failed to delete schedule.');
    }
  }

  // ── Error banner ──────────────────────────────────────────────────────

  protected dismissError(): void {
    this.store.clearError();
  }

  // ── Toast ─────────────────────────────────────────────────────────────

  protected dismissToast(id: string): void {
    this.toasts.update(l => l.filter(t => t.id !== id));
    const t = this._toastTimers.get(id);
    if (t) { clearTimeout(t); this._toastTimers.delete(id); }
  }

  private _pushToast(toast: IToast): void {
    this.toasts.update(l => [...l, toast]);
    const t = setTimeout(() => {
      this.toasts.update(l => l.filter(x => x.id !== toast.id));
      this._toastTimers.delete(toast.id);
    }, 4500);
    this._toastTimers.set(toast.id, t);
  }
}

function _gid(): string { return Math.random().toString(36).slice(2, 10); }