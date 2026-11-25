// ============================================================================
// loyalty.store.ts
// Asiaporeair | Signals-Based Store — Frequent Flyer & Loyalty Programme
//
// Strict store boundary: used EXCLUSIVELY by the frequent-flyer/ feature module.
//   
// Signals:
//   currentTier          → The user's current membership tier (e.g. "Gold")
//   milesBalance         → Total accumulated award points / miles
//   milesExpiringSoon    → Points expiring within 90 days (derived from profile)
//   pointsToNextTier     → Gap between current points and next tier threshold
//   loyaltyProfile       → Raw IFrequentFlyerDto from the API
//   isLoadingLoyalty     → Shimmer-skeleton gating flag
//   loyaltyError         → Error string if the API call fails
// ============================================================================
import { Injectable, signal, computed } from '@angular/core';
import { IFrequentFlyerDto } from '@shared-core';

// ── Tier configuration ─────────────────────────────────────────────────────────
export interface ITierConfig {
  name: string;
  minPoints: number;
  maxPoints: number;        // Upper bound (exclusive); Infinity for top tier
  nextTierName: string | null;
  benefits: string[];
}

/**
 * Ordered tier ladder.  Points thresholds are illustrative — replace with
 * values from remote config / back-end when available.
 */
export const TIER_LADDER: ITierConfig[] = [
  {
    name: 'Member',
    minPoints: 0,
    maxPoints: 10_000,
    nextTierName: 'Silver',
    benefits: [
      'Earn 1 mile per SGD spent',
      'Access to member-only fares',
      'Priority check-in eligibility',
    ],
  },
  {
    name: 'Silver',
    minPoints: 10_000,
    maxPoints: 50_000,
    nextTierName: 'Gold',
    benefits: [
      'Earn 1.5 miles per SGD spent',
      'Complimentary lounge access (2× per year)',
      'Priority boarding',
      'Extra baggage allowance (5 kg)',
    ],
  },
  {
    name: 'Gold',
    minPoints: 50_000,
    maxPoints: 120_000,
    nextTierName: 'Platinum',
    benefits: [
      'Earn 2 miles per SGD spent',
      'Unlimited lounge access',
      'Priority boarding & check-in',
      'Extra baggage allowance (10 kg)',
      'Seat upgrade vouchers (4× per year)',
    ],
  },
  {
    name: 'Platinum',
    minPoints: 120_000,
    maxPoints: Infinity,
    nextTierName: null,
    benefits: [
      'Earn 3 miles per SGD spent',
      'Unlimited lounge access for +1 guest',
      'Guaranteed seat availability',
      'Dedicated concierge line',
      'Annual companion ticket',
      'Complimentary suite upgrade (when available)',
    ],
  },
];

// ── Helper ────────────────────────────────────────────────────────────────────
function getTierConfig(tierName: string): ITierConfig {
  return (
    TIER_LADDER.find(t => t.name.toLowerCase() === tierName.toLowerCase()) ??
    TIER_LADDER[0]
  );
}

@Injectable({ providedIn: 'root' })
export class LoyaltyStore {

  // ── Raw profile ────────────────────────────────────────────────────────────
  readonly loyaltyProfile = signal<IFrequentFlyerDto | null>(null);

  // ── Loading & error flags ─────────────────────────────────────────────────
  readonly isLoadingLoyalty = signal<boolean>(false);
  readonly loyaltyError = signal<string | null>(null);

  // ── Derived scalar signals (kept writable so callers can override) ─────────
  readonly currentTier = signal<string>('Member');
  readonly milesBalance = signal<number>(0);


  readonly milesExpiringSoon = signal<number>(0);

  readonly pointsToNextTier = signal<number>(0);

  // ── Computed selectors ────────────────────────────────────────────────────
  /** Full config for the user's active tier. */
  readonly currentTierConfig = computed<ITierConfig>(() =>
    getTierConfig(this.currentTier())
  );

  /** Full config for the next tier (null if already Platinum). */
  readonly nextTierConfig = computed<ITierConfig | null>(() => {
    const next = this.currentTierConfig().nextTierName;
    return next ? getTierConfig(next) : null;
  });

  /** Progress as a 0–100 percentage toward the next tier ceiling. */
  readonly tierProgressPercent = computed<number>(() => {
    const cfg = this.currentTierConfig();
    if (cfg.maxPoints === Infinity) return 100;
    const range = cfg.maxPoints - cfg.minPoints;
    const progress = this.milesBalance() - cfg.minPoints;
    return Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  });

  /** True once we have profile data loaded successfully. */
  readonly hasProfile = computed<boolean>(() => this.loyaltyProfile() !== null);

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Called immediately before the API request is dispatched. */
  beginLoadingLoyalty(): void {
    this.isLoadingLoyalty.set(true);
    this.loyaltyError.set(null);
  }

  /**
   * Atomic action: stores the raw DTO and derives all scalar signals from it.
   * Called by LoyaltyDashboardComponent once getMyAccount() resolves.
   */
  setLoyaltyProfile(dto: IFrequentFlyerDto): void {
    this.loyaltyProfile.set(dto);
    this.currentTier.set(dto.level ?? 'Member');
    this.milesBalance.set(dto.awardPoints ?? 0);

    // Heuristic expiry (15 %) — replace when API supports it
    this.milesExpiringSoon.set(Math.floor((dto.awardPoints ?? 0) * 0.15));

    // Gap to next tier
    const cfg = getTierConfig(dto.level ?? 'Member');
    const gap =
      cfg.maxPoints === Infinity
        ? 0
        : Math.max(0, cfg.maxPoints - (dto.awardPoints ?? 0));
    this.pointsToNextTier.set(gap);

    this.isLoadingLoyalty.set(false);
    this.loyaltyError.set(null);
  }

  /** Records a failure so the dashboard can render an error state. */
  setLoyaltyError(message: string): void {
    this.loyaltyError.set(message);
    this.isLoadingLoyalty.set(false);
  }

  /** Full reset — used on logout. */
  resetLoyaltyState(): void {
    this.loyaltyProfile.set(null);
    this.currentTier.set('Member');
    this.milesBalance.set(0);
    this.milesExpiringSoon.set(0);
    this.pointsToNextTier.set(0);
    this.isLoadingLoyalty.set(false);
    this.loyaltyError.set(null);
  }
}
