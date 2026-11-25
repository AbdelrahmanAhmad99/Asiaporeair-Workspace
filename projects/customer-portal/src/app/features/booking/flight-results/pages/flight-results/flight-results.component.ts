// ============================================================================
// flight-results.component.ts
// Asiaporeair | "Select Your Suite" — Premium Flight Results
// ============================================================================

import {
    Component, OnInit, OnDestroy, inject, input, output,
    signal, computed, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, stagger, query, state } from '@angular/animations';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { FlightsService } from '@shared-core';

import {
    IFlightItineraryDto,
    IFlightSegmentDto,
    IFlightFareOptionDto,
    IFlightDetailsDto
} from '@shared-core';
import { BookingStore, BookingStep } from '../../../store/booking.store';

// ── Types ──────────────────────────────────────────────────────

// ── Local UI State Interfaces ─────────────────────────────────────────────────
export interface ISelectedFare {
    itineraryId: string;
    fareOption: IFlightFareOptionDto;
}

export interface IFilterState {
    stops: ('nonstop' | '1stop' | '2stop')[];
    maxPrice: number | null;
    departureSlots: ('morning' | 'afternoon' | 'evening' | 'night')[];
    cabinClass: string | null;
}

export type SortOption = 'duration' | 'price' | 'departure' | 'arrival';

// ── Animation Definitions ─────────────────────────────────────────────────────
const LUXURY_ANIMATIONS = [
    trigger('listStagger', [
        transition('* => *', [
            query(':enter', [
                style({ opacity: 0, transform: 'translateY(24px)' }),
                stagger(80, [
                    animate('500ms cubic-bezier(0.16,1,0.3,1)',
                        style({ opacity: 1, transform: 'translateY(0)' }))
                ])
            ], { optional: true })
        ])
    ]),

    trigger('fareExpand', [
        state('collapsed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
        state('expanded', style({ height: '*', opacity: 1, overflow: 'hidden' })),
        transition('collapsed <=> expanded', [
            animate('380ms cubic-bezier(0.16,1,0.3,1)')
        ])
    ]),

    trigger('detailsSlide', [
        transition(':enter', [
            style({ opacity: 0, transform: 'translateY(-8px)' }),
            animate('300ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateY(0)' }))
        ]),
        transition(':leave', [
            animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' }))
        ])
    ]),

    trigger('fadeSlideIn', [
        transition(':enter', [
            style({ opacity: 0, transform: 'translateX(16px)' }),
            animate('400ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateX(0)' }))
        ])
    ]),

    trigger('summaryPulse', [
        transition('* => *', [
            animate('200ms ease-out')
        ])
    ])
];

@Component({
    selector: 'app-flight-results',
    standalone: true,
    imports: [CommonModule],
    animations: LUXURY_ANIMATIONS,
    templateUrl: './flight-results.component.html',
    styleUrls: ['./flight-results.component.scss']
})
export class FlightResultsComponent implements OnInit, OnDestroy {

    // ── DI ────────────────────────────────────────────────────────────────────
    private readonly flightsService = inject(FlightsService);
    private readonly bookingStore   = inject(BookingStore);
    private readonly router         = inject(Router);
    private readonly destroy$       = new Subject<void>();

    constructor() {
        // Initialize max price filter to overall max
        effect(() => {
            const stats = this.priceStats();
            this.filters.update(f => ({ ...f, maxPrice: stats.max }));
        }, { allowSignalWrites: true });
    }

    // ── Derived Data from Store ───────────────────────────────────────────────
    readonly itineraries = computed(() => this.bookingStore.availableFlights());
    readonly isLoading = computed(() => this.bookingStore.loading());
    readonly totalPassengers = computed(() => {
        const c = this.bookingStore.searchCriteria();
        return c ? (c.passengers.adults + c.passengers.children + c.passengers.infants) : 1;
    });
    readonly searchLabel = computed(() => {
        const c = this.bookingStore.searchCriteria();
        if (!c || !c.segments.length) return '';
        const s = c.segments;
        return `${s[0].originIataCode} ➜ ${s[s.length - 1].destinationIataCode}`;
    });
    readonly currency = signal<string>('SGD');

    // ── Inputs & Outputs ──────────────────────────────────────────────────────

    readonly flightSelected = output<{ itineraryId: string; fare: IFlightFareOptionDto }>();
    readonly proceedToPassengers = output<void>();
    readonly editSearch = output<void>();

