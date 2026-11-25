// ============================================================================
// flights.store.ts  
// Asiaporeair | Signals-Based Store — Flight Information & Exploration
//
// Strict store boundary: this store is used EXCLUSIVELY by the flight-info/
// feature module. It never participates in the booking flow.
// 
//   currentFlightSegment  → IFlightSegmentDto from Step B of the status chain
//   currentFlightDetails  → IFlightDetailsDto from Step C of the status chain
//   isSearching           → Boolean — true while the chained API calls run
//   lastSearchedFlightNum → Preserves the searched flight number for display
//   lastSearchedDate      → Preserves the searched date for display
//   setStatusChainResult  → Single atomic action that stores BOTH results at once
//   clearStatusResult     → Wipes only status-chain data (for re-search)
// ============================================================================
import { Injectable, signal, computed } from '@angular/core';
import { IFlightItineraryDto, IFlightDetailsDto, IFlightSegmentDto } from '@shared-core';
import { IFareBasisCodeDto } from '@shared-core';
import { ISearchSegmentDto } from '@shared-core';

// ── Route pre-population patch value ─────────────────────────────────────────
// Emitted by popular-routes / destination-explorer card clicks so the
// flight-search-engine can patch its form without triggering a navigation.
export interface ISearchEnginePatch {
    originIata?: string;
    originDisplay?: string;
    destinationIata?: string;
    destinationDisplay?: string;
    /** Optional preferred cabin pre-selection */
    cabinClass?: string;
}

// ── Promotional banner shape ───────────────────────────────────────────────────
export interface IPromoBanner {
    id: string;
    imageGradient: string; // CSS gradient used as background
    tag: string;           // e.g. "Early Bird"
    headline: string;
    subline: string;
    discountCode: string;
    validUntil: string;   // Display string e.g. "31 Dec 2025"
    ctaLabel: string;
    route?: ISearchEnginePatch;
}

// ── Popular route card shape ───────────────────────────────────────────────────
export interface IPopularRoute {
    id: string;
    origin: string;            // IATA
    destination: string;       // IATA
    destinationCity: string;
    destinationCountry: string;
    imageGradient: string;
    imageUrl?: string;         // Professional photographer photo
    fromPrice: number;
    currency: string;
    cabinClass: string;
}

// ── Destination explorer card shape ───────────────────────────────────────────
export interface IDestinationCard {
    id: string;
    city: string;
    country: string;
    iata: string;
    originIata: string;       // assumes SIN as default hub
    tagline: string;
    imageGradient: string;
    imageUrl?: string;        // Professional photographer photo
    offerLabel: string;
    fromPrice: number;
    currency: string;
}



// ── Status chain result — stores both API results atomically ──────────
export interface IStatusChainResult {
    segment: IFlightSegmentDto;
    details: IFlightDetailsDto;
}

// ── Active fares directory state ──────────────────────────────────────────────
export type FaresLoadStatus = 'idle' | 'loading' | 'success' | 'error';

@Injectable({ providedIn: 'root' })
export class FlightsStore {

    // ── Search-engine patch signal ────────────────────────────────────────────
    /**
     * Written by popular-routes / destination-explorer when a card is clicked.
     * Read by FlightSearchComponent which forwards the patch to
     * FlightSearchEngineComponent via a public method call.
     * Reset to null after the patch has been applied.
     */
    readonly pendingSearchPatch = signal<ISearchEnginePatch | null>(null);

    // ── Flight details state ──────────────────────────────────────────────────
    readonly selectedFlightDetails = signal<IFlightDetailsDto | null>(null);
    readonly flightDetailsLoading = signal<boolean>(false);
    readonly flightDetailsError = signal<string | null>(null);

    // ── Flight status state ───────────────────────────────────────────────────
    readonly flightStatusResult = signal<IFlightSegmentDto | null>(null);
    readonly flightStatusLoading = signal<boolean>(false);
    readonly flightStatusError = signal<string | null>(null);

    // ── status chain signals ─────────────────────────────────


    readonly currentFlightSegment = signal<IFlightSegmentDto | null>(null);

