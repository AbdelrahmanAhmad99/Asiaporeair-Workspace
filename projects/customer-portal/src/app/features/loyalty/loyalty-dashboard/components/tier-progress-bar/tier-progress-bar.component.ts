// ============================================================================
// tier-progress-bar.component.ts
// Asiaporeair | Dumb Component — Tier Upgrade Progress Bar
//
// Accepts:
//   currentTier    → Name of the user's present tier
//   nextTier       → Name of the target upgrade tier (null if at top)
//   currentPoints  → Absolute points the user holds in this tier window
//   targetPoints   → Absolute points threshold for the next tier
//   progressPct    → Pre-computed 0-100 percent (from store computed)
//   isLoading      → Drives shimmer skeleton
// ============================================================================
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tier-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tier-progress-bar.component.html',
  styleUrl: './tier-progress-bar.component.scss',
})
export class TierProgressBarComponent {

  // ── Inputs ────────────────────────────────────────────────────────────────
  readonly currentTier   = input<string>('Member');
  readonly nextTier      = input<string | null>(null);
  readonly currentPoints = input<number>(0);
  readonly targetPoints  = input<number>(10_000);
  readonly progressPct   = input<number>(0);
  readonly isLoading     = input<boolean>(false);

  // ── Computed ──────────────────────────────────────────────────────────────
  readonly isTopTier = computed<boolean>(() => this.nextTier() === null);

  readonly safeProgressPct = computed<number>(() =>
    Math.min(100, Math.max(0, this.progressPct()))
  );

  readonly pointsRemaining = computed<number>(() =>
    Math.max(0, this.targetPoints() - this.currentPoints())
  );

  // ── Helpers ────────────────────────────────────────────────────────────────
  get formattedCurrent(): string {
    return this.currentPoints().toLocaleString('en-SG');
  }

  get formattedTarget(): string {
    return this.targetPoints().toLocaleString('en-SG');
  }

  get formattedRemaining(): string {
    return this.pointsRemaining().toLocaleString('en-SG');
  }
}
