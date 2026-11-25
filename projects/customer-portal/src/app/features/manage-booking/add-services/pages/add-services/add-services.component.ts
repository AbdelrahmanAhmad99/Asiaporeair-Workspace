// ============================================================================
// add-services.component.ts
// Asiaporeair | "Enhance Your Suite Experience" — Add Services Smart Page
// ============================================================================

import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';
import { Subject, forkJoin, of, throwError, Observable } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';

import {
  ManageBookingStore,
  IAncillaryProduct,
  IExistingAncillary,
  ICartItem,
  AncillaryCategory
} from '../../../store/manage-booking.store';
import { AncillaryService } from '@shared-core';

import { BookingService } from '@shared-core';

import { AncillaryCategoryTabsComponent } from '../../components/ancillary-category-tabs/ancillary-category-tabs.component';
import { ProductCatalogCardComponent } from '../../components/product-catalog-card/product-catalog-card.component';
import { BookingInventoryListComponent } from '../../components/booking-inventory-list/booking-inventory-list.component';
import { StickyPriceBarComponent } from '../../components/sticky-price-bar/sticky-price-bar.component';
import { AncillaryPaymentModalComponent } from '../../components/ancillary-payment-modal/ancillary-payment-modal.component';

// ── Animations ────────────────────────────────────────────────────────────────
const ADD_SERVICES_ANIMATIONS = [
  trigger('pageEnter', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(16px)' }),
      animate('420ms cubic-bezier(0.22,1,0.36,1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),
  trigger('cardsStagger', [
    transition('* => *', [
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger(60, [
          animate('380ms cubic-bezier(0.22,1,0.36,1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('slideModal', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(40px) scale(0.97)' }),
      animate('380ms cubic-bezier(0.22,1,0.36,1)',
        style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
    ]),
    transition(':leave', [
      animate('240ms ease-in',
        style({ opacity: 0, transform: 'translateY(30px) scale(0.97)' }))
    ])
  ]),
  trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('280ms ease-out', style({ opacity: 1 }))
    ])
  ])
];

export type ServiceFlowState =
  | 'browsing'
  | 'checkout'
  | 'processing'
  | 'success'
  | 'failed';

