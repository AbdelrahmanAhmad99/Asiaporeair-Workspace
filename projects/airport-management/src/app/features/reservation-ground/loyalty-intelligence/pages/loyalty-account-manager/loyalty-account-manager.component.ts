
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LoyaltyIntelligenceStore, LOYALTY_TIERS, LoyaltyTier, IPointsAdjustmentDraft } from '../../store/loyalty-intelligence.store';
import { KrisflyerTierBadgeComponent } from '../../components/krisflyer-tier-badge/krisflyer-tier-badge.component';
import { LoyaltySummaryCardComponent } from '../../components/loyalty-summary-card/loyalty-summary-card.component';
import { AccountStatusIndicatorComponent } from '../../components/account-status-indicator/account-status-indicator.component';
import { DeleteAccountModalComponent } from '../../components/delete-account-modal/delete-account-modal.component';
import { IFrequentFlyerDto } from '@shared-core';

@Component({
  selector: 'aoms-loyalty-account-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    KrisflyerTierBadgeComponent,
    LoyaltySummaryCardComponent,
    AccountStatusIndicatorComponent,
    DeleteAccountModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loyalty-account-manager.component.html',
  styleUrl: './loyalty-account-manager.component.scss',
})
export class LoyaltyAccountManagerComponent implements OnInit, OnDestroy {
  protected readonly store = inject(LoyaltyIntelligenceStore);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Modal states ───────────────────────────────────────────────────────
  protected readonly showTierModal = signal<boolean>(false);
  protected readonly showDeleteModal = signal<boolean>(false);
  protected readonly showPointsModal = signal<boolean>(false);
  protected readonly pendingTier = signal<string>('');
  protected readonly pointsDraft = signal<IPointsAdjustmentDraft>({ delta: 0, reason: '' });

  /** Available tiers for the tier upgrade selector. */
  protected readonly tierOptions = LOYALTY_TIERS;

  // ── Debounce for card number search ───────────────────────────────────
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.searchMembers();
  }

  ngOnDestroy(): void {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this.store.teardown();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected goToPointsDesk(): void {
    this.store.navigateToPointsDesk();
  }

  // ── Search ─────────────────────────────────────────────────────────────
  protected onCardNumberInput(value: string): void {
    this.store.updateFilter({ cardNumberContains: value });
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this.store.searchMembers();
    }, 300);
  }

  protected onLevelFilterChange(level: string): void {
    this.store.searchMembers({ level });
  }

  protected onMinPointsChange(val: string): void {
    this.store.updateFilter({ minPoints: val ? +val : null });
  }

  protected onMaxPointsChange(val: string): void {
    this.store.updateFilter({ maxPoints: val ? +val : null });
  }

  protected onSearchSubmit(): void {
    this.store.searchMembers();
  }

  protected onClearSearch(): void {
    this.store.clearSearch();
    this.store.searchMembers();
  }

  protected onIncludeDeletedToggle(): void {
    this.store.searchMembers({ includeDeleted: !this.store.searchFilter().includeDeleted });
  }

  // ── Account Selection ──────────────────────────────────────────────────
  protected onAccountSelected(account: IFrequentFlyerDto): void {
    this.store.selectAccount(account);
    this.showTierModal.set(false);
    this.showPointsModal.set(false);
    this.store.clearActionState();
  }

  protected onAccountDeselected(): void {
    this.store.clearSelection();
  }

  // ── Tier Modal ─────────────────────────────────────────────────────────
  protected onOpenTierModal(): void {
    const current = this.store.selectedAccount()?.level ?? 'Classic';
    this.pendingTier.set(current);
    this.store.clearActionState();
    this.showTierModal.set(true);
  }

  protected onTierConfirmed(): void {
    const account = this.store.selectedAccount();
    const tier = this.pendingTier();
    if (!account || !tier || tier === account.level) {
      this.showTierModal.set(false);
      return;
    }
    this.showTierModal.set(false);
    this.store.changeMemberTier(account.flyerId, tier);
  }

  protected onTierCancelled(): void {
    this.showTierModal.set(false);
  }

  protected onPendingTierChange(tier: string): void {
    this.pendingTier.set(tier);
  }

  // ── Points Modal ───────────────────────────────────────────────────────
  protected onOpenPointsModal(): void {
    this.pointsDraft.set({ delta: 0, reason: '' });
    this.store.clearActionState();
    this.showPointsModal.set(true);
  }

  protected onPointsDeltaChange(val: string): void {
    this.pointsDraft.update(d => ({ ...d, delta: val ? +val : 0 }));
  }

  protected onPointsReasonChange(val: string): void {
    this.pointsDraft.update(d => ({ ...d, reason: val }));
  }

  protected onPointsConfirmed(): void {
    const account = this.store.selectedAccount();
    if (!account) return;
    this.showPointsModal.set(false);
    this.store.adjustPoints(account.flyerId, this.pointsDraft());
  }

  protected onPointsCancelled(): void {
    this.showPointsModal.set(false);
  }

  // ── Delete Modal ───────────────────────────────────────────────────────
  protected onOpenDeleteModal(): void {
    this.store.clearActionState();
    this.showDeleteModal.set(true);
  }

  protected onDeleteConfirmed(): void {
    const account = this.store.selectedAccount();
    if (!account) return;
    this.showDeleteModal.set(false);
    this.store.removeAccount(account.flyerId);
  }

  protected onDeleteCancelled(): void {
    this.showDeleteModal.set(false);
  }

  // ── Pagination ─────────────────────────────────────────────────────────
  protected onNextPage(): void { this.store.nextPage(); }
  protected onPrevPage(): void { this.store.prevPage(); }

  // ── Dismiss toasts ─────────────────────────────────────────────────────
  protected onDismissSuccess(): void { this.store.clearActionState(); }
  protected onDismissError(): void { this.store.clearActionState(); }

  protected onRetry(): void {
    this.store.searchMembers();
  }

  // ── Track fn ──────────────────────────────────────────────────────────
  protected trackByFlyerId(_: number, a: IFrequentFlyerDto): number {
    return a.flyerId;
  }
}