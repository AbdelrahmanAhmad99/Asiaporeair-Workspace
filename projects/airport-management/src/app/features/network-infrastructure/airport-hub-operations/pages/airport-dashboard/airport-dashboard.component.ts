
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AirportsStore, IAirportSearchCriteria } from '../../store/airports.store';
import { AirportMetricsBarComponent } from '../../components/airport-metrics-bar/airport-metrics-bar.component';
import { AirportSearchPanelComponent } from '../../components/airport-search-panel/airport-search-panel.component';
import { AirportMasterTableComponent, IAirportTableActionEvent } from '../../components/airport-master-table/airport-master-table.component';
import { AirportsService } from '@shared-core';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'aoms-airport-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AirportMetricsBarComponent,
    AirportSearchPanelComponent,
    AirportMasterTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airport-dashboard.component.html',
  styleUrl: './airport-dashboard.component.scss',
})
export class AirportDashboardComponent implements OnInit {
  protected readonly store = inject(AirportsStore);
  private readonly router = inject(Router);
  private readonly airportsSvc = inject(AirportsService);

  /** Tracks the current theme mode; initialised from the DOM. */
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Signals from store passed to template ─────────────────────────────
  protected readonly metrics = this.store.metrics;
  protected readonly displayedAirports = this.store.displayedAirports;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;
  protected readonly recordCountLabel = this.store.recordCountLabel;
  protected readonly hasActiveSearch = this.store.hasActiveSearch;
  protected readonly searchCriteria = this.store.searchCriteria;

  // ──────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.store.loadAllActive();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────

  protected toggleDarkMode(): void {
    const html = document.documentElement;
    const next = !this.isDarkMode();
    html.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Search Panel Events ────────────────────────────────────────────────

  protected onSearch(criteria: IAirportSearchCriteria): void {
    this.store.performSearch({ criteria });
  }

  protected onClear(): void {
    this.store.clearSearch();
  }

  // ── Table Action Dispatcher ───────────────────────────────────────────

  protected onTableAction(event: IAirportTableActionEvent): void {
    switch (event.action) {
      case 'view':
        this.router.navigate([
          'aoms/network-infrastructure/airport-hub-operations/details',
          event.iataCode,
        ]);
        break;

      case 'edit':
        this.router.navigate([
          'aoms/network-infrastructure/airport-hub-operations/manage',
          event.iataCode,
        ]);
        break;

      case 'deactivate':
        this._deactivateAirport(event.iataCode);
        break;
    }
  }

  // ── Create Navigation ─────────────────────────────────────────────────

  protected navigateToCreate(): void {
    this.router.navigate([
      'aoms/network-infrastructure/airport-hub-operations/manage/new',
    ]);
  }

  // ── Navigate to Archive ───────────────────────────────────────────────

  protected navigateToArchive(): void {
    this.router.navigate([
      'aoms/network-infrastructure/airport-hub-operations/archive',
    ]);
  }

  // ── Refresh ────────────────────────────────────────────────────────────

  protected refresh(): void {
    if (this.hasActiveSearch()) {
      this.store.performSearch({ criteria: this.searchCriteria() });
    } else {
      this.store.loadAllActive();
    }
  }

  // ── Private: Deactivation with Optimistic UI ──────────────────────────

  private _deactivateAirport(iataCode: string): void {
    // Snapshot for rollback
    const prev = this.store.optimisticRemove(iataCode);

    this.airportsSvc.deleteAirport(iataCode).pipe(
      catchError(err => {
        this.store.rollbackRemove(prev);
        this.store.setError(err?.message ?? `Failed to deactivate ${iataCode}.`);
        return EMPTY;
      })
    ).subscribe(() => {
      // Success: optimistic update is already applied — nothing more needed.
    });
  }
}