
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

import {
  FinancialHubStore,
  ExecutiveTimeRange,
} from '../../store/financial-hub.store';
import { RevenueSummaryWidgetComponent, IWidgetTrend } from '../../components/revenue-summary-widget/revenue-summary-widget.component';
import { RevenuePerformanceChartComponent } from '../../components/revenue-performance-chart/revenue-performance-chart.component';
import { FinancialHealthMeterComponent } from '../../components/financial-health-meter/financial-health-meter.component';
import { PaymentDataGridComponent } from '../../components/payment-data-grid/payment-data-grid.component';
import { TransactionDetailViewComponent } from '../../components/transaction-detail-view/transaction-detail-view.component';
import { IPaymentTransaction } from '@shared-core';

@Component({
  selector: 'aoms-executive-revenue-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RevenueSummaryWidgetComponent,
    RevenuePerformanceChartComponent,
    FinancialHealthMeterComponent,
    PaymentDataGridComponent,
    TransactionDetailViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './executive-revenue-dashboard.component.html',
  styleUrl: './executive-revenue-dashboard.component.scss',
})
export class ExecutiveRevenueDashboardComponent implements OnInit, OnDestroy {
  protected readonly store = inject(FinancialHubStore);

  // ── Dark mode ─────────────────────────────────────────────────────────
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Computed: widget trend objects ─────────────────────────────────────
  /** Net Revenue trend — the only card with a reliable period-over-period
   *  comparison source (revenueGrowthRate is a real computed signal). */
  protected readonly netRevenueTrend = computed<IWidgetTrend | null>(() => {
    if (!this.store.hasExecutiveData()) return null;
    const rate = this.store.revenueGrowthRate();
    return {
      value: rate,
      direction: rate > 1 ? 'up' : rate < -1 ? 'down' : 'flat',
    };
  });

  /** Refunds and Success Rate cards intentionally omit trend — no reliable
   *  period-comparison source exists for either without fabricating data. */
  protected readonly refundsCaveat = computed<string | null>(() =>
    this.store.hasPaymentDataForRefunds()
      ? null
      : 'Refund total requires audit data — visit the Audit Log to calculate accurately.'
  );

  protected readonly successRateCaveat = computed<string | null>(() =>
    this.store.transactionSuccessRate() === null
      ? 'Requires audit data — visit the Audit Log to calculate.'
      : null
  );

  protected readonly showInitialSkeleton = computed<boolean>(
    () => this.store.isLoadingExecutiveReport() && !this.store.hasExecutiveData()
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.fetchExecutiveReport();
    this.store.performSearch();
  }

  ngOnDestroy(): void {
    this.store.clearExecutiveReportState();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Time Range ─────────────────────────────────────────────────────────
  protected onSelectRange(range: ExecutiveTimeRange): void {
    if (range === this.store.timeRange()) return;
    this.store.setTimeRange(range);
  }

  // ── Refresh ────────────────────────────────────────────────────────────
  protected onRefresh(): void {
    this.store.refreshExecutiveReport();
    this.store.performSearch();
  }

  // ── Grid & Drawer Handlers ─────────────────────────────────────────────
  protected onRowClicked(tx: IPaymentTransaction): void {
    this.store.selectTransaction(tx);
  }

  protected onDrawerClosed(): void {
    this.store.closeTransactionDetail();
  }

  protected onLoadMore(): void {
    this.store.loadMore();
  }

  protected onResetFilters(): void {
    this.store.resetFilters();
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected onDeepAudit(): void {
    this.store.navigateToAuditor();
  }

  protected onManageRefunds(): void {
    this.store.navigateToRefundTerminal();
  }

  // ── Error ──────────────────────────────────────────────────────────────
  protected onDismissError(): void {
    this.store.clearExecutiveReportError();
  }

  protected onRetry(): void {
    this.store.fetchExecutiveReport();
    this.store.performSearch();
  }
}