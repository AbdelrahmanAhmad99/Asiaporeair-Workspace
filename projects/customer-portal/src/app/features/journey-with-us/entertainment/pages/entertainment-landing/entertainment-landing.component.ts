// ============================================================================
// entertainment-landing.component.ts
// Asiaporeair | Smart Page — Entertainment Hub Landing
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HubNavigationCardComponent } from '../../../journey/components/hub-navigation-card/hub-navigation-card.component';
import { MediaCategoryCardComponent } from '../../components/media-category-card/media-category-card.component';
import {
  IJourneyHubSection,
  MEDIA_CATEGORIES,
  IMediaCategory
} from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-entertainment-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    HubNavigationCardComponent,
    MediaCategoryCardComponent
  ],
  templateUrl: './entertainment-landing.component.html',
  styleUrls: ['./entertainment-landing.component.scss']
})
export class EntertainmentLandingComponent {

  readonly breadcrumbs = [
    { label: 'Home', route: '/' },
    { label: 'Journey With Us', route: '/journey-with-us/landing' },
    { label: 'Entertainment' }
  ];

  readonly hubSections = signal<IJourneyHubSection[]>([
    {
      id: 'krisworld',
      title: 'A World of Content, At Your Fingertips',
      tagline: 'SkyWorld Entertainment',
      description: 'Over 1,800 on-demand titles across movies, TV, music, games, and more — presented on HD touchscreen displays engineered for the sky.',
      imagePath: 'assets/images/journey-with-us/ent-skyworld.png',
      route: '/journey-with-us/entertainment/krisworld',
      accentColor: '#B68F24'
    },
    {
      id: 'wifi-connectivity',
      title: 'Stay Connected, Wherever You Fly',
      tagline: 'Wi-Fi Connectivity',
      description: 'High-speed satellite Wi-Fi across our fleet — from browsing and email to video conferencing at altitude. Multiple plans available.',
      imagePath: 'assets/images/journey-with-us/ent-wifi.png',
      route: '/journey-with-us/entertainment/wifi-connectivity',
      accentColor: '#B68F24'
    }
  ]);

  readonly mediaCategories = signal<IMediaCategory[]>(MEDIA_CATEGORIES);

  trackById(_: number, item: { id: string }): string { return item.id; }
}