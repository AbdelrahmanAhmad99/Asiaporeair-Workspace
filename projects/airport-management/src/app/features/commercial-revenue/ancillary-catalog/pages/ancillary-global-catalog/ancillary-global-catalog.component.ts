

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

import { AncillaryCatalogStore } from '../../store/ancillary-catalog.store';
import { AncilaryCategoryFilterComponent } from '../../components/ancillary-category-filter/ancillary-category-filter.component';
import { ProductFeatureCardComponent } from '../../components/product-feature-card/product-feature-card.component';
import { ProductDeletionModalComponent } from '../../components/product-deletion-modal/product-deletion-modal.component';
import { IAncillaryProduct } from '@shared-core';

@Component({
  selector: 'aoms-ancillary-global-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AncilaryCategoryFilterComponent,
    ProductFeatureCardComponent,
    ProductDeletionModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ancillary-global-catalog.component.html',
  styleUrl: './ancillary-global-catalog.component.scss',
})
export class AncillaryGlobalCatalogComponent implements OnInit, OnDestroy {
  protected readonly store = inject(AncillaryCatalogStore);

  // ── Deletion modal state ──────────────────────────────────────────────
  protected readonly showDeleteModal = signal<boolean>(false);
  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly pendingDeleteName = signal<string>('');

  // ── Dark mode ─────────────────────────────────────────────────────────
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Skeleton count ─────────────────────────────────────────────────────
  protected readonly skeletonCards = Array.from({ length: 8 });

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.loadProducts(1);
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

  // ── Search ─────────────────────────────────────────────────────────────
  protected onSearchInput(query: string): void {
    this.store.setSearch(query);
  }

  // ── Category Filter ────────────────────────────────────────────────────
  protected onCategoryChanged(category: string): void {
    this.store.setCategory(category);
  }

  protected onFiltersReset(): void {
    this.store.resetFilters();
  }

  // ── Pagination ─────────────────────────────────────────────────────────
  protected onNextPage(): void { this.store.nextPage(); }
  protected onPrevPage(): void { this.store.prevPage(); }
  protected onGoToPage(p: number): void { this.store.goToPage(p); }

  // ── Card Actions ───────────────────────────────────────────────────────
  protected onEditProduct(product: IAncillaryProduct): void {
    this.store.navigateToEditProduct(product.productId);
  }

  protected onPricingReview(product: IAncillaryProduct): void {
    this.store.navigateToPricingReview(product.productId);
  }

  protected onDeleteRequested(product: IAncillaryProduct): void {
    this.pendingDeleteId.set(product.productId);
    this.pendingDeleteName.set(product.name);
    this.store.clearError();
    this.showDeleteModal.set(true);
  }

  // ── Deletion Flow ──────────────────────────────────────────────────────
  protected async onDeleteConfirmed(): Promise<void> {
    const id = this.pendingDeleteId();
    if (id == null) return;
    const ok = await this.store.deleteProductOptimistic(id);
    if (ok) {
      this.showDeleteModal.set(false);
      this.pendingDeleteId.set(null);
    }
  }

  protected onDeleteCancelled(): void {
    this.showDeleteModal.set(false);
    this.pendingDeleteId.set(null);
    this.store.clearActionState();
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected onNewProduct(): void {
    this.store.navigateToNewProduct();
  }

  protected onRefresh(): void {
    this.store.loadProducts(this.store.pagination().currentPage);
  }

  // ── Pagination helpers ─────────────────────────────────────────────────
  protected get pageNumbers(): number[] {
    const { currentPage, totalPages } = this.store.pagination();
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      range.push(i);
    }
    return range;
  }

  protected trackByProductId(_: number, product: IAncillaryProduct): number {
    return product.productId;
  }
}