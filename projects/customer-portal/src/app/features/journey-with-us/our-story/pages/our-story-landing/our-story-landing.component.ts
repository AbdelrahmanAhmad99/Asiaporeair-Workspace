// ============================================================================
// our-story-landing.component.ts
// Asiaporeair | Smart Page — Our Story Hub Landing
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HubNavigationCardComponent } from '../../../journey/components/hub-navigation-card/hub-navigation-card.component';
import { IJourneyHubSection } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-our-story-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, HubNavigationCardComponent],
  templateUrl: './our-story-landing.component.html',
  styleUrls: ['./our-story-landing.component.scss']
})
export class OurStoryLandingComponent {

  readonly breadcrumbs = [
    { label: 'Home', route: '/' },
    { label: 'Journey With Us', route: '/journey-with-us/landing' },
    { label: 'Our Story' }
  ];

  readonly hubSections = signal<IJourneyHubSection[]>([
    {
      id: 'heritage',
      title: 'Five Decades of Pursuit',
      tagline: 'Our Heritage',
      description: 'From a small regional carrier to one of the world\'s most awarded airlines — trace the milestones that define who we are.',
      imagePath: 'assets/images/journey-with-us/story-heritage.png',
      route: '/journey-with-us/our-story/heritage',
      accentColor: '#B68F24'
    },
    {
      id: 'our-fleet',
      title: 'The Aircraft That Connect the World',
      tagline: 'Our Fleet',
      description: 'From the iconic A380 to the ultra-efficient A350ULR — explore the aircraft that carry our service promise across the globe.',
      imagePath: 'assets/images/journey-with-us/story-fleet.png',
      route: '/journey-with-us/our-story/our-fleet',
      accentColor: '#B68F24'
    },
    {
      id: 'cabin-crew',
      title: 'The Heart of Every Flight',
      tagline: 'Our Cabin Crew',
      description: 'Our crew are the living embodiment of our values — trained to the highest standard, defined by genuine warmth.',
      imagePath: 'assets/images/journey-with-us/story-crew.png',
      route: '/journey-with-us/our-story/cabin-crew',
      accentColor: '#B68F24'
    },
    {
      id: 'awards',
      title: 'Recognised by the World',
      tagline: 'Awards & Recognition',
      description: 'Decades of distinction, confirmed by the industry\'s most rigorous international panels and millions of satisfied passengers.',
      imagePath: 'assets/images/journey-with-us/story-awards.png',
      route: '/journey-with-us/our-story/awards',
      accentColor: '#B68F24'
    }
  ]);

  trackById(_: number, item: { id: string }): string { return item.id; }
}