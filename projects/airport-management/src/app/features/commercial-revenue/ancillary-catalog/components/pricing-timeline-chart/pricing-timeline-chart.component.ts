
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IPricingTimelinePoint } from '../../store/ancillary-catalog.store';

// ── SVG viewport constants ───────────────────────────────────────────────
const VB_WIDTH = 640;
const VB_HEIGHT = 220;
const PAD_X = 36;
const PAD_TOP = 24;
const PAD_BOTTOM = 36;

interface IPlottedPoint {
  x: number;
  y: number;
  label: string;
  price: number;
  isCurrent: boolean;
}

@Component({
  selector: 'aoms-pricing-timeline-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pricing-timeline-chart.component.html',
  styleUrl: './pricing-timeline-chart.component.scss',
})
export class PricingTimelineChartComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly data = input<IPricingTimelinePoint[]>([]);
  readonly loading = input<boolean>(false);
  readonly currencySymbol = input<string>('S$');

  // ── Viewport constants exposed to the template ────────────────────────
  protected readonly vbWidth = VB_WIDTH;
  protected readonly vbHeight = VB_HEIGHT;

  // ── Computed: price domain ─────────────────────────────────────────────
  private readonly _priceRange = computed<{ min: number; max: number }>(() => {
    const points = this.data();
    if (!points.length) return { min: 0, max: 1 };

    const prices = points.map(p => p.price);
    let min = Math.min(...prices);
    let max = Math.max(...prices);

    // Avoid a degenerate flat-line domain
    if (min === max) {
      min = min * 0.9;
      max = max * 1.1;
    }

    // Add 10% headroom/footroom for visual breathing room
    const span = max - min;
    return {
      min: Math.max(0, min - span * 0.15),
      max: max + span * 0.15,
    };
  });

  // ── Computed: plotted points ───────────────────────────────────────────
  readonly plottedPoints = computed<IPlottedPoint[]>(() => {
    const points = this.data();
    if (!points.length) return [];

    const { min, max } = this._priceRange();
    const range = max - min || 1;
    const innerWidth = VB_WIDTH - PAD_X * 2;
    const innerHeight = VB_HEIGHT - PAD_TOP - PAD_BOTTOM;
    const step = points.length > 1 ? innerWidth / (points.length - 1) : 0;

    return points.map((p, i) => {
      const x = PAD_X + step * i;
      const normalized = (p.price - min) / range;
      const y = PAD_TOP + innerHeight - normalized * innerHeight;
      return {
        x,
        y,
        label: p.label,
        price: p.price,
        isCurrent: i === points.length - 1,
      };
    });
  });

  // ── Computed: SVG path strings ─────────────────────────────────────────
  /** Smooth-ish polyline path for the price trend. */
  readonly linePath = computed<string>(() => {
    const pts = this.plottedPoints();
    if (!pts.length) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  });

  /** Closed area path beneath the line, for the subtle gradient fill. */
  readonly areaPath = computed<string>(() => {
    const pts = this.plottedPoints();
    if (!pts.length) return '';
    const baseline = VB_HEIGHT - PAD_BOTTOM;
    const first = pts[0];
    const last = pts[pts.length - 1];
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
    return `${line} L ${last.x.toFixed(2)} ${baseline} L ${first.x.toFixed(2)} ${baseline} Z`;
  });

  // ── Computed: Y-axis gridline values ───────────────────────────────────
  readonly gridLines = computed<{ y: number; value: number }[]>(() => {
    const { min, max } = this._priceRange();
    const innerHeight = VB_HEIGHT - PAD_TOP - PAD_BOTTOM;
    const steps = 3;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const fraction = i / steps;
      const value = max - (max - min) * fraction;
      const y = PAD_TOP + innerHeight * fraction;
      return { y, value };
    });
  });

  // ── Computed: trend summary ─────────────────────────────────────────────
  readonly trendDirection = computed<'up' | 'down' | 'flat'>(() => {
    const pts = this.data();
    if (pts.length < 2) return 'flat';
    const first = pts[0].price;
    const last = pts[pts.length - 1].price;
    const diff = ((last - first) / (first || 1)) * 100;
    if (diff > 1) return 'up';
    if (diff < -1) return 'down';
    return 'flat';
  });

  readonly trendPercentLabel = computed<string>(() => {
    const pts = this.data();
    if (pts.length < 2) return '0.0%';
    const first = pts[0].price;
    const last = pts[pts.length - 1].price;
    const diff = ((last - first) / (first || 1)) * 100;
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff.toFixed(1)}%`;
  });

  protected fmtPrice(value: number): string {
    return new Intl.NumberFormat('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }
}