// Smart container — owns all page-level state and orchestrates dumb components.

import {
  Component, signal, computed, ViewChild,
  ChangeDetectionStrategy, inject, OnInit, PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  IDestinationCard, IOfferCard, IExperienceFeature,
  IServiceIcon, INewsCard, IAdvisoryAlert, ISearchEnginePatch,
} from '../../store/flights.store';

import { HeroVisualBackgroundComponent } from '../../components/hero-visual-background/hero-visual-background.component';
import { QuickActionTabsComponent } from '../../components/quick-action-tabs/quick-action-tabs.component';
import { BookingWidgetComponent } from '../../components/booking-widget/booking-widget.component';
import { OfferCarouselComponent } from '../../components/offer-carousel/offer-carousel.component';
import { PromoCodeBannerComponent } from '../../components/promo-code-banner/promo-code-banner.component';
import { DestinationExplorerComponent } from '../../components/destination-explorer/destination-explorer.component';
import { ExperienceFeatureBlockComponent } from '../../components/experience-feature-block/experience-feature-block.component';
import { ServiceIconBarComponent } from '../../components/service-icon-bar/service-icon-bar.component';
import { LoyaltyJoinBannerComponent } from '../../components/loyalty-join-banner/loyalty-join-banner.component';
import { AdvisoryAlertBarComponent } from '../../components/advisory-alert-bar/advisory-alert-bar.component';
import { NewsCardComponent } from '../../components/news-card/news-card.component';
// import { FlightSearchEngineComponent } from '../../components/booking-widget/flight-search-engine-stub';

