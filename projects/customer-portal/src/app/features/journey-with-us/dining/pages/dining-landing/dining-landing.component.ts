// ============================================================================
// dining-landing.component.ts
// Asiaporeair | Smart Page — Dining Hub Landing
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DiningPromoBannerComponent } from '../../components/dining-promo-banner/dining-promo-banner.component';
import { HubNavigationCardComponent } from '../../../journey/components/hub-navigation-card/hub-navigation-card.component';
import {
  IJourneyHubSection,
  INFLIGHT_MENU_GROUPS,
  IInflightMenuGroup
} from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-dining-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    DiningPromoBannerComponent,
    HubNavigationCardComponent
  ],
  templateUrl: './dining-landing.component.html',
  styleUrls: ['./dining-landing.component.scss']
})
export class DiningLandingComponent {

  readonly breadcrumbs = [
    { label: 'Home', route: '/' },
    { label: 'Journey With Us', route: '/journey-with-us/landing' },
    { label: 'Dining' }
  ];

  // Hub navigation cards — three routes under dining
  readonly diningHubSections = signal<IJourneyHubSection[]>([
    {
      id: 'book-the-cook',
      title: 'Reserve Your Perfect Meal',
      tagline: 'Book the Cook',
      description: 'Pre-order from an exclusive selection of chef-curated dishes up to six weeks before your departure. Your meal awaits.',
      imagePath: 'assets/images/journey-with-us/dining-book-cook.png',
      route: '/journey-with-us/dining/book-the-cook',
      accentColor: '#B68F24'
    },
    {
      id: 'culinary-experts',
      title: 'The Minds Behind the Menus',
      tagline: 'Culinary Experts',
      description: 'An International Culinary Panel of the world\'s most decorated chefs, united by a shared belief: great food transcends altitude.',
      imagePath: 'assets/images/journey-with-us/dining-chefs.png',
      route: '/journey-with-us/dining/culinary-experts',
      accentColor: '#B68F24'
    },
    {
      id: 'inflight-menus',
      title: 'Explore Every Menu',
      tagline: 'Inflight Menus',
      description: 'Browse our complete menus across all cabin classes. Preview what awaits you before you even reach the gate.',
      imagePath: 'assets/images/journey-with-us/dining-menus.png',
      route: '/journey-with-us/dining/inflight-menus',
      accentColor: '#B68F24'
    }
  ]);

  // Menu class previews
  readonly menuGroups = signal<IInflightMenuGroup[]>(INFLIGHT_MENU_GROUPS);

  trackById(_: number, item: { id: string }): string { return item.id; }
}