@Component({
  selector: 'app-add-services',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    AncillaryCategoryTabsComponent,
    ProductCatalogCardComponent,
    BookingInventoryListComponent,
    StickyPriceBarComponent,
    AncillaryPaymentModalComponent
  ],
  animations: ADD_SERVICES_ANIMATIONS,
  templateUrl: './add-services.component.html',
  styleUrls: ['./add-services.component.scss']
})
export class AddServicesComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────────
  private readonly store = inject(ManageBookingStore);
  private readonly ancillaryService = inject(AncillaryService);
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  // ── Store aliases ─────────────────────────────────────────────────────────
  readonly availableProducts = this.store.availableProducts;
  readonly currentAncillaries = this.store.currentAncillaries;
  readonly ancillaryCart = this.store.ancillaryCart;
  readonly deltaAmount = this.store.deltaAmount;
  readonly hasCartItems = this.store.hasCartItems;
  readonly cartItemCount = this.store.cartItemCount;
  readonly isLoading = this.store.isServicesLoading;
  readonly errorMessage = this.store.servicesError;

  // ── Local UI state ────────────────────────────────────────────────────────
  readonly activeCategory = signal<AncillaryCategory | 'All'>('All');
  readonly flowState = signal<ServiceFlowState>('browsing');
  readonly successToast = signal<boolean>(false);

  // Route params
  public bookingId: number = 0;
  public flightInstanceId: number = 0;
  public pnrCode: string = '';

  // ── Categories derived from available products ────────────────────────────
  readonly categories = computed(() => {
    const cats = new Set<string>(
      this.availableProducts()
        .map(p => (p.category || 'Other').toUpperCase())
        .filter(c => !!c)
    );
    return ['All', ...Array.from(cats)] as any[];
  });

  readonly filteredProducts = computed(() => {
    const all = this.availableProducts();
    const cat = this.activeCategory(); // Changed from selectedCategory to activeCategory
    if (cat === 'All') return all;
    return all.filter(p => (p.category || '').toUpperCase() === cat.toUpperCase());
  });

  readonly bookingReference = computed((): string => {
    const d = this.store.selectedBookingDetails();
    return d?.bookingReference ?? this.pnrCode ?? '';
  });

  readonly isPaymentRequired = computed((): boolean => this.deltaAmount() > 0);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id') ?? '';
    this.bookingId = Number(rawId) || 0;
    this.pnrCode = rawId;

    this.store.clearCart();

    const detail = this.store.selectedBookingDetails();
    if (detail) {
      this.flightInstanceId = detail.flightInstanceId;
      this.loadServicesData();
    } else {
      // Robustness: If store is empty (e.g. on refresh), fetch details first
      this.fetchDetailsAndLoadServices();
    }
  }

  private fetchDetailsAndLoadServices(): void {
    this.store.setServicesLoading(true);
    const identifier = this.bookingId || this.pnrCode;

    const obs$ = typeof identifier === 'number' && identifier > 0
      ? this.bookingService.getBookingDetails(identifier)
      : this.bookingService.getBookingByReference(String(identifier));

    obs$.pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.store.setServicesError("Unable to identify your booking. Please return to My Trips.");
        return of(null);
      })
    ).subscribe(detail => {
      if (detail) {
        this.store.setBookingDetails(detail);
        this.flightInstanceId = detail.flightInstanceId;
        this.loadServicesData();
      } else {
        this.store.setServicesLoading(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.store.resetServicesState();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Private Loaders ───────────────────────────────────────────────────────

  public loadServicesData(): void {
    this.store.setServicesLoading(true);
    this.store.setServicesError(null);

    const products$ = this.flightInstanceId
      ? this.ancillaryService.getAvailableProducts(this.flightInstanceId)
      : of([] as IAncillaryProduct[]);

    const existing$ = this.bookingId
      ? this.ancillaryService.getAncillariesForBooking(this.bookingId)
      : of([] as IExistingAncillary[]);

    forkJoin({ products: products$, existing: existing$ })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.store.setServicesLoading(false)),
        catchError(err => {
          this.store.setServicesError(this.resolveError(err));
          return of({ products: [] as IAncillaryProduct[], existing: [] as IExistingAncillary[] });
        })
      )
      .subscribe(result => {
        if (result) {
          this.store.setAvailableProducts(result.products);
          this.store.setCurrentAncillaries(result.existing);
        }
      });
  }


  private resolveError(err: any): string {
    switch (err?.status) {
      case 401: return 'Please sign in to manage services.';
      case 404: return 'This booking could not be found.';
      default: return 'Unable to load services. Please try again.';
    }
  }

  // ── Public Actions ────────────────────────────────────────────────────────

  onBack(): void {
    this.router.navigate(['/manage-booking/booking', this.bookingId || this.pnrCode]);
  }

  onCategoryChange(category: AncillaryCategory | 'All'): void {
    this.activeCategory.set(category);
  }

  onAddToCart(event: { product: IAncillaryProduct; quantity: number }): void {
    this.store.addToCart(event.product, event.quantity);
  }

  onDecrementCart(productId: number): void {
    this.store.decrementFromCart(productId);
  }

  onRemoveFromCart(productId: number): void {
    this.store.removeFromCart(productId);
  }

  onStageRemoval(ancillary: IExistingAncillary): void {
    this.store.stageRemoval(ancillary);
  }

  onUnstageRemoval(saleId: number): void {
    this.store.unstageRemoval(saleId);
  }

  onProceedToPayment(): void {
    if (!this.hasCartItems()) return;
    this.flowState.set('checkout');
  }

  onCancelCheckout(): void {
    this.flowState.set('browsing');
  }

  onPaymentSuccess(): void {
    // 1. Resolve numeric bookingId (required by backend)
    const numericId = this.store.bookingId() || this.bookingId;

    if (!numericId) {
      this.store.setServicesError("Numeric Booking ID not found. Unable to persist services.");
      this.flowState.set('browsing');
      return;
    }

    // 2. Identify additions and removals
    const additions = this.store.ancillaryCart().filter(i => i.mode === 'add');
    const removals = this.store.ancillaryCart().filter(i => i.mode === 'remove');

    const ops$: Observable<any>[] = [];

    // Additions
    additions.forEach(item => {
      ops$.push(this.ancillaryService.addAncillaryToBooking({
        bookingId: numericId,
        productId: item.productId,
        quantity: item.quantity
      }));
    });

    // Removals
    removals.forEach(item => {
      if (item.saleId) {
        ops$.push(this.ancillaryService.removeAncillaryFromBooking(item.saleId));
      }
    });

    // 3. Fallback if cart was empty (shouldn't happen)
    if (ops$.length === 0) {
      this.completeSuccess(numericId);
      return;
    }

    // 4. Execute all persistence calls
    this.flowState.set('processing');

    forkJoin(ops$)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.flowState.set('success')),
        catchError(err => {
          this.store.setServicesError("Persistence failed: some services could not be saved to your booking.");
          return throwError(() => err);
        })
      )
      .subscribe({
        next: () => this.completeSuccess(numericId),
        error: () => {
          // Error already handled by catchError and store
          setTimeout(() => this.flowState.set('browsing'), 3000);
        }
      });
  }

  /**
   * Finalises the UI flow after successful persistence.
   */
  private completeSuccess(bookingId: number): void {
    this.store.applyCartOptimistically(bookingId);
    this.successToast.set(true);

    setTimeout(() => {
      this.successToast.set(false);
      // Navigate back to details using the identifier that works best
      this.router.navigate(['/manage-booking/booking', bookingId || this.pnrCode]);
    }, 2400);
  }

  onPaymentFailed(errorMsg: string): void {
    this.flowState.set('failed');
    this.store.setServicesError(errorMsg);
    setTimeout(() => this.flowState.set('browsing'), 3000);
  }

  // ── Template Helpers ──────────────────────────────────────────────────────

  getCartQuantity(productId: number): number {
    return this.store.getCartQuantity(productId);
  }

  isStagedForRemoval(saleId: number): boolean {
    return this.store.isStagedForRemoval(saleId);
  }

  formatPrice(n: number | undefined | null): string {
    return (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  trackByProduct(_: number, p: IAncillaryProduct): number { return p.productId; }
}