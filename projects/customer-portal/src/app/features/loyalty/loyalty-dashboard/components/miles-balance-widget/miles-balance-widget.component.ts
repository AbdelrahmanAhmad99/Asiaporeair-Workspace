// ============================================================================
// miles-balance-widget.component.ts
// Asiaporeair | Dumb Component — Miles/Points Balance Ring Widget
//
// Draws an SVG circular progress ring that fills up to `progressPercent`.
// Accepts:
//   milesBalance      → Total award points / miles
//   milesExpiringSoon → Points expiring within 90 days
//   progressPercent   → 0-100 fill percentage (toward next tier)
//   isLoading         → Drives shimmer skeleton
// ============================================================================
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-miles-balance-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './miles-balance-widget.component.html',
  styleUrl: './miles-balance-widget.component.scss',
})
export class MilesBalanceWidgetComponent {

  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly milesBalance      = input<number>(0);
  readonly milesExpiringSoon = input<number>(0);
  readonly progressPercent   = input<number>(0);
  readonly isLoading         = input<boolean>(false);

  // ── SVG ring geometry ─────────────────────────────────────────────────────
  readonly radius     = 88;   // px — radius of the progress ring circle
  readonly strokeWidth = 10;  // px — ring stroke width

  readonly circumference = computed<number>(
    () => 2 * Math.PI * this.radius
  );

  /** Dash offset to drive the SVG ring fill animation. */
  readonly dashOffset = computed<number>(() => {
    const pct = Math.min(100, Math.max(0, this.progressPercent()));
    return this.circumference() * (1 - pct / 100);
  });

  // ── Formatting helpers ────────────────────────────────────────────────────
  get formattedBalance(): string {
    return this.milesBalance().toLocaleString('en-SG');
  }

  get formattedExpiring(): string {
    return this.milesExpiringSoon().toLocaleString('en-SG');
  }

  get hasExpiring(): boolean {
    return this.milesExpiringSoon() > 0;
  }
}
