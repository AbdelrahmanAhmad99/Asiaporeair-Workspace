
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IExecutiveRevenuePoint } from '../../store/financial-hub.store';

const VB_WIDTH = 680;
const VB_HEIGHT = 260;
const PAD_X = 44;
const PAD_TOP = 24;
const PAD_BOTTOM = 40;

interface IPlottedRevenuePoint {
  x: number;
  y: number;
  date: string;
  label: string;
  totalRevenue: number;
  isLast: boolean;
}

@Component({
  selector: 'aoms-revenue-performance-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './revenue-performance-chart.component.html',
  styleUrl: './revenue-performance-chart.component.scss',
})
export class RevenuePerformanceChartComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly data = input<IExecutiveRevenuePoint[]>([]);
  readonly loading = input<boolean>(false);
  readonly currencySymbol = input<string>('S$');
  readonly rangeLabel = input<string>('');

  // ── Viewport constants exposed to the template ────────────────────────
  protected readonly vbWidth = VB_WIDTH;
  protected readonly vbHeight = VB_HEIGHT;

  // ── Computed: revenue domain ──────────────────────────────────────────
  private readonly _revenueRange = computed<{ min: number; max: number }>(() => {
    const points = this.data();
    if (!points.length) return { min: 0, max: 1 };

    const values = points.map(p => p.totalRevenue);
    const min = Math.min(0, ...values); // always anchor the floor at 0 for revenue
    let max = Math.max(...values);
    if (max === min) max = min + 1;

    const span = max - min;
    return { min, max: max + span * 0.12 };
  });

  // ── Computed: label sparsity (avoid overlapping X-axis labels) ─────────
  private readonly _labelStep = computed<number>(() => {
    const n = this.data().length;
    if (n <= 8) return 1;
    if (n <= 16) return 2;
    if (n <= 24) return 4;
    return 5;
  });

  // ── Computed: plotted points ───────────────────────────────────────────
  readonly plottedPoints = computed<IPlottedRevenuePoint[]>(() => {
    const points = this.data();
    if (!points.length) return [];

    const { min, max } = this._revenueRange();
    const range = max - min || 1;
    const innerWidth = VB_WIDTH - PAD_X * 2;
    const innerHeight = VB_HEIGHT - PAD_TOP - PAD_BOTTOM;
    const step = points.length > 1 ? innerWidth / (points.length - 1) : 0;

    return points.map((p, i) => {
      const x = PAD_X + step * i;
      const normalized = (p.totalRevenue - min) / range;
      const y = PAD_TOP + innerHeight - normalized * innerHeight;
      return {
        x,
        y,
        date: p.date,
        label: this._formatShortDate(p.date),
        totalRevenue: p.totalRevenue,
        isLast: i === points.length - 1,
      };
    });
  });

  /** Only every Nth point renders an X-axis label, per `_labelStep`. */
  readonly visibleLabelPoints = computed<IPlottedRevenuePoint[]>(() => {
    const step = this._labelStep();
    return this.plottedPoints().filter((_, i) => i % step === 0 || this.plottedPoints()[i].isLast);
  });

  // ── Computed: SVG paths ─────────────────────────────────────────────────
  readonly linePath = computed<string>(() => {
    const pts = this.plottedPoints();
    if (!pts.length) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  });

  readonly areaPath = computed<string>(() => {
    const pts = this.plottedPoints();
    if (!pts.length) return '';
    const baseline = VB_HEIGHT - PAD_BOTTOM;
    const first = pts[0];
    const last = pts[pts.length - 1];
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
    return `${line} L ${last.x.toFixed(2)} ${baseline} L ${first.x.toFixed(2)} ${baseline} Z`;
  });

  // ── Computed: Y-axis gridlines ──────────────────────────────────────────
  readonly gridLines = computed<{ y: number; value: number }[]>(() => {
    const { min, max } = this._revenueRange();
    const innerHeight = VB_HEIGHT - PAD_TOP - PAD_BOTTOM;
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const fraction = i / steps;
      const value = max - (max - min) * fraction;
      const y = PAD_TOP + innerHeight * fraction;
      return { y, value };
    });
  });

  // ── Computed: summary stats for the header ─────────────────────────────
  readonly peakDay = computed<IExecutiveRevenuePoint | null>(() => {
    const points = this.data();
    if (!points.length) return null;
    return points.reduce((max, p) => (p.totalRevenue > max.totalRevenue ? p : max), points[0]);
  });

  readonly averageDailyRevenue = computed<number>(() => {
    const points = this.data();
    if (!points.length) return 0;
    return points.reduce((sum, p) => sum + p.totalRevenue, 0) / points.length;
  });

  // ── Helpers ────────────────────────────────────────────────────────────
  protected fmtCurrency(value: number): string {
    return new Intl.NumberFormat('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  }

  private _formatShortDate(iso: string): string {
    try {
      return new Intl.DateTimeFormat('en-SG', { day: '2-digit', month: 'short' }).format(new Date(iso));
    } catch {
      return iso;
    }
  }
}