    // ── UI State Signals ──────────────────────────────────────────────────────
    readonly expandedItineraryId = signal<string | null>(null);
    readonly expandedFareItineraryId = signal<string | null>(null);
    readonly selectedFares = signal<Map<string, ISelectedFare>>(new Map());
    readonly activeSort = signal<SortOption>('duration');
    readonly loadingDetailsId = signal<number | null>(null);
    readonly flightDetailsMap = signal<Map<number, IFlightDetailsDto>>(new Map());
    readonly summaryVersion = signal<number>(0); // for pulse animation

    // ── Filter State ──────────────────────────────────────────────────────────
    readonly filters = signal<IFilterState>({
        stops: [],
        maxPrice: null,
        departureSlots: [],
        cabinClass: null
    });

    // ── Computed: Sorted & Filtered Results ───────────────────────────────────
    readonly processedItineraries = computed(() => {
        let list = [...this.itineraries()];

        // Apply filters
        const f = this.filters();

        if (f.stops.length > 0) {
            list = list.filter(it => {
                const stops = it.numberOfStops;
                return f.stops.some(s =>
                    (s === 'nonstop' && stops === 0) ||
                    (s === '1stop' && stops === 1) ||
                    (s === '2stop' && stops >= 2)
                );
            });
        }

        if (f.maxPrice !== null) {
            list = list.filter(it => this.getLowestPrice(it) <= f.maxPrice!);
        }

        if (f.departureSlots.length > 0) {
            list = list.filter(it => {
                const hour = new Date(it.outboundSegments[0]?.departureTime).getHours();
                return f.departureSlots.some(slot =>
                    (slot === 'morning' && hour >= 6 && hour < 12) ||
                    (slot === 'afternoon' && hour >= 12 && hour < 18) ||
                    (slot === 'evening' && hour >= 18 && hour < 22) ||
                    (slot === 'night' && (hour >= 22 || hour < 6))
                );
            });
        }

        if (f.cabinClass) {
            list = list.filter(it =>
                it.fareOptions.some(fo => fo.cabinClass.toLowerCase() === f.cabinClass!.toLowerCase())
            );
        }

        // Apply sort
        const sort = this.activeSort();
        return list.sort((a, b) => {
            if (sort === 'duration') return a.totalDurationMinutes - b.totalDurationMinutes;
            if (sort === 'price') return this.getLowestPrice(a) - this.getLowestPrice(b);
            if (sort === 'departure') {
                return new Date(a.outboundSegments[0]?.departureTime).getTime() -
                    new Date(b.outboundSegments[0]?.departureTime).getTime();
            }
            if (sort === 'arrival') {
                const lastA = a.outboundSegments[a.outboundSegments.length - 1];
                const lastB = b.outboundSegments[b.outboundSegments.length - 1];
                return new Date(lastA?.arrivalTime).getTime() - new Date(lastB?.arrivalTime).getTime();
            }
            return 0;
        });
    });

    // ── Computed: Price Summary ───────────────────────────────────────────────
    readonly priceSummary = computed(() => {
        const fares = this.selectedFares();
        if (fares.size === 0) return null;

        let total = 0;
        const breakdowns: { label: string; price: number; fare: string }[] = [];
        const pax = this.totalPassengers();

        fares.forEach((sf) => {
            const fo = sf.fareOption;
            const linePrice = fo.pricePerAdult * pax;
            total += linePrice;
            breakdowns.push({
                label: `${sf.fareOption.fareName} · ${sf.fareOption.cabinClass}`,
                price: linePrice,
                fare: fo.fareBasisCode
            });
        });

        return { total, breakdowns, canProceed: fares.size > 0 };
    });

    // ── Computed: Price Stats (for filter slider) ─────────────────────────────
    readonly priceStats = computed(() => {
        const all = this.itineraries();
        if (!all.length) return { min: 0, max: 5000 };
        const prices = all.map(it => this.getLowestPrice(it));
        return { min: Math.min(...prices), max: Math.max(...prices) };
    });

    // ── Computed: Unique Cabin Classes ────────────────────────────────────────
    readonly availableCabins = computed(() => {
        const cabins = new Set<string>();
        this.itineraries().forEach(it => it.fareOptions.forEach(fo => cabins.add(fo.cabinClass)));
        return [...cabins];
    });

    // ── Lifecycle ─────────────────────────────────────────────────────────────
    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Public Methods ────────────────────────────────────────────────────────

    toggleItineraryExpand(id: string): void {
        this.expandedItineraryId.update(current => current === id ? null : id);
    }

    toggleFareExpand(id: string): void {
        this.expandedFareItineraryId.update(current => current === id ? null : id);
    }

