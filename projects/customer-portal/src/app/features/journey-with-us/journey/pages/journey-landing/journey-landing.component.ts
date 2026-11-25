// ============================================================================
// journey-landing.component.ts
// Asiaporeair | Smart Page — Journey With Us Hub Landing
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

import { HeroVideoBannerComponent } from '../../components/hero-video-banner/hero-video-banner.component';
import { HubNavigationCardComponent } from '../../components/hub-navigation-card/hub-navigation-card.component';
import { JOURNEY_HUB_SECTIONS, IJourneyHubSection } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-journey-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    HeroVideoBannerComponent,
    HubNavigationCardComponent
  ],
  templateUrl: './journey-landing.component.html',
  styleUrls: ['./journey-landing.component.scss']
})
export class JourneyLandingComponent {

  readonly breadcrumbs = [
    { label: 'Home', route: '/' },
    { label: 'Journey With Us' }
  ];

  readonly sections = signal<IJourneyHubSection[]>(JOURNEY_HUB_SECTIONS);

  trackById(_: number, section: IJourneyHubSection): string {
    return section.id;
  }
}