    readonly currentFlightDetails = signal<IFlightDetailsDto | null>(null);

    readonly isSearching = signal<boolean>(false);

    readonly lastSearchedFlightNum = signal<string>('');

    readonly lastSearchedDate = signal<string>('');


    readonly statusChainError = signal<string | null>(null);


    // ── Active fares directory ────────────────────────────────────────────────
    readonly activeFares = signal<IFareBasisCodeDto[]>([]);
    readonly faresLoadStatus = signal<FaresLoadStatus>('idle');
    readonly faresError = signal<string | null>(null);

    // ── Promotional banners (static data; replace with API call in production) ──
    readonly promoBanners = signal<IPromoBanner[]>([
        {
            id: 'promo-1',
            imageGradient: 'linear-gradient(135deg, #051937 0%, #0a3365 50%, #0d2547 100%)',
            tag: 'Loyalty Exclusive',
            headline: 'Singapore to London',
            subline: 'Business Suite fares from SGD 4,200. Complimentary lounge access included.',
            discountCode: 'ASP-BSUITE22',
            validUntil: '31 Mar 2026',
            ctaLabel: 'Secure This Offer',
            route: {
                originIata: 'SIN', originDisplay: 'Singapore (SIN)',
                destinationIata: 'LHR', destinationDisplay: 'London (LHR)',
                cabinClass: 'Business'
            }
        },
        {
            id: 'promo-2',
            imageGradient: 'linear-gradient(135deg, #0d1b2e 0%, #1a3a5c 40%, #0d2547 100%)',
            tag: 'Value Fare',
            headline: 'Escape to Tokyo',
            subline: 'Premium Economy to Narita from SGD 1,180. Cherry blossom season awaits.',
            discountCode: 'ASP-TYO2026',
            validUntil: '15 Apr 2026',
            ctaLabel: 'Begin Your Journey',
            route: {
                originIata: 'SIN', originDisplay: 'Singapore (SIN)',
                destinationIata: 'NRT', destinationDisplay: 'Tokyo (NRT)',
                cabinClass: 'PremiumEconomy'
            }
        },
        {
            id: 'promo-3',
            imageGradient: 'linear-gradient(135deg, #07112b 0%, #123055 45%, #0b1e38 100%)',
            tag: 'New Route',
            headline: 'Cape Town Direct',
            subline: 'Non-stop service launches this season. Economy fares from SGD 820.',
            discountCode: 'ASP-CPT-NEW',
            validUntil: '30 Jun 2026',
            ctaLabel: 'Explore Fares',
            route: {
                originIata: 'SIN', originDisplay: 'Singapore (SIN)',
                destinationIata: 'CPT', destinationDisplay: 'Cape Town (CPT)',
                cabinClass: 'Economy'
            }
        }
    ]);

    // ── Popular routes (static; replace with FlightsService call in production) ─
    readonly popularRoutes = signal<IPopularRoute[]>([
        {
            id: 'r-sin-lhr',
            origin: 'SIN', destination: 'LHR',
            destinationCity: 'London', destinationCountry: 'United Kingdom',
            imageGradient: 'linear-gradient(160deg, #051937 0%, #0c3160 60%, #041428 100%)',
            imageUrl: 'assets/images/destinations/london.png',
            fromPrice: 1980, currency: 'SGD', cabinClass: 'Economy'
        },
        {
            id: 'r-sin-nrt',
            origin: 'SIN', destination: 'NRT',
            destinationCity: 'Tokyo', destinationCountry: 'Japan',
            imageGradient: 'linear-gradient(160deg, #0d1a30 0%, #1b3a5a 55%, #08152b 100%)',
            imageUrl: 'assets/images/destinations/tokyo.png',
            fromPrice: 880, currency: 'SGD', cabinClass: 'Economy'
        },
        {
            id: 'r-sin-jfk',
            origin: 'SIN', destination: 'JFK',
            destinationCity: 'New York', destinationCountry: 'United States',
            imageGradient: 'linear-gradient(160deg, #07152a 0%, #0e2e4c 50%, #061220 100%)',
            imageUrl: 'assets/images/destinations/new-york.png',
            fromPrice: 2450, currency: 'SGD', cabinClass: 'Economy'
        },
        {
            id: 'r-sin-syd',
            origin: 'SIN', destination: 'SYD',
            destinationCity: 'Sydney', destinationCountry: 'Australia',
            imageGradient: 'linear-gradient(160deg, #0b1f38 0%, #163355 55%, #091a2e 100%)',
            imageUrl: 'assets/images/destinations/sydney.png',
            fromPrice: 620, currency: 'SGD', cabinClass: 'Economy'
        }
    ]);

