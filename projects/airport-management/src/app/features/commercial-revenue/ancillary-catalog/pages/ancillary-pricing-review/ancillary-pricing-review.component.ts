

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { AncillaryCatalogStore } from '../../store/ancillary-catalog.store';
import { ProductFeatureCardComponent } from '../../components/product-feature-card/product-feature-card.component';
import { CatalogStatusBarComponent } from '../../components/catalog-status-bar/catalog-status-bar.component';
import { PricingTimelineChartComponent } from '../../components/pricing-timeline-chart/pricing-timeline-chart.component';

@Component({
  selector: 'aoms-ancillary-pricing-review',
  standalone: true,
  imports: [
    CommonModule,
    ProductFeatureCardComponent,
    CatalogStatusBarComponent,
    PricingTimelineChartComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ancillary-pricing-review.component.html',
  styleUrl: './ancillary-pricing-review.component.scss',
})
export class AncillaryPricingReviewComponent implements OnInit, OnDestroy {
  protected readonly store = inject(AncillaryCatalogStore);
  private readonly route = inject(ActivatedRoute);

  /** Route :id param — used for "Edit Configuration" navigation. */
  protected readonly productId = signal<number | null>(null);

  // ── Dark mode ─────────────────────────────────────────────────────────
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Computed ──────────────────────────────────────────────────────────
  protected readonly product = computed(() => this.store.reviewedProduct());

  /** True only once loading has finished AND no product was returned. */
  protected readonly notFound = computed(
    () => !this.store.isReviewLoading() && !this.store.reviewedProduct() && !!this.store.reviewError()
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = rawId ? parseInt(rawId, 10) : null;

    if (id != null && !isNaN(id)) {
      this.productId.set(id);
      this.store.loadProductDetails(id);
    } else {
      this.store.setError('No product ID was provided for pricing review.');
    }
  }

  ngOnDestroy(): void {
    this.store.clearReviewState();
  }

  // ── Dark Mode Toggle ───────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Navigation ─────────────────────────────────────────────────────────

  protected onEditConfiguration(): void {
    const id = this.productId();
    if (id != null) {
      this.store.navigateToEditProduct(id);
    }
  }

  protected onReturnToCatalog(): void {
    this.store.navigateToCatalog();
  }

  // ── Retry ──────────────────────────────────────────────────────────────

  protected onRetry(): void {
    const id = this.productId();
    if (id != null) {
      this.store.loadProductDetails(id);
    }
  }

  protected onDismissError(): void {
    this.store.clearReviewError();
  }
}