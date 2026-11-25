

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IMarketComparisonData,
  PricingHealthStatus,
} from '../../store/ancillary-catalog.store';

@Component({
  selector: 'aoms-catalog-status-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './catalog-status-bar.component.html',
  styleUrl: './catalog-status-bar.component.scss',
})
export class CatalogStatusBarComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly marketData = input<IMarketComparisonData | null>(null);
  readonly healthStatus = input<PricingHealthStatus>('Unknown');
  readonly loading = input<boolean>(false);
  readonly currencySymbol = input<string>('S$');

  // ── Computed: Price Comparison ─────────────────────────────────────────
  readonly priceDeltaLabel = computed<string>(() => {
    const data = this.marketData();
    if (!data) return '—';
    const sign = data.percentDiff > 0 ? '+' : '';
    return `${sign}${data.percentDiff.toFixed(1)}%`;
  });

  readonly priceDeltaDirection = computed<'up' | 'down' | 'flat'>(() => {
    const data = this.marketData();
    if (!data) return 'flat';
    if (data.percentDiff > 1) return 'up';
    if (data.percentDiff < -1) return 'down';
    return 'flat';
  });

  /** Bar fill width (%) for the current-vs-average comparison track. */
  readonly priceCompareFill = computed<number>(() => {
    const data = this.marketData();
    if (!data || data.categoryAverage <= 0) return 0;
    // Scale so that 2x category average = 100% fill, capped.
    const ratio = data.currentPrice / (data.categoryAverage * 2);
    return Math.min(100, Math.max(0, ratio * 100));
  });

  /** Marker position (%) representing the category average on the track. */
  readonly categoryAverageMarkerPos = computed<number>(() => 50); // average = midpoint of the 2x scale

  // ── Computed: Profitability Index Meter ───────────────────────────────
  readonly profitabilityIndex = computed<number>(() => this.marketData()?.profitabilityIndex ?? 0);

  readonly profitabilityTier = computed<'low' | 'mid' | 'high'>(() => {
    const idx = this.profitabilityIndex();
    if (idx >= 70) return 'high';
    if (idx >= 40) return 'mid';
    return 'low';
  });

  // ── Computed: Popularity Rank ──────────────────────────────────────────
  readonly popularityPercentile = computed<number>(() => {
    const data = this.marketData();
    if (!data || data.totalInCategory <= 0) return 0;
    // Rank 1 (best) = 100th percentile
    return Math.round(((data.totalInCategory - data.popularityRank + 1) / data.totalInCategory) * 100);
  });

  // ── Health status visual mapping ──────────────────────────────────────
  readonly healthStatusClass = computed<string>(() => {
    switch (this.healthStatus()) {
      case 'Optimized': return 'csb-health--optimized';
      case 'Under-priced': return 'csb-health--under';
      case 'Over-priced': return 'csb-health--over';
      default: return 'csb-health--unknown';
    }
  });

  readonly healthStatusIconPath = computed<string>(() => {
    switch (this.healthStatus()) {
      case 'Optimized':
        return 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z';
      case 'Under-priced':
        return 'M12 4.5v15m7.5-7.5h-15'; // upward opportunity (price can rise)
      case 'Over-priced':
        return 'M19.5 12h-15'; // downward adjustment suggested
      default:
        return 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z';
    }
  });

  protected fmt(value: number): string {
    return new Intl.NumberFormat('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }
}