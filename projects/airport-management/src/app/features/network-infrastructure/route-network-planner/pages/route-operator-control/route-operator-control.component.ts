

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
import { ActivatedRoute, Router } from '@angular/router';

import { RoutesStore } from '../../store/routes.store';
import { OperatorAssignmentListComponent } from '../../components/operator-assignment-list/operator-assignment-list.component';
import {
  OperatorConfigModalComponent,
  IAssignPayload,
  IUpdatePayload,
} from '../../components/operator-config-modal/operator-config-modal.component';
import { IRouteOperatorDto } from '@shared-core';

interface IToast { id: string; type: 'success' | 'error'; message: string; }

@Component({
  selector: 'aoms-route-operator-control',
  standalone: true,
  imports: [
    CommonModule,
    OperatorAssignmentListComponent,
    OperatorConfigModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './route-operator-control.component.html',
  styleUrl: './route-operator-control.component.scss',
})
export class RouteOperatorControlComponent implements OnInit, OnDestroy {
  protected readonly store = inject(RoutesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // ── Route param ──────────────────────────────────────────────────────
  protected readonly routeId = signal<number>(0);

  // ── Store passthrough ─────────────────────────────────────────────────
  protected readonly operators = this.store.selectedRouteOperators;
  protected readonly airlines = this.store.availableAirlines;
  protected readonly unassigned = this.store.unassignedAirlines;
  protected readonly loading = this.store.operatorsLoading;
  protected readonly isProcessing = this.store.isProcessing;
  protected readonly opError = this.store.opErrorMessage;
  protected readonly activeCount = this.store.activeOperatorCount;
  protected readonly codeshareCount = this.store.codeshareOperatorCount;
  protected readonly airlinesLoading = this.store.airlinesLoading;

  // ── Page metadata ─────────────────────────────────────────────────────
  protected readonly pageTitle = computed<string>(() =>
    `Route #${this.routeId()} — Operator Rights Control`
  );

  // ── Modal state ───────────────────────────────────────────────────────
  protected readonly configModalOpen = signal<boolean>(false);
  protected readonly editTarget = signal<IRouteOperatorDto | null>(null);
  protected readonly modalFormError = signal<string | null>(null);

  // ── Revocation guard state ────────────────────────────────────────────
  protected readonly revokeTarget = signal<IRouteOperatorDto | null>(null);
  protected readonly revokingIata = signal<string | null>(null);
  protected readonly revokeGuardOpen = computed(() => this.revokeTarget() !== null);

  // ── Toast state ───────────────────────────────────────────────────────
  protected readonly toasts = signal<IToast[]>([]);
  private _toastTimers = new Map<string, ReturnType<typeof setTimeout>>();

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id') ?? 0);
    if (id > 0) {
      this.routeId.set(id);
      this.store.loadRouteOperators(id);
      this.store.loadActiveAirlines();
    }
  }

  ngOnDestroy(): void {
    this.store.clearOperatorControl();
    this._toastTimers.forEach(t => clearTimeout(t));
    this._toastTimers.clear();
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected goToExplorer(): void {
    this.router.navigate(['aoms/network-infrastructure/route-network-planner/explorer']);
  }

  protected goToAnalysis(): void {
    this.router.navigate([
      'aoms/network-infrastructure/route-network-planner/analysis',
      this.routeId(),
    ]);
  }

  protected refresh(): void {
    const id = this.routeId();
    if (id > 0) this.store.loadRouteOperators(id);
  }

  // ── Config Modal ──────────────────────────────────────────────────────

  protected openAssignModal(): void {
    this.editTarget.set(null);
    this.modalFormError.set(null);
    this.configModalOpen.set(true);
  }

  protected openEditModal(op: IRouteOperatorDto): void {
    this.editTarget.set(op);
    this.modalFormError.set(null);
    this.configModalOpen.set(true);
  }

  protected closeConfigModal(): void {
    this.configModalOpen.set(false);
    this.editTarget.set(null);
    this.modalFormError.set(null);
  }

  protected async onAssign(payload: IAssignPayload): Promise<void> {
    const result = await this.store.assignOperator({
      routeId: payload.routeId,
      airlineIataCode: payload.airlineIataCode,
      isCodeshare: payload.isCodeshare,
    });

    if (result.success) {
      this.closeConfigModal();
      this._pushToast({ id: _gid(), type: 'success', message: this.store.opSuccessMessage() ?? 'Operator assigned.' });
      this.store.clearOpSuccess();
    } else {
      this.modalFormError.set(result.error ?? 'Assignment failed.');
    }
  }

  protected async onUpdate(payload: IUpdatePayload): Promise<void> {
    const result = await this.store.updateOperator(
      this.routeId(),
      payload.airlineIataCode,
      { isCodeshare: payload.isCodeshare }
    );

    if (result.success) {
      this.closeConfigModal();
      this._pushToast({ id: _gid(), type: 'success', message: this.store.opSuccessMessage() ?? 'Operator updated.' });
      this.store.clearOpSuccess();
    } else {
      this.modalFormError.set(result.error ?? 'Update failed.');
    }
  }

  // ── Revocation Guard ──────────────────────────────────────────────────

  protected openRevokeGuard(op: IRouteOperatorDto): void {
    this.revokeTarget.set(op);
    this.store.clearOpError();
  }

  protected closeRevokeGuard(): void {
    if (this.isProcessing()) return;
    this.revokeTarget.set(null);
  }

  protected async confirmRevoke(): Promise<void> {
    const op = this.revokeTarget();
    if (!op) return;

    this.revokingIata.set(op.airlineIataCode);

    const result = await this.store.revokeOperator(this.routeId(), op.airlineIataCode);

    this.revokingIata.set(null);
    this.revokeTarget.set(null);

    if (result.success) {
      this._pushToast({ id: _gid(), type: 'success', message: this.store.opSuccessMessage() ?? 'Operator revoked.' });
      this.store.clearOpSuccess();
    } else {
      this._pushToast({ id: _gid(), type: 'error', message: result.error ?? 'Revocation failed.' });
    }
  }

  // ── Error banner ──────────────────────────────────────────────────────

  protected dismissError(): void {
    this.store.clearOpError();
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