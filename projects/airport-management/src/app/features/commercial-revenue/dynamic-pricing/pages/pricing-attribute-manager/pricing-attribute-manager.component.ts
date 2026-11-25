

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { DynamicPricingStore, IPricingSearchCriteria } from '../../store/dynamic-pricing.store';
import { AttributeGridComponent } from '../../components/attribute-grid/attribute-grid.component';
import { DeactivationConfirmDialogComponent } from '../../components/deactivation-confirm-dialog/deactivation-confirm-dialog.component';
import { IContextualPricingAttributeDto } from '@shared-core';

@Component({
  selector: 'aoms-pricing-attribute-manager',
  standalone: true,
  imports: [
    CommonModule,
    AttributeGridComponent,
    DeactivationConfirmDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pricing-attribute-manager.component.html',
  styleUrl: './pricing-attribute-manager.component.scss',
})
export class PricingAttributeManagerComponent implements OnInit, OnDestroy {
  protected readonly store = inject(DynamicPricingStore);

  // ── Deactivation modal state ──────────────────────────────────────────
  protected readonly showDeactivateModal = signal<boolean>(false);
  protected readonly pendingDeactivateId = signal<number | null>(null);
  protected readonly pendingDeactivateSummary = signal<string>('');

  // ── Dark mode ─────────────────────────────────────────────────────────
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.loadActiveRules();
  }

  ngOnDestroy(): void {
    this.store.clearActionState();
  }

  // ── Dark Mode Toggle ───────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Filter & Pagination ────────────────────────────────────────────────
  protected onFiltersChanged(criteria: Partial<IPricingSearchCriteria>): void {
    this.store.searchRules(criteria);
  }

  protected onFiltersReset(): void {
    this.store.resetFilters();
  }

  protected onNextPage(): void { this.store.nextPage(); }
  protected onPrevPage(): void { this.store.prevPage(); }
  protected onPageChanged(page: number): void { this.store.goToPage(page); }

  // ── Row Actions ────────────────────────────────────────────────────────
  protected onEditRule(attributeId: number): void {
    this.store.navigateToEditor(attributeId);
  }

  protected onSimulateRule(rule: IContextualPricingAttributeDto): void {
    this.store.navigateToSimulationLab();
  }

  protected onDeactivateRequested(rule: IContextualPricingAttributeDto): void {
    this.pendingDeactivateId.set(rule.attributeId);
    // this.pendingDeactivateSummary.set(
    //   `${rule.attributeName} → ${rule.targetValue} (×${rule.modifierPercentage > 0 ? '+' : ''}${rule.modifierPercentage}%)`
    // );
    this.store.clearActionState();
    this.showDeactivateModal.set(true);
  }

  // ── Deactivation Flow ──────────────────────────────────────────────────
  protected async onDeactivationConfirmed(): Promise<void> {
    const id = this.pendingDeactivateId();
    if (!id) return;
    const ok = await this.store.deactivateRule(id);
    if (ok) {
      this.showDeactivateModal.set(false);
      this.pendingDeactivateId.set(null);
    }
  }

  protected onDeactivationCancelled(): void {
    this.showDeactivateModal.set(false);
    this.pendingDeactivateId.set(null);
    this.store.clearActionState();
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected onCreateRule(): void {
    this.store.navigateToEditor();
  }

  protected onOpenSimulationLab(): void {
    this.store.navigateToSimulationLab();
  }

  protected onViewArchive(): void {
    this.store.navigateToArchive();
  }

  protected onRefresh(): void {
    if (this.store.hasActiveSearch()) {
      this.store.searchRules(this.store.searchCriteria());
    } else {
      this.store.loadActiveRules();
    }
  }
}