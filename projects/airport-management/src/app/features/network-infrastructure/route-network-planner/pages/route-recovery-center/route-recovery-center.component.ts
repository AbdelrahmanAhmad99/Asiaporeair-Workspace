
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
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { RoutesStore } from '../../store/routes.store';
import { RouteAuditTableComponent } from '../../components/route-audit-table/route-audit-table.component';
import { IRouteDto } from '@shared-core';

interface IToast { id: string; type: 'success' | 'error'; message: string; }

@Component({
  selector: 'aoms-route-recovery-center',
  standalone: true,
  imports: [CommonModule, FormsModule, RouteAuditTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './route-recovery-center.component.html',
  styleUrl: './route-recovery-center.component.scss',
})
export class RouteRecoveryCenterComponent implements OnInit, OnDestroy {
  protected readonly store = inject(RoutesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // ── Store passthrough ─────────────────────────────────────────────────
  protected readonly archivedRoutes = this.store.filteredArchivedRoutes;
  protected readonly loading = this.store.recoveryLoading;
  protected readonly auditError = this.store.auditError;
  protected readonly archivedCount = this.store.archivedCount;
  protected readonly isProcessing = this.store.recoveryLoading;

  // ── Search ────────────────────────────────────────────────────────────
  protected readonly searchQuery = signal<string>('');
  private _searchTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Restoration modal ─────────────────────────────────────────────────
  protected readonly targetRoute = signal<IRouteDto | null>(null);
  protected readonly isRestoring = signal<boolean>(false);
  protected readonly restoringId = signal<number | null>(null);
  protected readonly showModal = computed(() => this.targetRoute() !== null);

  // ── Toast system ──────────────────────────────────────────────────────
  protected readonly toasts = signal<IToast[]>([]);
  private _toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.store.loadArchivedRoutes();
  }

  ngOnDestroy(): void {
    this.store.clearRecoveryCenter();
    if (this._searchTimer) clearTimeout(this._searchTimer);
    this._toastTimers.forEach(t => clearTimeout(t));
    this._toastTimers.clear();
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected exitAuditCenter(): void {
    this.router.navigate(['aoms/network-infrastructure/route-network-planner/explorer']);
  }

  protected goToExplorer(): void {
    this.router.navigate(['aoms/network-infrastructure/route-network-planner/explorer']);
  }

  protected refresh(): void {
    this.store.loadArchivedRoutes();
  }

  // ── Search ────────────────────────────────────────────────────────────

  protected onSearchInput(value: string): void {
    this.searchQuery.set(value);
    if (this._searchTimer) clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      this.store.setAuditSearch(value);
    }, 200);
  }

  protected clearSearch(): void {
    this.searchQuery.set('');
    this.store.setAuditSearch('');
  }

  // ── Restoration Modal ─────────────────────────────────────────────────

  protected openRestorationModal(routeId: number): void {
    const route = this.archivedRoutes().find(r => r.routeId === routeId) ?? null;
    this.targetRoute.set(route);
    this.store.clearAuditError();
  }

  protected closeRestorationModal(): void {
    if (this.isRestoring()) return;
    this.targetRoute.set(null);
  }

  protected async confirmRestore(): Promise<void> {
    const route = this.targetRoute();
    if (!route) return;

    this.isRestoring.set(true);
    this.restoringId.set(route.routeId);

    const result = await this.store.restoreRoute(route.routeId);

    this.isRestoring.set(false);
    this.restoringId.set(null);
    this.targetRoute.set(null);

    if (result.success) {
      this._pushToast({
        id: _gid(),
        type: 'success',
        message: `Corridor ${route.originAirportIataCode} → ${route.destinationAirportIataCode} has been restored to active operations.`,
      });
    } else {
      this._pushToast({
        id: _gid(),
        type: 'error',
        message: result.error ?? `Failed to restore corridor #${route.routeId}.`,
      });
    }
  }

  // ── Error ─────────────────────────────────────────────────────────────

  protected dismissError(): void {
    this.store.clearAuditError();
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