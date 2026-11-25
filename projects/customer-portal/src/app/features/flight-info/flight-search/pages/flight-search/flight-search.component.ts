// ============================================================================
// flight-search.component.ts
// Asiaporeair | "Explore Global Suites" — Flight Discovery Landing Page
//
// DUAL STORE ARCHITECTURE (enforced):
//   booking.store.ts  → searchFlights() call + navigation to /booking/flight-results
//   flights.store.ts  → all exploration state (popular routes, destinations,
//                        promos, pending patch signal)
//
// CARD INTERACTION RULE (critical):
//   Clicking a popular-route or destination card does NOT navigate.
//   It writes a pendingSearchPatch to flights.store, which this page
//   reads via effect() and forwards to FlightSearchEngineComponent via
//   its public patchSearchForm() method — letting the user review & submit.
// ============================================================================

import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ChangeDetectionStrategy, inject, viewChild,
  effect, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';

import { FlightsStore, ISearchEnginePatch, IPopularRoute, IDestinationCard, IPromoBanner } from '../../../store/flights.store';
import { BookingStore } from '../../../../booking/store/booking.store';

import { FlightSearchEngineComponent } from '../../components/flight-search-engine/flight-search-engine.component';
import { PopularRoutesComponent } from '../../components/popular-routes/popular-routes.component';
import { DestinationExplorerComponent } from '../../components/destination-explorer/destination-explorer.component';
import { FlightPromoBannersComponent } from '../../components/flight-promo-banners/flight-promo-banners.component';

// ── Page animations ───────────────────────────────────────────────────────────
const PAGE_ANIMATIONS = [
  trigger('heroReveal', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-16px)' }),
      animate('560ms cubic-bezier(0.22, 1, 0.36, 1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),
  trigger('sectionStagger', [
    transition(':enter', [
      query('.section-block', [
        style({ opacity: 0, transform: 'translateY(28px)' }),
        stagger(110, [
          animate('480ms cubic-bezier(0.22, 1, 0.36, 1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('fadeSlideUp', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('420ms cubic-bezier(0.22, 1, 0.36, 1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ])
];

@Component({
  selector: 'app-flight-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FlightSearchEngineComponent,
    PopularRoutesComponent,
    DestinationExplorerComponent,
    FlightPromoBannersComponent
  ],
  animations: PAGE_ANIMATIONS,
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.scss']
})
export class FlightSearchComponent implements OnInit, AfterViewInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────────
  private readonly flightsStore = inject(FlightsStore);
  private readonly bookingStore = inject(BookingStore);
  readonly router = inject(Router);

  // ── Child component reference ─────────────────────────────────────────────
  /**
   * Reference to the FlightSearchEngineComponent embedded in this page.
   * Used to call its public patchSearchForm() when a card is clicked.
   */
  private readonly searchEngine = viewChild(FlightSearchEngineComponent);

  // ── Store signal aliases exposed to template ──────────────────────────────
  readonly popularRoutes = this.flightsStore.popularRoutes;
  readonly destinationCards = this.flightsStore.destinationCards;
  readonly promoBanners = this.flightsStore.promoBanners;

  // ── Local UI state ────────────────────────────────────────────────────────
  /** True while the page performs its initial reveal animation. */
  readonly pageReady = signal<boolean>(false);

  /**
   * Tracks which IATA code was most recently patched so we can show a
   * subtle "Search form updated" toast without navigating.
   */
  readonly lastPatchedDestination = signal<string | null>(null);
  readonly showPatchToast = signal<boolean>(false);

  private patchToastTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Pending patch watcher ─────────────────────────────────────────────────
  constructor() {

    effect(() => {
      const patch = this.flightsStore.pendingSearchPatch();
      if (!patch) return;

      this.applyPatchToEngine(patch);
      this.flightsStore.clearPendingPatch();
    });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Clean up any stale exploration state from a previous visit
    this.flightsStore.clearPendingPatch();
  }

  ngAfterViewInit(): void {
    // Allow page reveal animation to start
    setTimeout(() => this.pageReady.set(true), 60);
  }

  ngOnDestroy(): void {
    if (this.patchToastTimer) clearTimeout(this.patchToastTimer);
  }

  // ── Card interaction handlers ─────────────────────────────────────────────

  /**
   * Called when a popular-routes card emits routeSelected.
   * Writes a patch to the store → picked up by the effect → applied to engine.
   */
  onRouteSelected(route: IPopularRoute): void {
    const patch: ISearchEnginePatch = {
      originIata: route.origin,
      originDisplay: `${route.origin} (${route.origin})`,
      destinationIata: route.destination,
      destinationDisplay: `${route.destinationCity} (${route.destination})`,
      cabinClass: route.cabinClass
    };
    this.flightsStore.requestSearchPatch(patch);
    this.lastPatchedDestination.set(route.destinationCity);
    this.triggerPatchToast();
    this.scrollToEngine();
  }

  /**
   * Called when a destination-explorer card emits destinationSelected.
   * Same pattern: write to store → effect applies to engine.
   */
  onDestinationSelected(dest: IDestinationCard): void {
    const patch: ISearchEnginePatch = {
      originIata: dest.originIata,
      originDisplay: `Singapore (${dest.originIata})`,
      destinationIata: dest.iata,
      destinationDisplay: `${dest.city} (${dest.iata})`
    };
    this.flightsStore.requestSearchPatch(patch);
    this.lastPatchedDestination.set(dest.city);
    this.triggerPatchToast();
    this.scrollToEngine();
  }

  /**
   * Called when a promo banner CTA is clicked.
   * If the banner has a linked route, patch the engine.
   * Otherwise, do nothing further (CTA copy handles user expectation).
   */
  onBannerCta(banner: IPromoBanner): void {
    if (banner.route) {
      this.flightsStore.requestSearchPatch(banner.route);
      this.lastPatchedDestination.set(banner.headline);
      this.triggerPatchToast();
      this.scrollToEngine();
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /**
   * Applies a patch to the FlightSearchEngineComponent's reactive form.
   * The engine exposes a public patchSearchForm() method for exactly this use case.
   */
  private applyPatchToEngine(patch: ISearchEnginePatch): void {
    const engine = this.searchEngine();
    if (!engine) return;

    // Delegate to engine's public API — see updated engine component below
    engine.patchSearchForm(patch);
  }

  /** Smooth scroll back to the search engine after a card is clicked. */
  private scrollToEngine(): void {
    const el = document.getElementById('flight-search-engine-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  private triggerPatchToast(): void {
    this.showPatchToast.set(true);
    if (this.patchToastTimer) clearTimeout(this.patchToastTimer);
    this.patchToastTimer = setTimeout(() => this.showPatchToast.set(false), 3200);
  }
}