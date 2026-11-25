
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type WidgetAccent = 'gold' | 'emerald' | 'ruby' | 'amber';
export type WidgetFormat = 'currency' | 'percent' | 'number';

export interface IWidgetTrend {
  /** Signed percentage change, e.g. +12.4 or -3.1. */
  value: number;
  direction: 'up' | 'down' | 'flat';
}

@Component({
  selector: 'aoms-revenue-summary-widget',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './revenue-summary-widget.component.html',
  styleUrl: './revenue-summary-widget.component.scss',
})
export class RevenueSummaryWidgetComponent {
  private readonly destroyRef = inject(DestroyRef);

  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly format = input<WidgetFormat>('currency');
  readonly currency = input<string>('SGD');
  readonly iconPath = input<string>('');
  readonly trend = input<IWidgetTrend | null>(null);
  readonly accent = input<WidgetAccent>('gold');
  readonly isLoading = input<boolean>(false);
  /** Optional caveat note (e.g. "requires audit data") shown as a small hint. */
  readonly caveat = input<string | null>(null);

  /** Animated display value — tweens toward `value()` on every change. */
  protected readonly displayValue = signal<number>(0);

  private _rafId: number | null = null;
  private _animStart = 0;
  private _animFrom = 0;
  private _animTo = 0;
  private readonly _animDurationMs = 900;

  constructor() {
    effect(() => {
      const target = this.value();
      if (this.isLoading()) return;
      this._startCountUp(target);
    });

    this.destroyRef.onDestroy(() => {
      if (this._rafId !== null) cancelAnimationFrame(this._rafId);
    });
  }

  // ── Computed ──────────────────────────────────────────────────────────
  protected readonly formattedValue = computed<string>(() => {
    const v = this.displayValue();
    switch (this.format()) {
      case 'percent':
        return `${v.toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat('en-SG', { maximumFractionDigits: 0 }).format(v);
      case 'currency':
      default:
        try {
          return new Intl.NumberFormat('en-SG', {
            style: 'currency',
            currency: (this.currency() || 'SGD').toUpperCase(),
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(v);
        } catch {
          return `${this.currency()} ${v.toFixed(2)}`;
        }
    }
  });

  protected readonly trendIconPath = computed<string>(() => {
    const dir = this.trend()?.direction;
    if (dir === 'up') return 'M8 7h8m0 0v8m0-8-9 9';
    if (dir === 'down') return 'M16 17H8m0 0v-8m0 8 9-9';
    return 'M5 12h14';
  });

  // ── Private: count-up animation ────────────────────────────────────────
  private _startCountUp(target: number): void {
    if (this._rafId !== null) cancelAnimationFrame(this._rafId);
    this._animFrom = this.displayValue();
    this._animTo = target;
    this._animStart = performance.now();

    const step = (now: number) => {
      const elapsed = now - this._animStart;
      const t = Math.min(1, elapsed / this._animDurationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      this.displayValue.set(this._animFrom + (this._animTo - this._animFrom) * eased);

      if (t < 1) {
        this._rafId = requestAnimationFrame(step);
      } else {
        this._rafId = null;
        this.displayValue.set(this._animTo);
      }
    };
    this._rafId = requestAnimationFrame(step);
  }
}