
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { FleetInventoryStore } from '../../store/fleet-inventory.store';
import { IFleetFilters } from '../../store/fleet-inventory.store';
import { FleetStatusOverviewComponent } from '../../components/fleet-status-overview/fleet-status-overview.component';
import { AircraftAdvancedSearchComponent } from '../../components/aircraft-advanced-search/aircraft-advanced-search.component';
import { AircraftDataDenseGridComponent } from '../../components/aircraft-data-dense-grid/aircraft-data-dense-grid.component';

const FIL_BASE = 'aoms/fleet-configuration/fleet-inventory-lifecycle';

@Component({
  selector: 'aoms-fleet-inventory-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FleetStatusOverviewComponent,
    AircraftAdvancedSearchComponent,
    AircraftDataDenseGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fleet-inventory-dashboard.component.html',
  styleUrl: './fleet-inventory-dashboard.component.scss',
})
export class FleetInventoryDashboardComponent implements OnInit, OnDestroy {
  protected readonly store = inject(FleetInventoryStore);
  private readonly router = inject(Router);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  ngOnInit(): void {
    this.store.loadFleet();
  }

  ngOnDestroy(): void {
    this.store.resetFilters();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const html = document.documentElement;
    const next = !this.isDarkMode();
    html.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Filter Bridge ──────────────────────────────────────────────────────
  protected onFiltersApplied(partial: Partial<IFleetFilters>): void {
    this.store.updateFilters(partial);
  }

  protected onFiltersReset(): void {
    this.store.resetFilters();
  }

  // ── Pagination Bridge ──────────────────────────────────────────────────
  protected onPageChanged(page: number): void {
    this.store.goToPage(page);
  }

  protected onNextPage(): void {
    this.store.nextPage();
  }

  protected onPrevPage(): void {
    this.store.prevPage();
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected onViewSuite(tailNumber: string): void {
    this.router.navigate([FIL_BASE, tailNumber]);
  }

  protected navigateToRegister(): void {
    this.router.navigate([FIL_BASE, 'register']);
  }

  protected navigateToArchivalCenter(): void {
    this.router.navigate([FIL_BASE, 'archival-center']);
  }
}