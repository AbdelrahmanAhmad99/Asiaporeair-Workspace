
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

import { FlightDispatchStore, IDispatchSearchFilters } from '../../store/flight-dispatch.store';
import { InstanceSearchBarComponent } from '../../components/instance-search-bar/instance-search-bar.component';
import { InstanceDataTableComponent } from '../../components/instance-data-table/instance-data-table.component';
import {
  FlightCancellationDialogComponent,
  ICancellationPayload,
} from '../../components/flight-cancellation-dialog/flight-cancellation-dialog.component';
import { IFlightInstanceDto } from '@shared-core';

interface IToast { id: string; type: 'success' | 'error'; message: string; }

@Component({
  selector: 'aoms-flight-instance-control-room',
  standalone: true,
  imports: [
    CommonModule,
    InstanceSearchBarComponent,
    InstanceDataTableComponent,
    FlightCancellationDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './flight-instance-control-room.component.html',
  styleUrl: './flight-instance-control-room.component.scss',
})
export class FlightInstanceControlRoomComponent implements OnInit, OnDestroy {
  protected readonly store = inject(FlightDispatchStore);
  private readonly router = inject(Router);

  // ── Store passthrough ─────────────────────────────────────────────────
  protected readonly instances = this.store.flightInstances;
  protected readonly loading = this.store.isDispatchLoading;
  protected readonly dispatchError = this.store.dispatchError;
  protected readonly recordLabel = this.store.recordLabel;
  protected readonly hasFilter = this.store.hasActiveFilter;
  protected readonly pagination = this.store.pagination;
  protected readonly canGoPrev = this.store.canGoPrev;
  protected readonly canGoNext = this.store.canGoNext;
  protected readonly statusSummary = this.store.instancesByStatus;
  protected readonly liveCount = this.store.liveFlightCount;
  protected readonly isProcessing = this.store.isDispatchLoading;

  // ── Cancellation dialog state ─────────────────────────────────────────
  protected readonly cancelTarget = signal<IFlightInstanceDto | null>(null);
  protected readonly isCancelling = signal<boolean>(false);
  protected readonly cancellingId = signal<number | null>(null);
  protected readonly dialogApiError = signal<string | null>(null);
  protected readonly showDialog = computed(() => this.cancelTarget() !== null);

  // ── Toast state ───────────────────────────────────────────────────────
  protected readonly toasts = signal<IToast[]>([]);
  private _toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.store.fetchInstances({ page: 1 });
  }

  ngOnDestroy(): void {
    this.store.clearDispatchError();
    this._toastTimers.forEach(t => clearTimeout(t));
    this._toastTimers.clear();
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected generateBulkInstances(): void {
    // Navigate to bulk generation wizard (future sprint)
    this.router.navigate(['aoms/flight-operations/dispatch-center/bulk-generator']);
  }

  protected createAdHocFlight(): void {
    // Navigate to ad-hoc flight form (future sprint)
    this.router.navigate(['aoms/flight-operations/dispatch-center/ad-hoc-creator']);
  }

  protected goToFleetAssignment(): void {
    this.router.navigate(['aoms/flight-operations/dispatch-center/aircraft-assignment-hub']);
  }

  protected goToNetworkPlanning(): void {
    this.router.navigate(['aoms/flight-operations/network-planning']);
  }

  protected refresh(): void {
    this.store.fetchInstances({ page: this.pagination().pageNumber });
  }

  // ── Filters ───────────────────────────────────────────────────────────

  protected onFilterChange(partial: Partial<IDispatchSearchFilters>): void {
    this.store.updateSearchFilters(partial);
    this.store.fetchInstances({ page: 1 });
  }

  protected onFilterReset(): void {
    this.store.resetFilters();
    this.store.fetchInstances({ page: 1 });
  }

  // ── Pagination ────────────────────────────────────────────────────────

  protected prevPage(): void {
    const p = this.pagination().pageNumber - 1;
    this.store.goToPage(p);
    this.store.fetchInstances({ page: p });
  }

  protected nextPage(): void {
    const p = this.pagination().pageNumber + 1;
    this.store.goToPage(p);
    this.store.fetchInstances({ page: p });
  }

  // ── Analyse ───────────────────────────────────────────────────────────

  protected onAnalyse(instanceId: number): void {
    this.router.navigate([
      'aoms/flight-operations/dispatch-center/aircraft-assignment-hub',
      instanceId,
    ]);
  }

  // ── Cancellation lifecycle ────────────────────────────────────────────

  protected openCancellationDialog(instanceId: number): void {
    const instance = this.instances().find(f => f.instanceId === instanceId) ?? null;
    this.cancelTarget.set(instance);
    this.dialogApiError.set(null);
    this.store.clearDispatchError();
  }

  protected dismissCancellationDialog(): void {
    if (this.isCancelling()) return;
    this.cancelTarget.set(null);
    this.dialogApiError.set(null);
  }

  protected async onCancellationConfirmed(payload: ICancellationPayload): Promise<void> {
    const instance = this.cancelTarget();
    if (!instance) return;

    this.isCancelling.set(true);
    this.cancellingId.set(instance.instanceId);
    this.dialogApiError.set(null);

    const result = await this.store.cancelFlightInstance(
      instance.instanceId,
      payload.reason,
      payload.notes
    );

    this.isCancelling.set(false);
    this.cancellingId.set(null);

    if (result.success) {
      this.cancelTarget.set(null);
      this._pushToast({
        id: _gid(),
        type: 'success',
        message: `Flight ${instance.flightNo} (#${instance.instanceId}) has been cancelled. Passenger notifications queued.`,
      });
    } else {
      // Keep modal open — display the API error inside the dialog
      this.dialogApiError.set(result.error ?? 'Cancellation failed. Please retry.');
    }
  }

  // ── Global error ──────────────────────────────────────────────────────

  protected dismissError(): void {
    this.store.clearDispatchError();
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
    }, 5000);
    this._toastTimers.set(toast.id, t);
  }
}

function _gid(): string { return Math.random().toString(36).slice(2, 10); }