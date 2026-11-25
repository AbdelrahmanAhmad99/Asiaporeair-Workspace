// // ============================================================================
// inflight-shopping.component.ts
// Asiaporeair | Smart Page — Inflight Shopping
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  SHOPPING_ITEMS, IShoppingItem
} from '../../../models/journey-with-us.models';

type ShopCategory = 'all' | 'fragrance' | 'skincare' | 'fashion' | 'electronics' | 'spirits' | 'jewellery';

@Component({
  selector: 'app-inflight-shopping',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './inflight-shopping.component.html',
  styleUrl: './inflight-shopping.component.scss'
})
export class InflightShoppingComponent {

  readonly allItems = signal<IShoppingItem[]>(SHOPPING_ITEMS);
  readonly activeCategory = signal<ShopCategory>('all');

  readonly categories: { label: string; value: ShopCategory }[] = [
    { label: 'All', value: 'all' },
    { label: 'Fragrance', value: 'fragrance' },
    { label: 'Skincare', value: 'skincare' },
    { label: 'Fashion', value: 'fashion' },
    { label: 'Spirits', value: 'spirits' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Jewellery', value: 'jewellery' }
  ];

  readonly filteredItems = computed(() => {
    const cat = this.activeCategory();
    return cat === 'all' ? this.allItems() : this.allItems().filter(i => i.category === cat);
  });

  setCategory(value: ShopCategory): void { this.activeCategory.set(value); }

  categoryLabel(cat: string): string {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  }
}