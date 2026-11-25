

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IAncillaryProduct } from '@shared-core';

@Component({
  selector: 'aoms-product-feature-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-feature-card.component.html',
  styleUrl: './product-feature-card.component.scss',
})
export class ProductFeatureCardComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly product = input.required<IAncillaryProduct>();
  readonly isProcessing = input<boolean>(false);

  /**
   * When true, renders the card in "Passenger View" mode — hides the
   * Edit/Pricing Review/Delete action bar and shows a read-only badge.
   * Used by the Ancillary Pricing Review (Product Intelligence Hub) to
   * display visual parity with the customer-facing booking suite.
   * Defaults to false to preserve existing Global Catalog grid behavior.
   */
  readonly readOnly = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly editClicked = output<IAncillaryProduct>();
  readonly pricingReviewClicked = output<IAncillaryProduct>();
  readonly deleteClicked = output<IAncillaryProduct>();

  // ── Computed ──────────────────────────────────────────────────────────
  /** Formatted price with currency symbol. */
  readonly formattedPrice = computed(() => {
    const cost = this.product().baseCost ?? 0;
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      minimumFractionDigits: 2,
    }).format(cost);
  });

  // ── Category icon SVG path mapping ────────────────────────────────────
  getCategoryIconPath(category: string): string {
    const map: Record<string, string> = {
      Baggage: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
      Meal: 'M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513',
      Comfort: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951',
      Lounge: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z',
      WiFi: 'M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z',
      Insurance: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
    };
    return map[category] ??
      'M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3';
  }

  // ── Category badge color class ────────────────────────────────────────
  getCategoryClass(category: string): string {
    const map: Record<string, string> = {
      Baggage: 'pfc-badge--baggage',
      Meal: 'pfc-badge--meal',
      Comfort: 'pfc-badge--comfort',
      Lounge: 'pfc-badge--lounge',
      WiFi: 'pfc-badge--wifi',
      Insurance: 'pfc-badge--insurance',
    };
    return map[category] ?? 'pfc-badge--default';
  }
}