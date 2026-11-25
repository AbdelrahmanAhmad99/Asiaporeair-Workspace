

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { RoutesStore, IRouteSearchCriteria } from '../../store/routes.store';
import { RouteStatsWidgetsComponent } from '../../components/route-stats-widgets/route-stats-widgets.component';
import { RouteSearchFormComponent } from '../../components/route-search-form/route-search-form.component';
import { RouteDataGridComponent } from '../../components/route-data-grid/route-data-grid.component';
import { IRouteDto } from '@shared-core';

interface IToast { id: string; type: 'success' | 'error'; message: string; }

@Component({
  selector: 'aoms-route-explorer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouteStatsWidgetsComponent,
    RouteSearchFormComponent,
    RouteDataGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './route-explorer-dashboard.component.html',
  styleUrl: './route-explorer-dashboard.component.scss',
})
export class RouteExplorerDashboardComponent implements OnInit {
  protected readonly store = inject(RoutesStore);
  protected readonly router = inject(Router);

  // ── Store passthrough ─────────────────────────────────────────────────
  protected readonly routes = this.store.routes;
  protected readonly statistics = this.store.statistics;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;
  protected readonly recordLabel = this.store.recordLabel;
  protected readonly hasFilter = this.store.hasActiveFilter;
  protected readonly canGoPrev = this.store.canGoPrev;
  protected readonly canGoNext = this.store.canGoNext;
  protected readonly pagination = this.store.pagination;

  // ── Modal state ───────────────────────────────────────────────────────
  protected readonly targetRoute = signal<IRouteDto | null>(null);
  protected readonly isDeactivating = signal<boolean>(false);
  protected readonly modalError = signal<string | null>(null);
  protected readonly showModal = computed(() => this.targetRoute() !== null);

  // ── Toast state ───────────────────────────────────────────────────────
  protected readonly toasts = signal<IToast[]>([]);
  private _toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

  // ── Current search criteria ────────────────────────────────────────────
  private _currentCriteria: IRouteSearchCriteria = {
    originIata: '', destinationIata: '', isActive: null,
  };

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.store.performSearch({ criteria: this._currentCriteria, page: 1 });
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected composeNewRoute(): void {
    this.router.navigate(['/aoms/network-infrastructure/route-network-planner/composer/new']);
  }

  protected openNetworkAudit(): void {
    this.router.navigate(['/aoms/network-infrastructure/route-network-planner/recovery-center']);
  }

  protected openHubExplorer(): void {
    this.router.navigate(['/aoms/network-infrastructure/airport-hub-operations/dashboard']);
  }

  protected refresh(): void {
    this.store.performSearch({ criteria: this._currentCriteria });
  }

  // ── Search & Reset ────────────────────────────────────────────────────

  protected onSearch(criteria: IRouteSearchCriteria): void {
    this._currentCriteria = criteria;
    this.store.performSearch({ criteria, page: 1 });
  }

  protected onReset(): void {
    this._currentCriteria = { originIata: '', destinationIata: '', isActive: null };
    this.store.resetSearch();
    this.store.performSearch({ criteria: this._currentCriteria, page: 1 });
  }

  // ── Pagination ────────────────────────────────────────────────────────

  protected prevPage(): void {
    const newPage = this.pagination().pageNumber - 1;
    this.store.updatePagination(newPage);
    this.store.performSearch({ criteria: this._currentCriteria, page: newPage });
  }

  protected nextPage(): void {
    const newPage = this.pagination().pageNumber + 1;
    this.store.updatePagination(newPage);
    this.store.performSearch({ criteria: this._currentCriteria, page: newPage });
  }

  // ── Deactivation Modal ────────────────────────────────────────────────

  protected openDeactivateModal(routeId: number): void {
    const route = this.routes().find(r => r.routeId === routeId) ?? null;
    this.targetRoute.set(route);
    this.modalError.set(null);
  }

  protected closeModal(): void {
    if (this.isDeactivating()) return;
    this.targetRoute.set(null);
    this.modalError.set(null);
  }

  protected async confirmDeactivation(): Promise<void> {
    const route = this.targetRoute();
    if (!route) return;

    this.isDeactivating.set(true);
    this.modalError.set(null);

    const result = await this.store.removeRoute(route.routeId);

    this.isDeactivating.set(false);

    if (result.success) {
      this.targetRoute.set(null);
      this._pushToast({
        id: _gid(),
        type: 'success',
        message: `Route ${route.originAirportIataCode} → ${route.destinationAirportIataCode} has been deactivated.`,
      });
    } else {
      this.modalError.set(result.error ?? 'Deactivation failed.');
    }
  }

  // ── Error banner ──────────────────────────────────────────────────────

  protected dismissError(): void {
    this.store.clearError();
  }

  // ── Toasts ────────────────────────────────────────────────────────────

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