// ============================================================================
// book-the-cook.component.ts
// Asiaporeair | Smart Page — Book the Cook (Pre-Order Meals)
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MenuDishCardComponent } from '../../components/menu-dish-card/menu-dish-card.component';
import { ChefQuoteCardComponent } from '../../components/chef-quote-card/chef-quote-card.component';
import {
  DISH_ITEMS,
  CHEF_PROFILES,
  IDishItem,
  IChefProfile
} from '../../../models/journey-with-us.models';

type CabinFilter = 'all' | 'suites' | 'first' | 'business' | 'premium-economy' | 'economy';

@Component({
  selector: 'app-book-the-cook',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MenuDishCardComponent,
    ChefQuoteCardComponent
  ],
  templateUrl: './book-the-cook.component.html',
  styleUrls: ['./book-the-cook.component.scss']
})
export class BookTheCookComponent {

  readonly breadcrumbs = [
    { label: 'Home', route: '/' },
    { label: 'Journey With Us', route: '/journey-with-us/landing' },
    { label: 'Dining', route: '/journey-with-us/dining' },
    { label: 'Book the Cook' }
  ];

  // ── Filter state ──────────────────────────────────────────────────────────
  readonly activeFilter = signal<CabinFilter>('all');

  readonly filters: { label: string; value: CabinFilter }[] = [
    { label: 'All Classes', value: 'all' },
    { label: 'Suites', value: 'suites' },
    { label: 'First Class', value: 'first' },
    { label: 'Business', value: 'business' },
    { label: 'Premium Economy', value: 'premium-economy' },
    { label: 'Economy', value: 'economy' }
  ];

  // ── Dishes (filtered) ─────────────────────────────────────────────────────
  readonly allDishes = signal<IDishItem[]>(DISH_ITEMS);

  readonly filteredDishes = computed(() => {
    const f = this.activeFilter();
    return f === 'all'
      ? this.allDishes()
      : this.allDishes().filter(d => d.cabinClass === f);
  });

  // ── Chef spotlight ────────────────────────────────────────────────────────
  readonly spotlightChef = signal<IChefProfile>(CHEF_PROFILES[0]);

  // ── UI helpers ────────────────────────────────────────────────────────────
  setFilter(value: CabinFilter): void {
    this.activeFilter.set(value);
  }

  isActiveFilter(value: CabinFilter): boolean {
    return this.activeFilter() === value;
  }

  trackById(_: number, item: { id: string }): string { return item.id; }
}