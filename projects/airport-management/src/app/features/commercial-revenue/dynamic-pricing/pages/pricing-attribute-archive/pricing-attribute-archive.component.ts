
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { DynamicPricingStore } from '../../store/dynamic-pricing.store';
import { ArchiveDataTableComponent } from '../../components/archive-data-table/archive-data-table.component';
import { ReactivateConfirmDialogComponent } from '../../components/reactivate-confirm-dialog/reactivate-confirm-dialog.component';
import { IContextualPricingAttributeDto } from '@shared-core';

@Component({
  selector: 'aoms-pricing-attribute-archive',
  standalone: true,
  imports: [
    CommonModule,
    ArchiveDataTableComponent,
    ReactivateConfirmDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pricing-attribute-archive.component.html',
  styleUrl: './pricing-attribute-archive.component.scss',
})
export class PricingAttributeArchiveComponent implements OnInit, OnDestroy {
  protected readonly store = inject(DynamicPricingStore);

  // ── Restore modal state ───────────────────────────────────────────────
  protected readonly showRestoreModal = signal<boolean>(false);
  protected readonly pendingRule = signal<IContextualPricingAttributeDto | null>(null);
  protected readonly pendingRestoreId = signal<number | null>(null);
  protected readonly pendingRuleType = signal<string>('');
  protected readonly pendingRuleTarget = signal<string>('');
  protected readonly pendingModifier = signal<number>(0);

  // ── Dark mode ─────────────────────────────────────────────────────────
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.loadArchivedRules();
  }

  ngOnDestroy(): void {
    this.store.clearArchiveState();
  }

  // ── Dark Mode Toggle ───────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Refresh ───────────────────────────────────────────────────────────
  protected onRefresh(): void {
    this.store.loadArchivedRules();
  }

  // ── Restore Flow ──────────────────────────────────────────────────────
  protected onRestoreRequested(rule: IContextualPricingAttributeDto): void {
    this.pendingRule.set(rule);
    this.pendingRestoreId.set(rule.attributeId);
    this.pendingRuleType.set(rule.attributeType ?? '');
    this.pendingRuleTarget.set(rule.targetValue ?? '');
    this.pendingModifier.set(rule.modifierPercentage ?? 0);
    this.store.clearArchiveError();
    this.showRestoreModal.set(true);
  }

  protected async onRestoreConfirmed(): Promise<void> {
    const id = this.pendingRestoreId();
    if (id == null) return;
    const ok = await this.store.restoreAttributeSet(id);
    if (ok) {
      this.showRestoreModal.set(false);
      this.pendingRestoreId.set(null);
      this.pendingRule.set(null);
    }
  }

  protected onRestoreCancelled(): void {
    this.showRestoreModal.set(false);
    this.pendingRestoreId.set(null);
    this.pendingRule.set(null);
    this.store.clearArchiveError();
  }

  // ── Navigation ────────────────────────────────────────────────────────
  protected onReturnToManager(): void {
    this.store.navigateToManagerFromArchive();
  }

  protected onGoToEditor(): void {
    this.store.navigateToEditor();
  }
}