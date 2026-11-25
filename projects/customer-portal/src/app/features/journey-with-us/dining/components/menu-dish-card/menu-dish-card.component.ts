// ============================================================================
// menu-dish-card.component.ts
// Asiaporeair | Dumb Component — Menu Dish Card
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IDishItem } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-menu-dish-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './menu-dish-card.component.html',
  styleUrl: './menu-dish-card.component.scss',
})
export class MenuDishCardComponent {
  @Input({ required: true }) dish!: IDishItem;
  @Input() animDelay: number = 0;

  get courseLabel(): string {
    const map: Record<string, string> = {
      starter: 'Starter', main: 'Main Course',
      dessert: 'Dessert', beverage: 'Beverage'
    };
    return map[this.dish.course] ?? this.dish.course;
  }

  get cabinLabel(): string {
    const map: Record<string, string> = {
      suites: 'Suites', first: 'First Class',
      business: 'Business', 'premium-economy': 'Premium Economy',
      economy: 'Economy', all: 'All Cabins'
    };
    return map[this.dish.cabinClass] ?? this.dish.cabinClass;
  }

  dietaryLabel(tag: string): string {
    const map: Record<string, string> = {
      vegetarian: 'VG', vegan: 'VE', halal: 'HL', 'gluten-free': 'GF'
    };
    return map[tag] ?? tag.toUpperCase();
  }
}