    // ── Destination explorer cards ─────────────────────────────────────────────
    readonly destinationCards = signal<IDestinationCard[]>([
        {
            id: 'd-kl', city: 'Kuala Lumpur', country: 'Malaysia', iata: 'KUL', originIata: 'SIN',
            tagline: 'Heart of South East Asia',
            imageGradient: 'linear-gradient(150deg, #0a1e35 0%, #1a3a5c 50%, #061525 100%)',
            imageUrl: 'assets/images/destinations/kuala-lumpur.png',
            offerLabel: 'Best Seller', fromPrice: 183, currency: 'SGD'
        },
        {
            id: 'd-sel', city: 'Seoul', country: 'South Korea', iata: 'ICN', originIata: 'SIN',
            tagline: 'Traditional soul, modern pulse',
            imageGradient: 'linear-gradient(150deg, #071830 0%, #0e2d4a 55%, #051428 100%)',
            imageUrl: 'assets/images/destinations/seoul.png',
            offerLabel: 'Early Bird', fromPrice: 518, currency: 'SGD'
        },
        {
            id: 'd-hgh', city: 'Hangzhou', country: 'China', iata: 'HGH', originIata: 'SIN',
            tagline: 'Serenity on the West Lake',
            imageGradient: 'linear-gradient(150deg, #06172c 0%, #122d47 50%, #060f1e 100%)',
            imageUrl: 'assets/images/destinations/hangzhou.png',
            offerLabel: 'Value Fare', fromPrice: 439, currency: 'SGD'
        },
        {
            id: 'd-pen', city: 'Penang', country: 'Malaysia', iata: 'PEN', originIata: 'SIN',
            tagline: 'Heritage and culinary delight',
            imageGradient: 'linear-gradient(150deg, #0d1f34 0%, #193448 50%, #0a1826 100%)',
            imageUrl: 'assets/images/destinations/penang.png',
            offerLabel: 'Hot Pick', fromPrice: 201, currency: 'SGD'
        },
        {
            id: 'd-hkt', city: 'Phuket', country: 'Thailand', iata: 'HKT', originIata: 'SIN',
            tagline: 'Island paradise awaits',
            imageGradient: 'linear-gradient(150deg, #080e1e 0%, #0f2236 55%, #070b18 100%)',
            imageUrl: 'assets/images/destinations/phuket.png',
            offerLabel: 'Limited Seats', fromPrice: 237, currency: 'SGD'
        },
        {
            id: 'd-sgn', city: 'Ho Chi Minh City', country: 'Vietnam', iata: 'SGN', originIata: 'SIN',
            tagline: 'The energy of Saigon',
            imageGradient: 'linear-gradient(150deg, #091b30 0%, #12304c 50%, #071526 100%)',
            imageUrl: 'assets/images/destinations/ho-chi-minh.png',
            offerLabel: 'Best Value', fromPrice: 239, currency: 'SGD'
        }
    ]);

    // ── Computed selectors ────────────────────────────────────────────────────
    readonly hasPendingPatch = computed(() => this.pendingSearchPatch() !== null);
    readonly isFaresLoading = computed(() => this.faresLoadStatus() === 'loading');
    /** True once both halves of the status chain have been stored. */
    readonly hasCompleteStatus = computed(() =>
        this.currentFlightSegment() !== null && this.currentFlightDetails() !== null
    );

    /** Convenience: the official status string from the details half. */
    readonly currentStatusLabel = computed(() =>
        this.currentFlightDetails()?.status ?? null
    );
    // ── Actions ───────────────────────────────────────────────────────────────

