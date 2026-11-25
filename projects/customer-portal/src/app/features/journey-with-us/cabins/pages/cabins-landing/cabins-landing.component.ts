// ============================================================================
// cabins-landing.component.ts
// Asiaporeair | Smart Page — Cabins Intermediary Hub
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { HeroVideoBannerComponent } from '../../../journey/components/hero-video-banner/hero-video-banner.component';
import { CabinFeatureCardComponent } from '../../components/cabin-feature-card/cabin-feature-card.component';
import { CABIN_FEATURE_CARDS, ICabinFeatureCard } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-cabins-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    HeroVideoBannerComponent,
    CabinFeatureCardComponent
  ],
  templateUrl: './cabins-landing.component.html',
  styleUrl: './cabins-landing.component.scss',
})
export class CabinsLandingComponent {

  readonly breadcrumbs = [
    { label: 'Home', route: '/' },
    { label: 'Journey With Us', route: '/journey-with-us/landing' },
    { label: 'Cabins' }
  ];

  readonly cabins = signal<ICabinFeatureCard[]>(CABIN_FEATURE_CARDS);
}