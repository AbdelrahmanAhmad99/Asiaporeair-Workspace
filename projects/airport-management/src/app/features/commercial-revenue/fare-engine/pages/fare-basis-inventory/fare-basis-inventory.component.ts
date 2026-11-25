
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { FareEngineStore, IFareSearchCriteria } from '../../store/fare-engine.store';
import { FareSearchFilterComponent } from '../../components/fare-search-filter/fare-search-filter.component';
import { FareInventoryGridComponent } from '../../components/fare-inventory-grid/fare-inventory-grid.component';
import { FareDeleteConfirmDialogComponent } from '../../components/fare-delete-confirm-dialog/fare-delete-confirm-dialog.component';
import { IFareBasisCodeDto } from '@shared-core';

@Component({
  selector: 'aoms-fare-basis-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FareSearchFilterComponent,
    FareInventoryGridComponent,
    FareDeleteConfirmDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fare-basis-inventory.component.html',
  styleUrl: './fare-basis-inventory.component.scss',
})
export class FareBasisInventoryComponent implements OnInit, OnDestroy {
  protected readonly store = inject(FareEngineStore);

  // ── Delete modal state ────────────────────────────────────────────────
  protected readonly showDeleteModal = signal<boolean>(false);
  protected readonly pendingDeleteCode = signal<string | null>(null);
  protected readonly pendingDeleteDescription = signal<string>('');

  // ── Dark mode ──────────────────────────────────────────────────────────
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.loadAllActiveFares();
  }

  ngOnDestroy(): void {
    this.store.clearActionState();
  }

  // ── Dark Mode Toggle ───────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Search Events ──────────────────────────────────────────────────────
  protected onFiltersChanged(criteria: Partial<IFareSearchCriteria>): void {
    this.store.searchFares(criteria);
  }

  protected onFiltersReset(): void {
    this.store.resetFilters();
  }

  // ── Pagination Events ──────────────────────────────────────────────────
  protected onNextPage(): void { this.store.nextPage(); }
  protected onPrevPage(): void { this.store.prevPage(); }
  protected onPageChanged(page: number): void { this.store.goToPage(page); }

  // ── Grid Row Actions ───────────────────────────────────────────────────
  protected onEditFare(code: string): void {
    this.store.navigateToConfigurator(code);
  }

  protected onDeleteRequested(fare: IFareBasisCodeDto): void {
    this.pendingDeleteCode.set(fare.code);
    this.pendingDeleteDescription.set(fare.description || fare.code);
    this.store.clearActionState();
    this.showDeleteModal.set(true);
  }

  // ── Delete Confirmation Flow ───────────────────────────────────────────
  protected async onDeleteConfirmed(): Promise<void> {
    const code = this.pendingDeleteCode();
    if (!code) return;
    const success = await this.store.deleteFare(code);
    if (success) {
      this.showDeleteModal.set(false);
      this.pendingDeleteCode.set(null);
    }
  }

  protected onDeleteCancelled(): void {
    this.showDeleteModal.set(false);
    this.pendingDeleteCode.set(null);
    this.store.clearActionState();
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected onCreateFare(): void {
    this.store.navigateToConfigurator();
  }

  protected onAuditArchive(): void {
    this.store.navigateToAuditArchive();
  }

  // ── Refresh ────────────────────────────────────────────────────────────
  protected onRefresh(): void {
    if (this.store.hasActiveSearch()) {
      this.store.searchFares(this.store.searchFilters());
    } else {
      this.store.loadAllActiveFares();
    }
  }
}