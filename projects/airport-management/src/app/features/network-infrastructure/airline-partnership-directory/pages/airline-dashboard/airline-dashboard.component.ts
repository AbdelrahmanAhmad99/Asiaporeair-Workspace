
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AirlinesStore } from '../../store/airlines.store';
import { AirlineSummaryWidgetsComponent } from '../../components/airline-summary-widgets/airline-summary-widgets.component';
import { AirlineSearchFilterComponent } from '../../components/airline-search-filter/airline-search-filter.component';
import { AirlineDataGridComponent } from '../../components/airline-data-grid/airline-data-grid.component';
import { IAirlineDto } from '@shared-core';

@Component({
  selector: 'aoms-airline-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AirlineSummaryWidgetsComponent,
    AirlineSearchFilterComponent,
    AirlineDataGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airline-dashboard.component.html',
  styleUrl: './airline-dashboard.component.scss',
})
export class AirlineDashboardComponent implements OnInit {
  protected readonly store = inject(AirlinesStore);
  private readonly router = inject(Router);

  // ── Store passthrough signals ─────────────────────────────────────────
  protected readonly airlines = this.store.displayedAirlines;
  protected readonly metrics = this.store.summaryMetrics;
  protected readonly loading = this.store.loading;
  protected readonly error = this.store.error;
  protected readonly recordLabel = this.store.recordLabel;
  protected readonly hasActiveFilter = this.store.hasActiveFilter;

  // ── Deactivation modal state ──────────────────────────────────────────
  /** The airline record targeted for deactivation (drives the modal copy). */
  protected readonly pendingDeactivation = signal<IAirlineDto | null>(null);
  /** True while the API call is in-flight (shows spinner in modal). */
  protected readonly isDeactivating = signal<boolean>(false);
  /** Error from a failed deactivation (shown in the error banner). */
  protected readonly deactivationError = signal<string | null>(null);

  // ── Derived ───────────────────────────────────────────────────────────
  protected readonly showModal = computed(() => this.pendingDeactivation() !== null);

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.store.loadAirlines({});
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected onViewDetail(iataCode: string): void {
    this.router.navigate([
      'aoms/network-infrastructure/airline-partnership-directory/details',
      iataCode,
    ]);
  }

  protected onEditAirline(iataCode: string): void {
    this.router.navigate([
      'aoms/network-infrastructure/airline-partnership-directory/manage',
      iataCode,
    ]);
  }

  protected onAddNew(): void {
    this.router.navigate([
      'aoms/network-infrastructure/airline-partnership-directory/manage/new',
    ]);
  }

  protected navigateToAudit(): void {
    this.router.navigate([
      'aoms/network-infrastructure/airline-partnership-directory/audit-center',
    ]);
  }

  // ── Search & Filter ───────────────────────────────────────────────────

  protected onSearch(name: string): void {
    this.store.search(name);
  }

  protected onRegion(region: string): void {
    this.store.filterByRegion(region);
  }

  protected onClear(): void {
    this.store.clearFilters();
    this.store.loadAirlines({});
  }

  // ── Deactivation Modal ────────────────────────────────────────────────

  /**
   * Called when the data grid emits a deactivate event.
   * Looks up the airline record to show in the modal copy.
   */
  protected openDeactivateModal(iataCode: string): void {
    const target = this.airlines().find(a => a.iataCode === iataCode) ?? null;
    this.pendingDeactivation.set(target);
    this.deactivationError.set(null);
  }

  protected closeModal(): void {
    if (this.isDeactivating()) return; // prevent close during API call
    this.pendingDeactivation.set(null);
    this.deactivationError.set(null);
  }

  protected async confirmDeactivation(): Promise<void> {
    const airline = this.pendingDeactivation();
    if (!airline) return;

    this.isDeactivating.set(true);
    this.deactivationError.set(null);

    const result = await this.store.requestDeactivation(airline.iataCode);

    this.isDeactivating.set(false);

    if (result.success) {
      this.pendingDeactivation.set(null);
    } else {
      this.deactivationError.set(result.error ?? 'Deactivation failed.');
    }
  }

  // ── Refresh ────────────────────────────────────────────────────────────

  protected refresh(): void {
    this.store.clearFilters();
    this.store.loadAirlines({});
  }
}