
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RoutesStore } from '../../store/routes.store';
import { RouteConnectionCardComponent } from '../../components/route-connection-card/route-connection-card.component';
import { RelatedRoutesPanelComponent } from '../../components/related-routes-panel/related-routes-panel.component';

@Component({
  selector: 'aoms-route-analysis-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouteConnectionCardComponent,
    RelatedRoutesPanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './route-analysis-detail.component.html',
  styleUrl: './route-analysis-detail.component.scss',
})
export class RouteAnalysisDetailComponent implements OnInit, OnDestroy {
  protected readonly store = inject(RoutesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // ── Route param ──────────────────────────────────────────────────────
  protected readonly routeId = signal<number>(0);

  // ── Store signals ─────────────────────────────────────────────────────
  protected readonly selectedRoute = this.store.selectedRoute;
  protected readonly originRoutes = this.store.originRelatedRoutes;
  protected readonly destRoutes = this.store.destinationRelatedRoutes;
  protected readonly loading = this.store.analysisLoading;
  protected readonly analysisError = this.store.analysisError;
  protected readonly flightTime = this.store.estimatedFlightTime;
  protected readonly distanceNm = this.store.distanceNm;
  protected readonly codeshareCount = this.store.codeshareCount;

  // ── Derived page metadata ─────────────────────────────────────────────
  protected readonly pageTitle = computed<string>(() => {
    const r = this.selectedRoute();
    return r
      ? `${r.originAirportIataCode} → ${r.destinationAirportIataCode}`
      : 'Route Analysis';
  });

  protected readonly currentOrigin = computed<string>(
    () => this.selectedRoute()?.originAirportIataCode ?? ''
  );

  protected readonly currentDest = computed<string>(
    () => this.selectedRoute()?.destinationAirportIataCode ?? ''
  );

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const paramId = Number(this.route.snapshot.paramMap.get('id') ?? 0);
    if (paramId > 0) {
      this.routeId.set(paramId);
      this.store.loadRouteDeepAnalysis(paramId);
    }
  }

  ngOnDestroy(): void {
    this.store.clearAnalysis();
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected backToExplorer(): void {
    this.router.navigate(['aoms/network-infrastructure/route-network-planner/explorer']);
  }

  protected editRoute(): void {
    this.router.navigate([
      'aoms/network-infrastructure/route-network-planner/composer',
      this.routeId(),
    ]);
  }

  protected manageOperators(): void {
    this.router.navigate([
      'aoms/network-infrastructure/route-network-planner/operator-control',
      this.routeId(),
    ]);
  }

  protected refresh(): void {
    const id = this.routeId();
    if (id > 0) this.store.loadRouteDeepAnalysis(id);
  }

  // ── Related route navigation ──────────────────────────────────────────

  protected onAnalyzeRoute(relatedRouteId: number): void {
    // Navigate to the new analysis — Angular Router reuses the component
    this.store.clearAnalysis();
    this.routeId.set(relatedRouteId);
    this.store.loadRouteDeepAnalysis(relatedRouteId);
    this.router.navigate([
      'aoms/network-infrastructure/route-network-planner/analysis',
      relatedRouteId,
    ]);
  }
}