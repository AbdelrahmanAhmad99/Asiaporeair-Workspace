

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

import { OpsSurveillanceStore, IOpsSearchFilters, OpsFlightStatus } from '../../store/ops-surveillance.store';
import { LiveFlightGridComponent, IGridStatusChangeEvent } from '../../components/live-flight-grid/live-flight-grid.component';
import { TimeAdjustmentToolComponent } from '../../components/time-adjustment-tool/time-adjustment-tool.component';
import { IFlightInstanceDto, IUpdateFlightTimesDto } from '@shared-core';

interface IToast { id: string; type: 'success' | 'error'; message: string; }

@Component({
  selector: 'aoms-live-operations-monitor',
  standalone: true,
  imports: [CommonModule, LiveFlightGridComponent, TimeAdjustmentToolComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './live-operations-monitor.component.html',
  styleUrl: './live-operations-monitor.component.scss',
})
export class LiveOperationsMonitorComponent implements OnInit, OnDestroy {
  protected readonly store = inject(OpsSurveillanceStore);
  private readonly router = inject(Router);

  // ── Store passthrough ─────────────────────────────────────────────────
  protected readonly flights = this.store.liveFlights;
  protected readonly isLoading = this.store.isLoading;
  protected readonly isUpdating = this.store.isUpdating;
  protected readonly errorLog = this.store.errorLog;
  protected readonly recordLabel = this.store.recordLabel;
  protected readonly lastRefreshed = this.store.lastRefreshedLabel;
  protected readonly statusCounts = this.store.liveFlightsByStatus;
  protected readonly criticalCount = this.store.criticallyDelayedCount;
  protected readonly hasFilter = this.store.hasActiveFilter;
  protected readonly canGoPrev = this.store.canGoPrev;
  protected readonly canGoNext = this.store.canGoNext;
  protected readonly pagination = this.store.pagination;
  protected readonly validTransitions = this.store.validNextStatuses;
  protected readonly selectedFlight = this.store.selectedFlight;
  protected readonly isPolling = this.store.isPolling;
  protected readonly selectedFlightId = computed(() => this.store.selectedFlight()?.instanceId ?? null);

  // ── Filter bar state ──────────────────────────────────────────────────
  protected readonly flightNoFilter = signal<string>('');
  protected readonly originFilter = signal<string>('');
  protected readonly destFilter = signal<string>('');
  protected readonly statusFilter = signal<string>('');
  protected readonly dateFromFilter = signal<string>(new Date().toISOString().split('T')[0]);
  protected readonly dateToFilter = signal<string>((() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })());

  // ── Time adjustment modal ─────────────────────────────────────────────
  protected readonly timeToolOpen = signal<boolean>(false);
  protected readonly timeToolFlight = signal<IFlightInstanceDto | null>(null);
  protected readonly timeToolError = signal<string | null>(null);

  // ── Toast ─────────────────────────────────────────────────────────────
  protected readonly toasts = signal<IToast[]>([]);
  private _toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

  protected readonly ALL_STATUSES = [
    { value: '', label: 'All Statuses' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'DELAYED', label: 'Delayed' },
    { value: 'BOARDING', label: 'Boarding' },
    { value: 'IN_FLIGHT', label: 'In Flight' },
    { value: 'ARRIVED', label: 'Arrived' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'DIVERTED', label: 'Diverted' },
  ];

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.store.clearError();
    this.store.fetchLiveFlights({ page: 1 });
    this.store.startPolling();
  }

  ngOnDestroy(): void {
    this.store.stopPolling();
    this.store.clearSelection();
    this.store.clearError();
    this._toastTimers.forEach(t => clearTimeout(t));
    this._toastTimers.clear();
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected goToDispatch(): void {
    this.router.navigate(['aoms/flight-operations/dispatch-center/flight-instance-control-room']);
  }

  protected goToFids(): void {
    this.router.navigate(['aoms/flight-operations/ops-surveillance/fids-console']);
  }

  protected manualRefresh(): void {
    this.store.fetchLiveFlights({ page: this.pagination().pageNumber });
  }

  // ── Filters ───────────────────────────────────────────────────────────

  protected onFlightNoInput(v: string): void {
    this.flightNoFilter.set(v.toUpperCase());
    this._applyFilters();
  }

  protected onOriginInput(v: string): void {
    this.originFilter.set(v.toUpperCase().slice(0, 4));
    this._applyFilters();
  }

  protected onDestInput(v: string): void {
    this.destFilter.set(v.toUpperCase().slice(0, 4));
    this._applyFilters();
  }

  protected onStatusChange(v: string): void {
    this.statusFilter.set(v);
    this._applyFilters();
  }

  protected onDateFromChange(v: string): void {
    this.dateFromFilter.set(v);
    this._applyFilters();
  }

  protected onDateToChange(v: string): void {
    this.dateToFilter.set(v);
    this._applyFilters();
  }

  private _applyFilters(): void {
    this.store.updateFilters({
      flightNo: this.flightNoFilter(),
      originIata: this.originFilter(),
      destinationIata: this.destFilter(),
      status: this.statusFilter() as OpsFlightStatus | '',
      dateFrom: this.dateFromFilter(),
      dateTo: this.dateToFilter(),
    });
    this.store.fetchLiveFlights({ page: 1 });
  }

  protected resetFilters(): void {
    this.flightNoFilter.set('');
    this.originFilter.set('');
    this.destFilter.set('');
    this.statusFilter.set('');
    this.store.resetFilters();
    this.store.fetchLiveFlights({ page: 1 });
  }

  // ── Pagination ────────────────────────────────────────────────────────

  protected prevPage(): void {
    const p = this.pagination().pageNumber - 1;
    this.store.goToPage(p);
    this.store.fetchLiveFlights({ page: p });
  }

  protected nextPage(): void {
    const p = this.pagination().pageNumber + 1;
    this.store.goToPage(p);
    this.store.fetchLiveFlights({ page: p });
  }

  // ── Grid events ───────────────────────────────────────────────────────

  protected onFlightSelect(flight: IFlightInstanceDto): void {
    if (this.selectedFlightId() === flight.instanceId) {
      this.store.clearSelection();
    } else {
      this.store.selectFlight(flight);
    }
  }

  protected async onGridStatusChange(ev: IGridStatusChangeEvent): Promise<void> {
    const result = await this.store.changeStatus(ev.instanceId, ev.status, ev.reason);
    if (result.success) {
      this._pushToast({ id: _gid(), type: 'success', message: `Flight #${ev.instanceId} → ${ev.status} ✓` });
    } else {
      this._pushToast({ id: _gid(), type: 'error', message: result.error ?? 'Status update failed.' });
    }
  }

  // ── Time adjustment ───────────────────────────────────────────────────

  protected openTimeAdjustment(flight: IFlightInstanceDto): void {
    this.timeToolFlight.set(flight);
    this.timeToolError.set(null);
    this.timeToolOpen.set(true);
  }

  protected closeTimeAdjustment(): void {
    if (this.isUpdating()) return;
    this.timeToolOpen.set(false);
    this.timeToolFlight.set(null);
    this.timeToolError.set(null);
  }

  protected async onTimeSave(dto: IUpdateFlightTimesDto): Promise<void> {
    const flight = this.timeToolFlight();
    if (!flight) return;

    const result = await this.store.adjustFlightTimes(flight.instanceId, dto);
    if (result.success) {
      this.timeToolOpen.set(false);
      this.timeToolFlight.set(null);
      this._pushToast({ id: _gid(), type: 'success', message: `Actual times updated for ${flight.flightNo}.` });
    } else {
      this.timeToolError.set(result.error ?? 'Time update failed.');
    }
  }

  // ── Error ─────────────────────────────────────────────────────────────

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
    }, 4000);
    this._toastTimers.set(toast.id, t);
  }
}

function _gid(): string { return Math.random().toString(36).slice(2, 10); }