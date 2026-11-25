
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  LoyaltyIntelligenceStore,
  IAdjustmentFormData,
  AdjustmentType,
} from '../../store/loyalty-intelligence.store';
import { ManualAdjustmentFormComponent } from '../../components/manual-adjustment-form/manual-adjustment-form.component';
import { PointsHistoryGridComponent } from '../../components/points-history-grid/points-history-grid.component';
import { KrisflyerTierBadgeComponent } from '../../components/krisflyer-tier-badge/krisflyer-tier-badge.component';
import { AccountStatusIndicatorComponent } from '../../components/account-status-indicator/account-status-indicator.component';

@Component({
  selector: 'aoms-point-adjustment-desk',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ManualAdjustmentFormComponent,
    PointsHistoryGridComponent,
    KrisflyerTierBadgeComponent,
    AccountStatusIndicatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './point-adjustment-desk.component.html',
  styleUrl: './point-adjustment-desk.component.scss',
})
export class PointAdjustmentDeskComponent implements OnInit, OnDestroy {
  protected readonly store = inject(LoyaltyIntelligenceStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  /** Manual userId lookup field (when no route param) */
  protected readonly manualUserId = signal<string>('');

  /** Booking points reconciliation field */
  protected readonly bookingIdInput = signal<string>('');

  private userId: number | null = null;

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('userId');
    if (param) {
      this.userId = parseInt(param, 10);
      this.store.loadMemberForAdjustment(this.userId);
    }
  }

  ngOnDestroy(): void {
    this.store.teardownAdjustmentDesk();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected goToAccountManager(): void {
    this.router.navigate([
      '/aoms/reservation-ground-handling/loyalty-intelligence/account-manager',
    ]);
  }

  // ── Manual lookup ─────────────────────────────────────────────────────
  protected onManualUserIdChange(val: string): void {
    this.manualUserId.set(val);
  }

  protected onManualLookup(): void {
    const id = parseInt(this.manualUserId(), 10);
    if (!id || id <= 0) return;
    this.userId = id;
    this.store.loadMemberForAdjustment(id);
    // Update URL without navigation to make it bookmarkable
    this.router.navigate(
      ['/aoms/reservation-ground-handling/loyalty-intelligence/points-desk', id],
      { replaceUrl: true }
    );
  }

  protected onManualKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.onManualLookup();
  }

  // ── Form events from ManualAdjustmentFormComponent ─────────────────────
  protected onAdjustmentPreview(data: { type: AdjustmentType; amount: number }): void {
    this.store.previewBalance(data.type, data.amount);
  }

  protected onAdjustmentSubmitted(data: IAdjustmentFormData): void {
    this.store.executeManualAdjustment(data);
  }

  protected onFormReset(): void {
    this.store.resetBalancePreview();
    this.store.clearAdjustmentState();
  }

  // ── Booking points ─────────────────────────────────────────────────────
  protected onBookingIdChange(val: string): void {
    this.bookingIdInput.set(val);
  }

  protected onProcessBookingPoints(): void {
    const id = parseInt(this.bookingIdInput(), 10);
    if (!id || id <= 0) {
      return;
    }
    this.store.processBookingPoints(id);
    this.bookingIdInput.set('');
  }

  protected onBookingKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.onProcessBookingPoints();
  }

  // ── Error / success dismiss ────────────────────────────────────────────
  protected onDismissState(): void {
    this.store.clearAdjustmentState();
  }

  // ── Retry ─────────────────────────────────────────────────────────────
  protected onRetry(): void {
    if (this.userId) this.store.loadMemberForAdjustment(this.userId);
  }
}