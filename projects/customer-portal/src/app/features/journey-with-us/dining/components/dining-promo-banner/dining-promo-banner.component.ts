// ============================================================================
// dining-promo-banner.component.ts
// Asiaporeair | Dumb Component — Cinematic Dining Promo Banner
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dining-promo-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './dining-promo-banner.component.html',
  styleUrls: ['./dining-promo-banner.component.scss']
})
export class DiningPromoBannerComponent {
  @Input() imagePath: string = 'assets/images/journey-with-us/dining-hero.png';
  @Input() headline: string = 'Cuisine at Altitude';
  @Input() subheadline: string = 'Award-winning menus crafted by the world\'s most celebrated chefs — served at your pace, at your seat.';
  @Input() eyebrow: string = 'Dining';
  @Input() ctaLabel: string = 'Begin Your Culinary Journey';
  @Input() ctaRoute: string = '/journey-with-us/dining/book-the-cook';
  @Input() breadcrumbs: { label: string; route?: string }[] = [];
}