// product-catalog-card.component.ts
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, computed, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAncillaryProduct } from '../../../store/manage-booking.store';

@Component({
  selector: 'app-product-catalog-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './product-catalog-card.component.html',
  styleUrls: ['./product-catalog-card.component.scss']
})
export class ProductCatalogCardComponent {

  @Input({ required: true }) product!: IAncillaryProduct;
  @Input() cartQuantity = 0;

  @Output() addToCart = new EventEmitter<{ product: IAncillaryProduct; quantity: number }>();
  @Output() decrement = new EventEmitter<number>();
  @Output() removeFromCart = new EventEmitter<number>();

  get isInCart(): boolean { return this.cartQuantity > 0; }
  get isMaxed(): boolean { return this.cartQuantity >= (this.product.maxQuantity ?? 99); }

  get categoryIconSvg(): string {
    const cat = (this.product.category || '').toUpperCase();
    const icons: Record<string, string> = {
      DINING: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>`,
      MEAL: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>`,
      BAGGAGE: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="6" y="8" width="12" height="13" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><line x1="12" y1="12" x2="12" y2="16"/></svg>`,
      COMFORT: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 3v11M18 3v11"/><path d="M6 14a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4"/><line x1="6" y1="21" x2="6" y2="18"/><line x1="18" y1="21" x2="18" y2="18"/></svg>`,
      LOUNGE: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      CONNECTIVITY: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
      ENTERTAINMENT: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
      MEDICAL: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    };
    return icons[cat] ??
      `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }

  onAdd(): void {
    if (!this.isMaxed) {
      this.addToCart.emit({ product: this.product, quantity: 1 });
    }
  }

  onDecrement(): void { this.decrement.emit(this.product.productId); }
  onRemove(): void { this.removeFromCart.emit(this.product.productId); }

  formatPrice(n: number | undefined | null): string {
    return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
  }
}