    /**
     * Called by popular-routes or destination-explorer card click.
     * Sets a pending patch that FlightSearchComponent will apply to the engine.
     */
    requestSearchPatch(patch: ISearchEnginePatch): void {
        this.pendingSearchPatch.set(patch);
    }

    /** Called by FlightSearchComponent after it has applied the patch. */
    clearPendingPatch(): void {
        this.pendingSearchPatch.set(null);
    }

    // ── Actions — Standalone flight details ───────────────────────────────────

    setFlightDetails(details: IFlightDetailsDto): void {
        this.selectedFlightDetails.set(details);
        this.flightDetailsError.set(null);
    }

    setFlightDetailsLoading(v: boolean): void { this.flightDetailsLoading.set(v); }

    setFlightDetailsError(msg: string): void {
        this.flightDetailsError.set(msg);
        this.flightDetailsLoading.set(false);
    }

    // ── Actions — Legacy single-step status ───────────────────────────────────

    setFlightStatus(result: IFlightSegmentDto): void {
        this.flightStatusResult.set(result);
        this.flightStatusError.set(null);
        this.flightStatusLoading.set(false);
    }

    setFlightStatusLoading(v: boolean): void { this.flightStatusLoading.set(v); }

    setFlightStatusError(msg: string): void {
        this.flightStatusError.set(msg);
        this.flightStatusLoading.set(false);
    }

    // ── Actions — status chain ───────────────────────────────

    /**
     * Called immediately before dispatching the status chain.
     * Records what the user searched for so the viewer page can display it.
     */
    beginStatusSearch(flightNumber: string, date: string): void {
        this.isSearching.set(true);
        this.statusChainError.set(null);
        this.currentFlightSegment.set(null);
        this.currentFlightDetails.set(null);
        this.lastSearchedFlightNum.set(flightNumber.toUpperCase());
        this.lastSearchedDate.set(date);
    }

    /**
     * Atomic action: stores BOTH halves of the status chain result in a
     * single store update, then clears the loading flag.
     * Called by FlightStatusComponent after the switchMap chain completes.
     */
    setStatusChainResult(result: IStatusChainResult): void {
        this.currentFlightSegment.set(result.segment);
        this.currentFlightDetails.set(result.details);
        this.isSearching.set(false);
        this.statusChainError.set(null);
        // Mirror into legacy signals for backwards compat
        this.flightStatusResult.set(result.segment);
        this.selectedFlightDetails.set(result.details);
    }

    /**
     * Records a status chain failure with a concierge-toned message.
     */
    setStatusChainError(message: string): void {
        this.statusChainError.set(message);
        this.isSearching.set(false);
    }

    /**
     * Wipes only the status-chain results so the user can run a fresh search
     * without clearing the rest of the exploration store.
     */
    clearStatusResult(): void {
        this.currentFlightSegment.set(null);
        this.currentFlightDetails.set(null);
        this.statusChainError.set(null);
        this.isSearching.set(false);
        this.lastSearchedFlightNum.set('');
        this.lastSearchedDate.set('');
    }

    // ── Actions — Fares directory ─────────────────────────────────────────────
    setActiveFares(fares: IFareBasisCodeDto[]): void {
        this.activeFares.set(fares);
        this.faresLoadStatus.set('success');
        this.faresError.set(null);
    }
    setFaresLoading(): void { this.faresLoadStatus.set('loading'); }
    setFaresError(msg: string): void {
        this.faresLoadStatus.set('error');
        this.faresError.set(msg);
    }

    // ── Full reset ─────────────────────────────────────────────────────────────
    resetExplorationState(): void {
        this.pendingSearchPatch.set(null);
        this.selectedFlightDetails.set(null);
        this.flightDetailsLoading.set(false);
        this.flightDetailsError.set(null);
        this.flightStatusResult.set(null);
        this.flightStatusLoading.set(false);
        this.flightStatusError.set(null);
        this.currentFlightSegment.set(null);
        this.currentFlightDetails.set(null);
        this.isSearching.set(false);
        this.statusChainError.set(null);
        this.lastSearchedFlightNum.set('');
        this.lastSearchedDate.set('');
    }
}