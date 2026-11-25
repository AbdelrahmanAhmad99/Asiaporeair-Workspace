
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinancialHubStore, ExportFormat } from '../../store/financial-hub.store';
import { PaymentFilterBarComponent } from '../../components/payment-filter-bar/payment-filter-bar.component';
import { PaymentDataGridComponent } from '../../components/payment-data-grid/payment-data-grid.component';
import { TransactionDetailViewComponent } from '../../components/transaction-detail-view/transaction-detail-view.component';
import { IPaymentFilter, IPaymentTransaction } from '@shared-core';

@Component({
  selector: 'aoms-global-payment-auditor',
  standalone: true,
  imports: [
    CommonModule,
    PaymentFilterBarComponent,
    PaymentDataGridComponent,
    TransactionDetailViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './global-payment-auditor.component.html',
  styleUrl: './global-payment-auditor.component.scss',
})
export class GlobalPaymentAuditorComponent implements OnInit, OnDestroy {
  protected readonly store = inject(FinancialHubStore);

  // ── Export format picker visibility ───────────────────────────────────
  protected readonly showExportMenu = signal<boolean>(false);

  // ── Dark mode ─────────────────────────────────────────────────────────
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Run a fresh search on enter to populate the initial result set
    this.store.performSearch();
  }

  ngOnDestroy(): void {
    // Soft cleanup only — payments cache is shared with Executive Dashboard.
    this.store.clearAuditState();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Filter Bar Handlers ────────────────────────────────────────────────
  protected onFiltersChanged(filters: Partial<IPaymentFilter>): void {
    this.store.setFilters(filters);
  }

  protected onSearchTriggered(): void {
    this.store.performSearch();
  }

  protected onResetTriggered(): void {
    this.store.resetFilters();
  }

  // ── Grid Handlers ──────────────────────────────────────────────────────
  protected onRowClicked(tx: IPaymentTransaction): void {
    this.store.selectTransaction(tx);
  }

  protected onLoadMore(): void {
    this.store.loadMore();
  }

  // ── Drawer ─────────────────────────────────────────────────────────────
  protected onDrawerClosed(): void {
    this.store.closeTransactionDetail();
  }

  // ── Export FAB ─────────────────────────────────────────────────────────
  protected toggleExportMenu(): void {
    this.showExportMenu.update(v => !v);
  }

  protected onExport(format: ExportFormat): void {
    this.showExportMenu.set(false);
    this.store.exportAuditReport(format);
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected onNavigateToExecutiveDashboard(): void {
    this.store.navigateToExecutiveDashboard();
  }

  protected onNavigateToRefundTerminal(): void {
    this.store.navigateToRefundTerminal();
  }

  protected onDismissError(): void {
    this.store.clearAuditError();
  }
}