    selectFare(itineraryId: string, fare: IFlightFareOptionDto): void {
        this.selectedFares.update(map => {
            const next = new Map(map);
            next.set(itineraryId, { itineraryId, fareOption: fare });
            return next;
        });

        // Find the full itinerary and store it in bookingStore
        const itinerary = this.itineraries().find(it => it.itineraryId === itineraryId);
        if (itinerary) {
            this.bookingStore.selectFlight(itinerary);
            this.bookingStore.selectFare(fare);
        }

        this.summaryVersion.update(v => v + 1);
        this.flightSelected.emit({ itineraryId, fare });
    }

    isFareSelected(itineraryId: string, fareBasisCode: string): boolean {
        return this.selectedFares().get(itineraryId)?.fareOption?.fareBasisCode === fareBasisCode;
    }

    setSort(sort: SortOption): void {
        this.activeSort.set(sort);
    }

    toggleStopFilter(stop: 'nonstop' | '1stop' | '2stop'): void {
        this.filters.update(f => {
            const stops = f.stops.includes(stop)
                ? f.stops.filter(s => s !== stop)
                : [...f.stops, stop];
            return { ...f, stops };
        });
    }

    toggleDepartureSlot(slot: 'morning' | 'afternoon' | 'evening' | 'night'): void {
        this.filters.update(f => {
            const departureSlots = f.departureSlots.includes(slot)
                ? f.departureSlots.filter(s => s !== slot)
                : [...f.departureSlots, slot];
            return { ...f, departureSlots };
        });
    }

    setCabinFilter(cabin: string | null): void {
        this.filters.update(f => ({ ...f, cabinClass: cabin }));
    }

    onPriceSliderChange(event: Event): void {
        const value = Number((event.target as HTMLInputElement).value);
        this.filters.update(f => ({ ...f, maxPrice: value }));
    }

    resetFilters(): void {
        this.filters.set({
            stops: [],
            maxPrice: this.priceStats().max,
            departureSlots: [],
            cabinClass: null
        });
    }

    loadFlightDetails(instanceId: number): void {
        if (this.flightDetailsMap().has(instanceId)) return;
        this.loadingDetailsId.set(instanceId);
        this.flightsService.getFlightDetails(instanceId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (details) => {
                    this.flightDetailsMap.update(map => {
                        const next = new Map(map);
                        next.set(instanceId, details);
                        return next;
                    });
                    this.loadingDetailsId.set(null);
                },
                error: () => this.loadingDetailsId.set(null)
            });
    }

    onProceed(): void {
        if (this.priceSummary()?.canProceed) {
            this.bookingStore.goToStep(BookingStep.Passengers);
            this.router.navigate(['/booking/passenger-details']);
            this.proceedToPassengers.emit();
        }
    }

    onEditSearch(): void {
        this.editSearch.emit();
    }

    // ── Template Helpers ──────────────────────────────────────────────────────

    getLowestPrice(it: IFlightItineraryDto): number {
        if (!it.fareOptions.length) return 0;
        return Math.min(...it.fareOptions.map(fo => fo.pricePerAdult));
    }

    formatDuration(minutes: number): string {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    }

    formatTime(isoString: string): string {
        return new Date(isoString).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: false
        });
    }

    formatDate(isoString: string): string {
        return new Date(isoString).toLocaleDateString('en-US', {
            day: 'numeric', month: 'short', weekday: 'short'
        });
    }

    getStopLabel(n: number): string {
        if (n === 0) return 'Nonstop';
        if (n === 1) return '1 Stop';
        return `${n} Stops`;
    }

    getStopClass(n: number): string {
        if (n === 0) return 'stop-none';
        if (n === 1) return 'stop-one';
        return 'stop-many';
    }

    getLayoverAirports(segments: IFlightSegmentDto[]): string[] {
        if (segments.length <= 1) return [];
        return segments.slice(0, -1).map(s => s.destinationAirportIata);
    }

    getFaresByClass(it: IFlightItineraryDto, cabinClass: string): IFlightFareOptionDto[] {
        return it.fareOptions.filter(fo =>
            fo.cabinClass.toLowerCase() === cabinClass.toLowerCase()
        );
    }

    getCabinTiers(it: IFlightItineraryDto): string[] {
        const order = ['Economy', 'Premium Economy', 'Business', 'First'];
        const found = [...new Set(it.fareOptions.map(fo => fo.cabinClass))];
        return order.filter(c => found.includes(c));
    }

    trackByItinerary(_: number, it: IFlightItineraryDto): string {
        return it.itineraryId;
    }

    trackByFare(_: number, fo: IFlightFareOptionDto): string {
        return fo.fareBasisCode;
    }

    isFilterActive(): boolean {
        const f = this.filters();
        const stats = this.priceStats();
        return f.stops.length > 0 ||
            f.departureSlots.length > 0 ||
            f.cabinClass !== null ||
            (f.maxPrice !== null && f.maxPrice < stats.max);
    }
}