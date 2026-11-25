

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'aoms-loyalty-summary-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loyalty-summary-card.component.html',
  styleUrl: './loyalty-summary-card.component.scss',
})
export class LoyaltySummaryCardComponent {
  readonly points = input.required<number>();
  readonly tier = input.required<string>();
  readonly cardNumber = input.required<string>();

  readonly formattedPoints = computed<string>(
    () => this.points().toLocaleString('en-US')
  );

  // Estimate miles from points — 1 point ≈ 1.5 miles (illustrative)
  readonly estimatedMiles = computed<string>(
    () => Math.round(this.points() * 1.5).toLocaleString('en-US')
  );

  // Next tier thresholds
  readonly tierThreshold = computed<number | null>(() => {
    const t = (this.tier() ?? '').toLowerCase();
    if (t === 'classic') return 10000;
    if (t === 'silver') return 25000;
    if (t === 'gold') return 50000;
    return null; // Elite — top tier
  });

  readonly pointsToNextTier = computed<number | null>(() => {
    const threshold = this.tierThreshold();
    if (!threshold) return null;
    return Math.max(0, threshold - this.points());
  });

  readonly progressToNextTier = computed<number>(() => {
    const threshold = this.tierThreshold();
    if (!threshold) return 100;
    return Math.min(100, Math.round((this.points() / threshold) * 100));
  });
}