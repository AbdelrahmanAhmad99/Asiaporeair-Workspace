// ============================================================================
// before-the-flight-landing.component.ts
// Asiaporeair | Smart Page — Before the Flight Hub Landing
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HubNavigationCardComponent } from '../../../journey/components/hub-navigation-card/hub-navigation-card.component';
import { IJourneyHubSection } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-before-the-flight-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, HubNavigationCardComponent],
  templateUrl: './before-the-flight-landing.component.html',
  styleUrls: ['./before-the-flight-landing.component.scss']
})
export class BeforeTheFlightLandingComponent {

  readonly breadcrumbs = [
    { label: 'Home', route: '/' },
    { label: 'Journey With Us', route: '/journey-with-us/landing' },
    { label: 'Before the Flight' }
  ];

  readonly hubSections = signal<IJourneyHubSection[]>([
    {
      id: 'silverkris-lounges',
      title: 'An Oasis Before Departure',
      tagline: 'SilverKris Lounges',
      description: 'From the exclusive Private Room for Suites travellers to the SilverKris Business Lounge — immerse yourself in world-class pre-flight comfort.',
      imagePath: 'assets/images/journey-with-us/btf-lounges.png',
      route: '/journey-with-us/before-the-flight/silver-lounges',
      accentColor: '#B68F24'
    },
    {
      id: 'inflight-shopping',
      title: 'Curated Luxury at Altitude',
      tagline: 'Inflight Shopping',
      description: 'Browse a handpicked collection of premium fragrances, skincare, spirits, and exclusive Asiaporeair editions — available only in the sky.',
      imagePath: 'assets/images/journey-with-us/btf-shopping.png',
      route: '/journey-with-us/before-the-flight/inflight-shopping',
      accentColor: '#B68F24'
    },
    {
      id: 'airport-experience',
      title: 'The Terminal, Reimagined',
      tagline: 'Airport Experience',
      description: 'Dedicated check-in counters, priority security lanes, and an attentive ground concierge — because the journey truly begins at the airport.',
      imagePath: 'assets/images/journey-with-us/btf-airport.png',
      route: '/journey-with-us/before-the-flight/airport-experience',
      accentColor: '#B68F24'
    }
  ]);

  trackById(_: number, item: { id: string }): string { return item.id; }
}