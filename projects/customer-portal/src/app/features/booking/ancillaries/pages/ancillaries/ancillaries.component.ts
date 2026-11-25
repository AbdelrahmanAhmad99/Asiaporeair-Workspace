// ============================================================================
// ancillaries.component.ts
// Asiaporeair | "Personalise Your Journey" — Ancillaries Smart Page
// ============================================================================

import {
  Component, OnInit, OnDestroy, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  trigger, transition, style, animate, stagger, query
} from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';

import { BookingStore, BookingStep, IAncillaryLineItem } from '../../../store/booking.store';
import { AncillaryService } from '@shared-core';
import { BookingService } from '@shared-core';
import { IAncillaryProduct } from '@shared-core';
import { ICreateBookingDto, IAddAncillaryDto, IBookingDto } from '@shared-core';
import { ICreatePassengerDto } from '@shared-core';

import { AncillaryCategoryCardComponent } from '../../components/ancillary-category-card/ancillary-category-card.component';
import { AncillaryItemSelectorComponent } from '../../components/ancillary-item-selector/ancillary-item-selector.component';
import { SelectionSummaryStickyComponent } from '../../components/selection-summary-sticky/selection-summary-sticky.component';
import { BookingConfirmationModalComponent } from '../../components/booking-confirmation-modal/booking-confirmation-modal.component';

// ── Category Icon Map ─────────────────────────────────────────────────────────
export const CATEGORY_META: Record<string, { label: string; description: string; iconKey: string }> = {
  BAGGAGE: {
    label: 'Extra Baggage',
    description: 'Add checked luggage allowance for a seamless journey',
    iconKey: 'baggage'
  },
  MEAL: {
    label: 'Dining Selections',
    description: 'Elevate your inflight dining experience',
    iconKey: 'meal'
  },
  LOUNGE: {
    label: 'Lounge Access',
    description: 'Relax in premium airport lounges before departure',
    iconKey: 'lounge'
  },
  SEAT: {
    label: 'Seat Upgrades',
    description: 'Secure preferred seating in advance',
    iconKey: 'seat'
  },
  INSURANCE: {
    label: 'Travel Protection',
    description: 'Comprehensive coverage for peace of mind',
    iconKey: 'insurance'
  },
  WIFI: {
    label: 'Inflight Connectivity',
    description: 'Stay connected at cruising altitude',
    iconKey: 'wifi'
  }
};

// ── Animations ────────────────────────────────────────────────────────────────
const ANCILLARY_ANIMATIONS = [
  trigger('pageEnter', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('500ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),
  trigger('cardStagger', [
    transition('* => *', [
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(28px)' }),
        stagger(80, [
          animate('480ms cubic-bezier(0.16,1,0.3,1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('panelExpand', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-8px)' }),
      animate('320ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateY(0)' }))
    ]),
    transition(':leave', [
      animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' }))
    ])
  ]),
  trigger('summarySlide', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(20px)' }),
      animate('400ms 150ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateX(0)' }))
    ])
  ]),
  trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('300ms ease-out', style({ opacity: 1 }))
    ])
  ])
];

