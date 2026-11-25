

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { RoutesStore } from '../../store/routes.store';
import { RouteConfigFormComponent, IRouteSavePayload } from '../../components/route-config-form/route-config-form.component';
import { ICreateRouteDto } from '@shared-core';

@Component({
  selector: 'aoms-route-composer',
  standalone: true,
  imports: [CommonModule, RouteConfigFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './route-composer.component.html',
  styleUrl: './route-composer.component.scss',
})
export class RouteComposerComponent implements OnInit, OnDestroy {
  protected readonly store = inject(RoutesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // ── Mode ─────────────────────────────────────────────────────────────
  protected readonly isEditMode = signal<boolean>(false);
  protected readonly routeId = signal<number | null>(null);
  protected readonly pageLoading = signal<boolean>(false);

  // ── Store passthrough ─────────────────────────────────────────────────
  protected readonly airports = this.store.sortedAirports;
  protected readonly airportsLoading = this.store.airportsLoading;
  protected readonly isSaving = this.store.isSaving;
  protected readonly composerError = this.store.composerError;

  // ── Pre-population for edit mode ──────────────────────────────────────
  protected readonly initialData = signal<ICreateRouteDto | null>(null);

  // ── Page metadata ─────────────────────────────────────────────────────
  protected readonly pageTitle = computed<string>(() =>
    this.isEditMode()
      ? `Refine Route #${this.routeId()}`
      : 'New Route Construction'
  );

  protected readonly breadcrumbLabel = computed<string>(() =>
    this.isEditMode() ? 'Edit Route' : 'New Route'
  );

  // ── Unsaved-changes guard ─────────────────────────────────────────────
  protected readonly isDirty = signal<boolean>(false);
  protected readonly exitModalOpen = signal<boolean>(false);
  protected readonly pendingNavTarget = signal<string | null>(null);

  // ── ViewChild for imperative header-button submit ─────────────────────
  @ViewChild(RouteConfigFormComponent) private formRef?: RouteConfigFormComponent;

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id') ?? 'new';
    const isEdit = paramId !== 'new' && Number(paramId) > 0;

    this.isEditMode.set(isEdit);
    this.store.loadAirportRegistry();
    this.store.clearComposerError();

    if (isEdit) {
      const id = Number(paramId);
      this.routeId.set(id);
      this._loadExistingRoute(id);
    }
  }

  ngOnDestroy(): void {
    this.store.clearComposerState();
    this.store.clearSavedRoute();
  }

  // ── Load existing route for edit mode ────────────────────────────────

  private _loadExistingRoute(id: number): void {
    this.pageLoading.set(true);

    // The store already has the route in cache if coming from the explorer.
    // Try cache first; fall back to a full detail fetch.
    const cached = this.store.routes().find(r => r.routeId === id);

    if (cached) {
      this.initialData.set({
        originAirportIataCode: cached.originAirportIataCode,
        destinationAirportIataCode: cached.destinationAirportIataCode,
        distanceKm: cached.distanceKm,
      });
      this.pageLoading.set(false);
    } else {
      // Not in cache — fetch individually (covers direct URL access)
      import('@shared-core').then(({ RoutesService }) => {
        const svc = inject(RoutesService);
        svc.getRouteById(id).subscribe({
          next: route => {
            this.initialData.set({
              originAirportIataCode: route.originAirportIataCode,
              destinationAirportIataCode: route.destinationAirportIataCode,
              distanceKm: route.distanceKm,
            });
            this.pageLoading.set(false);
          },
          error: () => this.pageLoading.set(false),
        });
      }).catch(() => this.pageLoading.set(false));
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected exitComposer(): void {
    if (this.isDirty()) {
      this.pendingNavTarget.set('explorer');
      this.exitModalOpen.set(true);
    } else {
      this._navigateToExplorer();
    }
  }

  protected goToExplorer(): void {
    if (this.isDirty()) {
      this.pendingNavTarget.set('explorer');
      this.exitModalOpen.set(true);
    } else {
      this._navigateToExplorer();
    }
  }

  protected goToAnalysis(): void {
    const id = this.routeId();
    if (!id) return;
    if (this.isDirty()) {
      this.pendingNavTarget.set(`analysis:${id}`);
      this.exitModalOpen.set(true);
    } else {
      this.router.navigate(['aoms/network-infrastructure/route-network-planner/analysis', id]);
    }
  }

  // ── Exit modal ────────────────────────────────────────────────────────

  protected cancelExit(): void {
    this.exitModalOpen.set(false);
    this.pendingNavTarget.set(null);
  }

  protected confirmExit(): void {
    const target = this.pendingNavTarget();
    this.exitModalOpen.set(false);
    this.pendingNavTarget.set(null);
    this.isDirty.set(false);

    if (!target) { this._navigateToExplorer(); return; }

    if (target.startsWith('analysis:')) {
      const id = Number(target.split(':')[1]);
      this.router.navigate(['aoms/network-infrastructure/route-network-planner/analysis', id]);
    } else {
      this._navigateToExplorer();
    }
  }

  private _navigateToExplorer(): void {
    this.router.navigate(['aoms/network-infrastructure/route-network-planner/explorer']);
  }

  // ── Form events ───────────────────────────────────────────────────────

  protected onDirtyChange(dirty: boolean): void {
    this.isDirty.set(dirty);
  }

  protected async onSave(payload: IRouteSavePayload): Promise<void> {
    const result = await this.store.saveRoute(payload, this.routeId());

    if (result.success && result.routeId) {
      this.isDirty.set(false);
      this.router.navigate([
        'aoms/network-infrastructure/route-network-planner/analysis',
        result.routeId,
      ]);
    }
    // On failure: composerError signal is set in the store; form shows the banner
  }

  protected onCancel(): void {
    this.exitComposer();
  }

  /** Header Save button triggers form submit imperatively. */
  protected headerSave(): void {
    this.formRef?.triggerSubmit();
  }
}