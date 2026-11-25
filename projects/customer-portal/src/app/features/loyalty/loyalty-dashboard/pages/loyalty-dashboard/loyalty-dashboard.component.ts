// ============================================================================
// loyalty-dashboard.component.ts (Smart / Routed Page Component)
// Asiaporeair | Frequent Flyer — Loyalty & Points Dashboard
//
// Responsibilities:
//   1. Inject FrequentFlyerService and LoyaltyStore
//   2. Call getMyAccount() on init; push result into LoyaltyStore via signals
//   3. Expose store signals to the template (no internal state duplication)
//   4. Provide router navigation helpers for quick-link grid
// ============================================================================
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Shared service + store
import { FrequentFlyerService } from '@shared-core';
import { LoyaltyStore } from '../../../store/loyalty.store';

// Dumb child components
import { TierStatusCardComponent }   from '../../components/tier-status-card/tier-status-card.component';
import { MilesBalanceWidgetComponent } from '../../components/miles-balance-widget/miles-balance-widget.component';
import { TierProgressBarComponent }  from '../../components/tier-progress-bar/tier-progress-bar.component';

@Component({
  selector: 'app-loyalty-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TierStatusCardComponent,
    MilesBalanceWidgetComponent,
    TierProgressBarComponent,
  ],
  templateUrl: './loyalty-dashboard.component.html',
  styleUrl:    './loyalty-dashboard.component.scss',
})
export class LoyaltyDashboardComponent implements OnInit {

  // ── DI ───────────────────────────────────────────────────────────────────
  private readonly ffService = inject(FrequentFlyerService);
  private readonly router    = inject(Router);
  readonly store             = inject(LoyaltyStore);
  protected readonly Infinity = Infinity;

  // ── Quick-link navigation grid ────────────────────────────────────────────
  readonly quickLinks = [
    {
      id      : 'ql-history',
      label   : 'Points History',
      icon    : 'history',
      route   : '../points-history',
      accent  : '#B68F24',
    },
    {
      id      : 'ql-benefits',
      label   : 'Tier Benefits',
      icon    : 'star',
      route   : '../tier-benefits',
      accent  : '#E2C780',
    },
    {
      id      : 'ql-redeem',
      label   : 'Redeem Miles',
      icon    : 'gift',
      route   : '../redeem-miles',
      accent  : '#B68F24',
    },
  ] as const;

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Only fetch if we don't already have a profile cached in the store
    if (!this.store.hasProfile()) {
      this.loadLoyaltyProfile();
    }
  }

  // ── API call ──────────────────────────────────────────────────────────────
  private loadLoyaltyProfile(): void {
    this.store.beginLoadingLoyalty();

    this.ffService.getMyAccount().subscribe({
      next : (dto) => this.store.setLoyaltyProfile(dto),
      error: (err) => {
        const msg =
          err?.error?.message ??
          'We were unable to retrieve your loyalty profile. Please try again.';
        this.store.setLoyaltyError(msg);
      },
    });
  }

  // ── Navigation helpers ────────────────────────────────────────────────────
  navigateTo(route: string): void {
    this.router.navigate([route], { relativeTo: undefined });
  }

  retryLoad(): void {
    this.loadLoyaltyProfile();
  }
}