@Component({
  selector: 'app-ancillaries',
  standalone: true,
  imports: [
    CommonModule,
    AncillaryCategoryCardComponent,
    AncillaryItemSelectorComponent,
    SelectionSummaryStickyComponent,
    BookingConfirmationModalComponent
  ],
  animations: ANCILLARY_ANIMATIONS,
  templateUrl: './ancillaries.component.html',
  styleUrls: ['./ancillaries.component.scss']
})
export class AncillariesComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────────
  readonly bookingStore = inject(BookingStore);
  private readonly ancillaryService = inject(AncillaryService);
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // ── Store Reads ───────────────────────────────────────────────────────────
  readonly selectedFlight = computed(() => this.bookingStore.selectedFlight());
  readonly selectedFare = computed(() => this.bookingStore.selectedFare());
  readonly searchCriteria = computed(() => this.bookingStore.searchCriteria());
  readonly passengerDetails = computed(() => this.bookingStore.passengerDetails());
  readonly baseFareTotal = computed(() => this.bookingStore.baseFareTotal());
  readonly currency = signal<string>('SGD');

  // ── Product State ─────────────────────────────────────────────────────────
  readonly allProducts = signal<IAncillaryProduct[]>([]);
  readonly isLoadingProducts = signal<boolean>(false);
  readonly productsError = signal<string | null>(null);
  readonly activeCategoryKey = signal<string | null>(null);

  // ── Active Passenger Tab ──────────────────────────────────────────────────
  readonly activePaxIndex = signal<number>(0);

  // ── Booking State ─────────────────────────────────────────────────────────
  readonly isBookingLoading = signal<boolean>(false);
  readonly bookingError = signal<string | null>(null);
  readonly confirmedBooking = signal<IBookingDto | null>(null);
  readonly showConfirmModal = signal<boolean>(false);

  // ── Derived Categorised Products ──────────────────────────────────────────
  readonly categories = computed(() => {
    const products = this.allProducts();
    const categoryKeys = [...new Set(products.map(p => p.category.toUpperCase()))];
    return categoryKeys.map(key => ({
      key,
      meta: CATEGORY_META[key] ?? { label: key, description: '', iconKey: 'default' },
      products: products.filter(p => p.category.toUpperCase() === key),
      selectedCount: this.getCategorySelectedCount(key)
    }));
  });

  readonly activeProducts = computed(() => {
    const key = this.activeCategoryKey();
    if (!key) return [];
    return this.allProducts().filter(p => p.category.toUpperCase() === key);
  });

  /** Flat list of every non-zero selection across all passengers. */
  readonly selectionLineItems = computed((): IAncillaryLineItem[] => {
    const lines: IAncillaryLineItem[] = [];
    const products = this.allProducts();
    const paxSelections = this.bookingStore.ancillarySelections();

    for (const pax of paxSelections) {
      pax.selections.forEach((qty, productId) => {
        if (qty <= 0) return;
        const product = products.find(p => p.productId === productId);
        if (!product) return;
        lines.push({
          productId,
          productName: product.name,
          category: product.category,
          unitOfMeasure: product.unitOfMeasure,
          baseCost: product.baseCost,
          quantity: qty,
          passengerIndex: pax.passengerIndex,
          passengerLabel: pax.passengerLabel,
          lineTotal: product.baseCost * qty
        });
      });
    }
    return lines;
  });

  readonly ancillariesTotalCost = computed(() =>
    this.selectionLineItems().reduce((sum, item) => sum + item.lineTotal, 0)
  );

  readonly grandTotal = computed(() =>
    this.baseFareTotal() + this.ancillariesTotalCost()
  );

  readonly journeyLabel = computed(() => {
    const c = this.searchCriteria();
    if (!c?.segments?.length) return '';
    return `${c.segments[0].originIataCode} → ${c.segments[c.segments.length - 1].destinationIataCode}`;
  });

  readonly flightSummary = computed(() => {
    const flight = this.selectedFlight();
    const fare = this.selectedFare();
    if (!flight || !fare) return null;
    const seg = flight.outboundSegments?.[0];
    return seg ? {
      route: `${seg.originAirportIata} → ${seg.destinationAirportIata}`,
      airline: seg.airlineName,
      cabinClass: fare.cabinClass,
      fareName: fare.fareName
    } : null;
  });

  readonly passengerLabels = computed(() =>
    this.bookingStore.ancillarySelections().map(p => ({
      index: p.passengerIndex,
      label: p.passengerLabel
    }))
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.initPassengerSelections();
    this.loadAncillaryProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Private Initialisers ──────────────────────────────────────────────────

  private initPassengerSelections(): void {
    const criteria = this.searchCriteria();
    if (!criteria) return;

    const labels: { index: number; label: string }[] = [];
    let idx = 0;
    const { adults, children, infants } = criteria.passengers;

    for (let i = 0; i < adults; i++)   labels.push({ index: idx++, label: adults === 1 ? 'Adult Traveller' : `Adult Traveller ${i + 1}` });
    for (let i = 0; i < children; i++) labels.push({ index: idx++, label: children === 1 ? 'Child Traveller' : `Child Traveller ${i + 1}` });
    for (let i = 0; i < infants; i++)  labels.push({ index: idx++, label: infants === 1 ? 'Infant' : `Infant ${i + 1}` });

    this.bookingStore.initAncillarySelections(labels);
  }

  private loadAncillaryProducts(): void {
    const flight = this.selectedFlight();
    const flightInstanceId = flight?.outboundSegments?.[0]?.flightInstanceId as number | undefined;

    if (!flightInstanceId) {
      this.productsError.set('Flight details are unavailable. Please return to flight selection.');
      return;
    }

    this.isLoadingProducts.set(true);
    this.productsError.set(null);

    this.ancillaryService.getAvailableProducts(flightInstanceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.allProducts.set(products);
          this.isLoadingProducts.set(false);
          // Auto-expand the first category
          if (products.length > 0) {
            const firstKey = products[0].category.toUpperCase();
            this.activeCategoryKey.set(firstKey);
          }
        },
        error: (err) => {
          console.error('Ancillary load error:', err);
          this.productsError.set('We could not load enhancement options. You may continue without them.');
          this.isLoadingProducts.set(false);
        }
      });
  }

  // ── Public Actions ────────────────────────────────────────────────────────

  toggleCategory(key: string): void {
    this.activeCategoryKey.update(current => current === key ? null : key);
    this.activePaxIndex.set(0); // reset pax tab when switching category
  }

  setActivePax(index: number): void {
    this.activePaxIndex.set(index);
  }

  onQuantityChange(passengerIndex: number, productId: number, quantity: number): void {
    this.bookingStore.setAncillaryQuantity(passengerIndex, productId, quantity);
  }

  getQuantity(passengerIndex: number, productId: number): number {
    return this.bookingStore.getAncillaryQuantity(passengerIndex, productId);
  }

  onBack(): void {
    this.bookingStore.goToStep(BookingStep.Passengers);
    this.router.navigate(['/booking/passenger-details']);
  }

  /**
   * Assembles the final ICreateBookingDto, calls createBooking(), and on
   * success opens the confirmation modal. Modal dismissal navigates to seats.
   */
  onConfirmAndBook(): void {
    if (this.isBookingLoading()) return;

    const flight = this.selectedFlight();
    const fare = this.selectedFare();
    const passengers = this.passengerDetails();
    const lineItems = this.selectionLineItems();

    if (!flight || !fare || passengers.length === 0) {
      this.bookingError.set('Booking data is incomplete. Please go back and review your selections.');
      return;
    }

    // Map passengers → ICreatePassengerDto (Excluding nationality as per backend requirement)
    const passengerDtos: ICreatePassengerDto[] = passengers.map(p => ({
      firstName: p.firstName,
      lastName: p.lastName,
      dateOfBirth: p.dateOfBirth,
      passportNumber: p.passportNumber
      // nationality: p.nationality // Backend doesn't need this
    }));

    // Map selections → IAddAncillaryDto
    const flightInstanceId = flight.outboundSegments?.[0]?.flightInstanceId as number;

    const ancillaryDtos: IAddAncillaryDto[] = lineItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      segmentId: flightInstanceId // Using the outbound segment ID for all purchases in this simple flow
    }));

    const createDto: ICreateBookingDto = {
      flightInstanceId,
      fareBasisCode: fare.fareBasisCode,
      passengers: passengerDtos,
      ancillaryPurchases: ancillaryDtos.length > 0 ? ancillaryDtos : null
    };

    this.isBookingLoading.set(true);
    this.bookingError.set(null);

    this.bookingService.createBooking(createDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (booking) => {
          this.isBookingLoading.set(false);
          this.confirmedBooking.set(booking);
          this.bookingStore.setConfirmedBooking(booking); // PERSIST TO STORE
          this.showConfirmModal.set(true);
          this.bookingStore.goToStep(BookingStep.Seats);
        },
        error: (err) => {
          console.error('Booking creation error:', err);
          this.isBookingLoading.set(false);
          this.bookingError.set(
            err?.error?.message ?? 'Your booking could not be processed. Please try again.'
          );
        }
      });
  }

  onModalDismiss(): void {
    this.showConfirmModal.set(false);
    this.router.navigate(['/booking/seat-selection']);
  }

  // ── Template Helpers ──────────────────────────────────────────────────────

  getCategorySelectedCount(categoryKey: string): number {
    const products = this.allProducts().filter(p => p.category.toUpperCase() === categoryKey);
    const paxList = this.bookingStore.ancillarySelections();
    let count = 0;
    for (const pax of paxList) {
      for (const product of products) {
        if ((pax.selections.get(product.productId) ?? 0) > 0) count++;
      }
    }
    return count;
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  trackByCategory(_: number, cat: { key: string }): string {
    return cat.key;
  }

  trackByProduct(_: number, p: IAncillaryProduct): number {
    return p.productId;
  }
}