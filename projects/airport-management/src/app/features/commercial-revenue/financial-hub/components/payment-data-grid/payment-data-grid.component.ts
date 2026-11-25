
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentStatusBadgeComponent } from '../payment-status-badge/payment-status-badge.component';
import { IPaymentTransaction } from '@shared-core';

const SKELETON_ROW_COUNT = 10;

@Component({
  selector: 'aoms-payment-data-grid',
  standalone: true,
  imports: [CommonModule, PaymentStatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './payment-data-grid.component.html',
  styleUrl: './payment-data-grid.component.scss',
})
export class PaymentDataGridComponent implements AfterViewInit, OnDestroy {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly payments = input.required<IPaymentTransaction[]>();
  readonly loading = input<boolean>(false);
  readonly isLoadingMore = input<boolean>(false);
  readonly hasMore = input<boolean>(false);
  readonly hasActiveFilters = input<boolean>(false);
  readonly selectedPaymentId = input<number | null>(null);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly rowClicked = output<IPaymentTransaction>();
  readonly loadMoreTriggered = output<void>();
  readonly resetFiltersRequested = output<void>();

  // ── Infinite scroll sentinel ──────────────────────────────────────────
  @ViewChild('sentinel') sentinelRef?: ElementRef<HTMLDivElement>;
  private _observer: IntersectionObserver | null = null;

  // ── Skeleton ─────────────────────────────────────────────────────────────
  protected readonly skeletonRows = Array.from({ length: SKELETON_ROW_COUNT });

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngAfterViewInit(): void {
    if (!this.sentinelRef || typeof IntersectionObserver === 'undefined') return;

    this._observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry?.isIntersecting && this.hasMore() && !this.loading() && !this.isLoadingMore()) {
          this.loadMoreTriggered.emit();
        }
      },
      { root: null, rootMargin: '120px', threshold: 0 }
    );

    this._observer.observe(this.sentinelRef.nativeElement);
  }

  ngOnDestroy(): void {
    this._observer?.disconnect();
    this._observer = null;
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  /** Provider icon path keyed by paymentMethod/method value. */
  protected getProviderIconPath(method: string): string {
    const m = (method ?? '').toLowerCase().replace(/[\s_-]/g, '');
    if (m.includes('paypal')) {
      return 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-13.5-3h3.75a2.25 2.25 0 0 1 0 4.5H9l-.75 4.5';
    }
    if (m.includes('apple')) {
      return 'M16.5 10.5c0-1.5-1.5-2.5-3-2.25-1.5-.25-3 .75-3 2.25 0 2.25 1.5 6 3 7.5 1.5-1.5 3-5.25 3-7.5ZM12 5.25c.5-1 1.5-1.5 2.25-1.5';
    }
    if (m.includes('google')) {
      return 'M21 12a9 9 0 1 1-2.636-6.364M21 12h-9';
    }
    if (m.includes('bank') || m.includes('transfer')) {
      return 'M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M9 14v3m6-3v3';
    }
    // default: card
    return 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3M3.75 6h16.5a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5v-9a1.5 1.5 0 0 1 1.5-1.5Z';
  }

  protected getProviderLabel(method: string): string {
    if (!method) return 'Unknown';
    const clean = method.toLowerCase().replace(/[\s_-]/g, '');
    const labels: Record<string, string> = {
      card: 'Credit / Debit Card',
      creditcard: 'Credit Card',
      debitcard: 'Debit Card',
      paypal: 'PayPal',
      banktransfer: 'Bank Transfer',
      applepay: 'Apple Pay',
      googlepay: 'Google Pay',
    };
    return labels[clean] ?? method;
  }

  /** Formats an ISO date string into a clear date & time display format. */
  protected formatDate(iso: string): string {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return new Intl.DateTimeFormat('en-SG', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      }).format(d);
    } catch {
      return iso;
    }
  }

  protected formatAmount(amount: number, currency: string): string {
    try {
      return new Intl.NumberFormat('en-SG', {
        style: 'currency',
        currency: (currency || 'SGD').toUpperCase(),
        minimumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency?.toUpperCase() ?? 'SGD'} ${amount.toFixed(2)}`;
    }
  }

  protected trackByPaymentId(_: number, tx: IPaymentTransaction): number {
    return tx.paymentId;
  }

  /** Caps the stagger delay so very long lists don't produce a multi-second cascade. */
  protected getRowDelay(index: number): string {
    return `${Math.min(index, 24) * 18}ms`;
  }
}