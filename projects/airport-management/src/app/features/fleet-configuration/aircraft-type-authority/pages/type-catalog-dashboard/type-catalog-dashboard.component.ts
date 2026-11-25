

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AircraftTypesStore } from '../../store/aircraft-types.store';
import { TypeStatsCardsComponent } from '../../components/type-stats-cards/type-stats-cards.component';
import { TypeSearchFilterBarComponent } from '../../components/type-search-filter-bar/type-search-filter-bar.component';
import { TypeDataGridComponent, IGridActionEvent } from '../../components/type-data-grid/type-data-grid.component';
import { IAircraftTypeFilters } from '../../store/aircraft-types.store';

// Base route for this feature (relative to the lazy-loaded route root)
const ATA_BASE = '/aoms/fleet-configuration/aircraft-type-authority';

@Component({
  selector: 'aoms-type-catalog-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TypeStatsCardsComponent,
    TypeSearchFilterBarComponent,
    TypeDataGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './type-catalog-dashboard.component.html',
  styleUrl: './type-catalog-dashboard.component.scss',
})
export class TypeCatalogDashboardComponent implements OnInit {
  protected readonly store = inject(AircraftTypesStore);
  private readonly router = inject(Router);

  /** Tracks the current theme mode; initialised from the DOM. */
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  ngOnInit(): void {
    this.store.loadActiveTypes();
  }

  // ── Dark Mode Toggle ───────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const html = document.documentElement;
    const next = !this.isDarkMode();
    html.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Filter Bridge ──────────────────────────────────────────────────────
  protected onFiltersChanged(partial: Partial<IAircraftTypeFilters>): void {
    this.store.applyFilters(partial);
  }

  protected onFiltersReset(): void {
    this.store.resetFilters();
  }

  // ── Grid Action Dispatcher ─────────────────────────────────────────────
  protected onGridAction(event: IGridActionEvent): void {
    switch (event.action) {
      case 'view':
        this.router.navigate([ATA_BASE, 'details', event.typeId]);
        break;
      case 'edit':
        this.router.navigate([ATA_BASE, 'editor', event.typeId]);
        break;
      case 'archive':
        this.store.archiveType(event.typeId);
        break;
      case 'reactivate':
        this.store.reactivateType(event.typeId);
        break;
    }
  }

  // ── Create Navigation ──────────────────────────────────────────────────
  protected navigateToCreate(): void {
    this.router.navigate([ATA_BASE, 'editor']);
  }

  // ── Other Feature Navigation ──────────────────────────────────────────
  protected navigateToArchive(): void {
    this.router.navigate([ATA_BASE, 'archive']);
  }

  protected navigateToRangeAnalyzer(): void {
    this.router.navigate([ATA_BASE, 'range-analyzer']);
  }
}