export type QuickTab = 'book' | 'manage' | 'checkin' | 'status' | 'ticket';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterModule,
    HeroVisualBackgroundComponent,
    QuickActionTabsComponent,
    BookingWidgetComponent,
    OfferCarouselComponent,
    PromoCodeBannerComponent,
    DestinationExplorerComponent,
    ExperienceFeatureBlockComponent,
    ServiceIconBarComponent,
    LoyaltyJoinBannerComponent,
    AdvisoryAlertBarComponent,
    NewsCardComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  private readonly platformId = inject(PLATFORM_ID);

  // ── Page-level UI signals ──────────────────────────────────────────────────

  readonly activeTab = signal<QuickTab>('book');
  readonly destinationsLoading = signal(false);
  readonly pendingPatch = signal<ISearchEnginePatch | null>(null);
  readonly dismissedAlerts = signal<Set<string>>(new Set());

  readonly visibleAlerts = computed(() => {
    const dismissed = this.dismissedAlerts();
    return this.alerts.filter(a => !dismissed.has(a.id));
  });

  // ── Quick tab handler ──────────────────────────────────────────────────────

  onTabChange(tab: QuickTab): void {
    this.activeTab.set(tab);
  }

  // ── Destination → search engine patch ─────────────────────────────────────

  onDestinationSelected(dest: IDestinationCard): void {
    // Switch to booking tab so user sees the patched form
    this.activeTab.set('book');

    this.pendingPatch.set({
      destinationIata: dest.iata,
      destinationDisplay: `${dest.city} (${dest.iata})`,
    });
  }

  onPatchApplied(): void {
    this.pendingPatch.set(null);
    // Scroll hero into view so user sees the prefilled form
    if (isPlatformBrowser(this.platformId)) {
      document.querySelector('#hero-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onAlertDismissed(id: string): void {
    this.dismissedAlerts.update(set => {
      const next = new Set(set);
      next.add(id);
      return next;
    });
  }

  ngOnInit(): void {
    // Simulate loading destinations (replace with real service call)
    this.destinationsLoading.set(true);
    setTimeout(() => this.destinationsLoading.set(false), 800);
  }

  // ── Static data (replace with service-injected observables in production) ──

  readonly alerts: IAdvisoryAlert[] = [
    {
      id: 'alert-01',
      severity: 'info',
      message: 'Monsoon season advisory for routes to Southeast Asia — 15 May–30 September. Minor schedule adjustments may apply.',
      ctaLabel: 'Learn More',
      ctaRoute: '/news/monsoon-advisory',
      dismissible: true,
    },
  ];

  readonly offers: IOfferCard[] = [
    {
      id: 'offer-01',
      title: 'The Suites Experience',
      subtitle: 'Fly in our most private cabin. Singapore–London from USD 8,400.',
      imageUrl: 'assets/images/home/offer-suites.png',
      badge: 'Limited Availability',
      validUntil: '2025-08-31',
      ctaLabel: 'Reserve Your Suite',
      ctaRoute: '/flight-info/search',
    },
    {
      id: 'offer-02',
      title: 'Business Class Escape',
      subtitle: 'Flat-bed luxury on long-haul routes. From USD 2,100 return.',
      imageUrl: 'assets/images/home/offer-business.png',
      badge: 'Members Save 15%',
      validUntil: '2025-09-15',
      ctaLabel: 'Begin Your Journey',
      ctaRoute: '/flight-info/search',
    },
    {
      id: 'offer-03',
      title: 'Asia Discovery Fares',
      subtitle: 'Explore 12 cities across Asia — Economy from USD 320 return.',
      imageUrl: 'assets/images/home/offer-asia.png',
      ctaLabel: 'Discover Destinations',
      ctaRoute: '/flight-info/search',
    },
  ];

  readonly destinations: IDestinationCard[] = [
    {
      id: 'dest-sin', iata: 'SIN', city: 'Singapore', country: 'Singapore',
      originIata: 'SIN',
      tagline: 'The city that never settles for ordinary.',
      imageUrl: 'assets/images/home/dest-singapore.png',
      imageGradient: 'linear-gradient(150deg, #051937 0%, #103060 100%)',
      offerLabel: 'Voyager Exclusive',
      currency: 'USD', fromPrice: 420,
    },
    {
      id: 'dest-lhr', iata: 'LHR', city: 'London', country: 'United Kingdom',
      originIata: 'SIN',
      tagline: 'Heritage, culture, and timeless sophistication.',
      imageUrl: 'assets/images/home/dest-london.png',
      imageGradient: 'linear-gradient(150deg, #1a0a2e 0%, #051937 100%)',
      offerLabel: 'Round-Trip Deal',
      currency: 'USD', fromPrice: 890,
    },
    {
      id: 'dest-nrt', iata: 'NRT', city: 'Tokyo', country: 'Japan',
      originIata: 'SIN',
      tagline: 'Where ancient ritual meets tomorrow\'s precision.',
      imageUrl: 'assets/images/home/dest-tokyo.png',
      imageGradient: 'linear-gradient(150deg, #0d1f3c 0%, #1a3a5c 100%)',
      offerLabel: 'Hot Offer',
      currency: 'USD', fromPrice: 580,
    },
    {
      id: 'dest-syd', iata: 'SYD', city: 'Sydney', country: 'Australia',
      originIata: 'SIN',
      tagline: 'Harbour light and open horizon.',
      imageUrl: 'assets/images/home/dest-sydney.png',
      imageGradient: 'linear-gradient(150deg, #051937 0%, #0a2a4a 100%)',
      offerLabel: 'Summer Special',
      currency: 'USD', fromPrice: 740,
    },
    {
      id: 'dest-dxb', iata: 'DXB', city: 'Dubai', country: 'UAE',
      originIata: 'SIN',
      tagline: 'Luxury distilled into a skyline.',
      imageUrl: 'assets/images/home/dest-dubai.png',
      imageGradient: 'linear-gradient(150deg, #1a1400 0%, #051937 100%)',
      offerLabel: 'Flash Sale',
      currency: 'USD', fromPrice: 390,
    },
    {
      id: 'dest-jfk', iata: 'JFK', city: 'New York', country: 'USA',
      originIata: 'SIN',
      tagline: 'The city of infinite possibility.',
      imageUrl: 'assets/images/home/dest-newyork.png',
      imageGradient: 'linear-gradient(150deg, #051937 0%, #1a0f3c 100%)',
      offerLabel: 'Weekend Getaway',
      currency: 'USD', fromPrice: 960,
    },
  ];

  readonly experienceFeatures: IExperienceFeature[] = [
    {
      id: 'exp-suites',
      eyebrow: 'Cabins',
      headline: 'The Asiaporeair Suite',
      body: 'A private sanctuary above the clouds. Full-grain leather, a sliding lacquered door, and a personal double bed transform the sky into your own retreat. Reserved for those who know the difference.',
      imageUrl: 'assets/images/home/exp-suites.png',
      ctaLabel: 'Explore Suites',
      ctaRoute: '/journey-with-us/cabins/suites',
      imageLeft: false,
    },
    {
      id: 'exp-dining',
      eyebrow: 'Dining',
      headline: 'A Table Above the World',
      body: 'Our International Culinary Panel of Michelin-starred chefs curates every menu. Pre-select your main course with Book the Cook, up to six weeks before your flight.',
      imageUrl: 'assets/images/home/exp-dining.png',
      ctaLabel: 'Discover Dining',
      ctaRoute: '/journey-with-us/dining',
      imageLeft: true,
    },
    {
      id: 'exp-entertainment',
      eyebrow: 'Entertainment',
      headline: 'SkyWorld — 1,800+ Titles',
      body: 'An award-winning in-flight system with over 1,800 on-demand titles, personalised to your taste. Paired with audiophile-grade noise-cancelling headphones.',
      imageUrl: 'assets/images/home/exp-entertainment.png',
      ctaLabel: 'Explore SkyWorld',
      ctaRoute: '/journey-with-us/entertainment',
      imageLeft: false,
    },
  ];

  readonly serviceIcons: IServiceIcon[] = [
    {
      id: 'svc-wifi',
      svgPath: 'M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01',
      label: 'High-Speed Wi-Fi',
      sublabel: 'Available on all long-haul routes',
    },
    {
      id: 'svc-legroom',
      svgPath: 'M12 2v14M5 8l7 7 7-7M3 20h18',
      label: 'Industry-Leading Legroom',
      sublabel: 'Up to 38 inches in Economy',
    },
    {
      id: 'svc-dining',
      svgPath: 'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3',
      label: 'Award-Winning Cuisine',
      sublabel: 'Book the Cook from USD 0 — 6 weeks early',
    },
    {
      id: 'svc-lounge',
      svgPath: 'M20 9V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2M12 3v6M2 9h20M4 9v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9',
      label: 'SilverKris Lounges',
      sublabel: 'Priority access from Gold tier',
    },
    {
      id: 'svc-miles',
      svgPath: 'M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2',
      label: 'Voyager Miles',
      sublabel: 'Earn on every flight, every partner',
    },
    {
      id: 'svc-safety',
      svgPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
      label: 'IOSA Certified Safety',
      sublabel: 'Highest safety & operational standards',
    },
  ];

  readonly news: INewsCard[] = [
    {
      id: 'news-01',
      category: 'Fleet',
      headline: 'Asiaporeair Takes Delivery of Its 10th Airbus A350-900ULR',
      excerpt: 'The latest addition to our ultra-long-range fleet will operate direct services between Singapore and New York, reducing travel time by over two hours.',
      imageUrl: 'assets/images/home/news-a350.png',
      publishedAt: '2025-07-01',
      ctaRoute: '/news/a350ulr-delivery',
    },
    {
      id: 'news-02',
      category: 'Awards',
      headline: 'Voted World\'s Best Airline for the 12th Consecutive Year',
      excerpt: 'Asiaporeair has once again been awarded the Skytrax World\'s Best Airline title, with the panel citing exceptional cabin crew and consistently innovative product.',
      imageUrl: 'assets/images/home/news-award.png',
      publishedAt: '2025-06-15',
      ctaRoute: '/news/skytrax-2025',
    },
    {
      id: 'news-03',
      category: 'Routes',
      headline: 'New Non-Stop Service: Singapore — Riyadh Launches November 2025',
      excerpt: 'Twice-weekly A380 services connecting Changi and King Khalid International Airport, featuring the full Suites product in a four-cabin configuration.',
      imageUrl: 'assets/images/home/news-riyadh.png',
      publishedAt: '2025-05-28',
      ctaRoute: '/news/riyadh-launch',
    },
  ];
}