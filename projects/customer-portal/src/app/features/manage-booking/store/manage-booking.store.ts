// ============================================================================
// manage-booking.store.ts
// Asiaporeair | Centralised Signal Store — Manage Booking Feature 
// ============================================================================

import { Injectable, signal, computed } from '@angular/core';
import { IBookingDetailDto, IBookingPassengerDetailDto, IPassengerDto, ITicketDetailDto } from '@shared-core';

// ── Domain Types ──────────────────────────────────────────────────────────────

export type BookingStatus =
    | 'Confirmed'
    | 'PendingPayment'
    | 'Cancelled'
    | 'CheckedIn'
    | 'Flown';

export type CabinClass =
    | 'Economy'
    | 'PremiumEconomy'
    | 'Business'
    | 'Suite';

export type BookingFilter = 'all' | 'upcoming' | 'past' | 'cancelled';

export interface IManageBookingDto {
    id: string;
    pnrCode: string;
    bookingDate: string;
    status: BookingStatus;
    originCity: string;
    originCode: string;
    destinationCity: string;
    destinationCode: string;
    departureDateTime: string;
    arrivalDateTime: string;
    flightDuration: string;
    flightNumber: string;
    isRoundTrip: boolean;
    returnDepartureDateTime?: string;
    returnArrivalDateTime?: string;
    passengerCount: number;
    cabinClass: CabinClass;
    totalAmount: number;
    currency: string;
    canModify: boolean;
    canCancel: boolean;
    canCheckIn: boolean;
    boardingPassAvailable: boolean;
}

export interface IPaginatedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
}

// ── Ancillary Domain Types ────────────────────────────────────────────────────

export type AncillaryCategory =
    | 'Dining'
    | 'Baggage'
    | 'Comfort'
    | 'Lounge'
    | 'Connectivity'
    | 'Medical'
    | 'Other';

/** A product available for purchase from the ancillary marketplace. */
export interface IAncillaryProduct {
    productId: number;
    name: string;
    description?: string;
    category: AncillaryCategory | string;
    baseCost: number;
    currency?: string;
    unitOfMeasure: string;   // 'Per Person', 'Per Kg', 'Per Flight'
    maxQuantity?: number;
    isAvailable?: boolean;
    imageKey?: string;    // icon category hint
}

/** An ancillary sale already attached to this booking. */
export interface IExistingAncillary {
    saleId: number;
    bookingId: number;
    productId: number;
    productName: string;
    category?: AncillaryCategory | string;
    pricePaid: number;
    quantity: number;
    isRemovable?: boolean;   // server-side flag
}

/**
 * A pending cart item: positive quantity = add, negative = remove
 * (removal tracked by saleId of existing item).
 */
export interface ICartItem {
    productId: number;
    name: string;
    category: AncillaryCategory | string;
    baseCost: number;
    currency?: string;
    quantity: number;
    mode: 'add' | 'remove';
    saleId?: number;
}


// ── Modify Booking Types ──────────────────────────────────────────────────────

/** Tracks the in-progress edits for a single passenger before submission. */
export interface IPassengerEditDraft {
    passengerId: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string | Date | null;
    passportNumber: string | null;
    isDirty: boolean;
    isSaving: boolean;
    savedAt: string | null; // ISO timestamp of last successful save
}



// ── Cancellation Types ────────────────────────────────────────────────────────

/**
 * Tracks the multi-step state of the booking cancellation flow.
 *
 * idle       → User has landed on the cancellation page, no action taken.
 * pending    → Cancellation API call is in-flight.
 * success    → API returned true; booking has been cancelled.
 * error      → API call failed; see cancellationError for the message.
 */
export type CancellationStatus = 'idle' | 'pending' | 'success' | 'error';

/** The standardised cancellation reason payload. */
export interface ICancellationPayload {
    bookingId: number;
    reason: string;
}


// ── Retrieve Booking Types ────────────────────────────────────────────────────

/**
 * The retrieve-booking form value.
 * `lastName` is validated client-side only (not sent to the API).
 */
export interface IRetrieveFormValue {
    bookingReference: string;
    lastName: string;
}


// ── Store ─────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ManageBookingStore {

    // ── Writable Signals — List ───────────────────────────────────────────────

    readonly bookings = signal<IManageBookingDto[]>([]);
    readonly selectedBooking = signal<IManageBookingDto | null>(null);
    readonly isLoading = signal<boolean>(false);
    readonly errorMessage = signal<string | null>(null);
    readonly activeFilter = signal<BookingFilter>('all');
    readonly currentPage = signal<number>(1);
    readonly totalPages = signal<number>(1);
    readonly totalCount = signal<number>(0);
    readonly pageSize = signal<number>(10);

    // ── Writable Signals — Booking Details ───────────────────────────────────

    readonly selectedBookingDetails = signal<IBookingDetailDto | null>(null);
    readonly isDetailsLoading = signal<boolean>(false);
    readonly detailsError = signal<string | null>(null);
    readonly bookingId = signal<number | null>(null);

    // ── Writable Signals — Ancillary Add-Services ────────────────────────────

    /**
     * Products available for the current flightInstanceId.
     * Populated by AddServicesComponent on init.
     */
    readonly availableProducts = signal<IAncillaryProduct[]>([]);

    /**
     * Services already purchased / attached to the current booking.
     * Populated by AddServicesComponent on init.
     */
    readonly currentAncillaries = signal<IExistingAncillary[]>([]);

    /**
     * Pending cart: user has staged these additions/removals
     * but has NOT yet paid/confirmed.
     */
    readonly ancillaryCart = signal<ICartItem[]>([]);

    /** Whether the ancillary marketplace is loading. */
    readonly isServicesLoading = signal<boolean>(false);

    /** Error scoped to the add-services page. */
    readonly servicesError = signal<string | null>(null);


    // ── Writable Signals — Modify Booking ────────────────────────────────────

    /**
     * Per-passenger edit drafts.
     * Populated by ModifyBookingComponent on page init from `selectedBookingDetails`.
     * Each draft tracks the user's in-progress form values and saving state.
     */
    readonly passengerDrafts = signal<IPassengerEditDraft[]>([]);

    /** True while any individual passenger update API call is in-flight. */
    readonly isUpdating = signal<boolean>(false);

    /**
     * Set to true after at least one successful `updateSavedPassenger` call.
     * Drives the gold success notification in the UI. Reset on navigation away.
     */
    readonly updateSuccess = signal<boolean>(false);

    /** Error message scoped to the modify-booking page. */
    readonly modifyError = signal<string | null>(null);


    // ── Writable Signals — Cancellation ──────────────────────────────────────

    /**
     * Tracks the 4-state lifecycle of the booking cancellation flow.
     * Reset to 'idle' in ngOnDestroy of CancellationComponent.
     */
    readonly cancellationStatus = signal<CancellationStatus>('idle');

    /** Human-readable error message from a failed cancellation API call. */
    readonly cancellationError = signal<string | null>(null);


    // ── Retrieve Booking Signals ──────────────────────────────────────────────

    /**
     * True while `getBookingByReference()` is in-flight from the retrieve page.
     * Distinct from `isDetailsLoading` (which is used by the details page).
     */
    readonly searchLoading = signal<boolean>(false);

    /**
     * Human-readable error from a failed PNR lookup.
     * Examples: "Booking reference not found", "Please sign in to continue".
     * Reset at the start of each new search.
     */
    readonly searchError = signal<string | null>(null);

    /**
     * The most recently searched reference — used to pre-fill the form
     * if the user navigates away and returns.
     */
    readonly lastRetrievedRef = signal<string>('');

    // ── Retrieve Ticket Signals ───────────────────────────────────────────────

    /**
     * True while `getTicketDetailsByCode()` is in-flight from the retrieve-ticket page.
     * Drives the gold-tinted skeleton loader during the lookup sequence.
     */
    readonly isRetrieving = signal<boolean>(false);

    /**
     * Human-readable error from a failed ticket code lookup on the retrieve-ticket page.
     * Examples: "Ticket reference not found", "Last name does not match".
     * Reset at the start of each new retrieval attempt.
     */
    readonly retrievalError = signal<string | null>(null);

    // ── Ticket Viewer Signals ─────────────────────────────────────────────────

    /**
     * The full ITicketDetailDto currently displayed in the ticket viewer.
     * Set by TicketViewerComponent after getTicketDetailsByCode() resolves.
     * Cleared on ngOnDestroy via resetTicketState().
     */
    readonly activeTicket = signal<ITicketDetailDto | null>(null);

    /**
     * True while getTicketDetailsByCode() is in-flight.
     * Drives the gold-tinted skeleton loader in the ticket viewer.
     */
    readonly ticketLoading = signal<boolean>(false);

    /** Human-readable error message from a failed ticket fetch. */
    readonly ticketError = signal<string | null>(null);

    /**
     * True during the window.print() flow.
     * Drives CSS class toggles that hide navigation and action buttons
     * before the browser's print dialog opens.
     */
    readonly isPrinting = signal<boolean>(false);

    // ── Computed Signals — List ───────────────────────────────────────────────

    readonly filteredBookings = computed((): IManageBookingDto[] => {
        const items = this.bookings();
        const filter = this.activeFilter();
        const now = new Date();
        switch (filter) {
            case 'upcoming':
                return items.filter(b =>
                    (b.status === 'Confirmed' || b.status === 'CheckedIn') &&
                    new Date(b.departureDateTime) > now
                );
            case 'past':
                return items.filter(b =>
                    b.status === 'Flown' || new Date(b.departureDateTime) < now
                );
            case 'cancelled':
                return items.filter(b => b.status === 'Cancelled');
            default:
                return items;
        }
    });

    readonly upcomingCount = computed((): number => {
        const now = new Date();
        return this.bookings().filter(b =>
            (b.status === 'Confirmed' || b.status === 'CheckedIn') &&
            new Date(b.departureDateTime) > now
        ).length;
    });

    readonly hasBookings = computed((): boolean => this.bookings().length > 0);
    readonly isEmpty = computed((): boolean => !this.hasBookings() && !this.isLoading());
    readonly isFilteredEmpty = computed((): boolean =>
        this.filteredBookings().length === 0 && !this.isLoading()
    );
    readonly hasPreviousPage = computed((): boolean => this.currentPage() > 1);
    readonly hasNextPage = computed((): boolean => this.currentPage() < this.totalPages());

    // ── Computed Signals — Details ────────────────────────────────────────────

    readonly canModifySelected = computed((): boolean => {
        const d = this.selectedBookingDetails();
        if (d) return !d.isCancelled && d.paymentStatus !== 'Cancelled';
        return this.selectedBooking()?.canModify ?? false;
    });

    readonly canCancelSelected = computed((): boolean => {
        const d = this.selectedBookingDetails();
        if (d) return !d.isCancelled;
        return this.selectedBooking()?.canCancel ?? false;
    });

    // ── Computed Signals — Ancillary Cart ────────────────────────────────────

    /** Sum of all add-mode items in the cart. */
    readonly cartAdditionsTotal = computed((): number =>
        this.ancillaryCart()
            .filter(i => i.mode === 'add')
            .reduce((s, i) => s + i.baseCost * i.quantity, 0)
    );

    /** Credit from removable items (future: server may issue refund). */
    readonly cartRemovalsCredit = computed((): number =>
        this.ancillaryCart()
            .filter(i => i.mode === 'remove')
            .reduce((s, i) => s + i.baseCost * i.quantity, 0)
    );

    /**
     * Net amount the user must pay to confirm the current cart.
     * If negative (only removals), delta = 0 (refund handled separately).
     */
    readonly deltaAmount = computed((): number =>
        Math.max(0, this.cartAdditionsTotal() - this.cartRemovalsCredit())
    );

    /** True when at least one item is staged in the cart. */
    readonly hasCartItems = computed((): boolean => this.ancillaryCart().length > 0);

    /** Total count of items in the cart. */
    readonly cartItemCount = computed((): number =>
        this.ancillaryCart().reduce((s, i) => s + i.quantity, 0)
    );

    /** Returns the quantity staged for a given productId in the cart. */
    getCartQuantity(productId: number): number {
        return this.ancillaryCart()
            .filter(i => i.productId === productId && i.mode === 'add')
            .reduce((s, i) => s + i.quantity, 0);
    }

    /** Returns true if a given saleId is staged for removal. */
    isStagedForRemoval(saleId: number): boolean {
        return this.ancillaryCart()
            .some(i => i.mode === 'remove' && i.saleId === saleId);
    }

    // ── Computed Signals — Modify ─────────────────────────────────────────────

    /** True when at least one draft has unsaved changes. */
    readonly hasUnsavedChanges = computed((): boolean =>
        this.passengerDrafts().some(d => d.isDirty)
    );

    /** Number of passengers with dirty (unsaved) drafts. */
    readonly dirtyDraftCount = computed((): number =>
        this.passengerDrafts().filter(d => d.isDirty).length
    );

    /** True when all drafts have been saved (all savedAt are populated). */
    readonly allDraftsSaved = computed((): boolean =>
        this.passengerDrafts().length > 0 &&
        this.passengerDrafts().every(d => d.savedAt !== null)
    );

    // ── Computed Signals — Cancellation ──────────────────────────────────────

    readonly isCancelling = computed((): boolean => this.cancellationStatus() === 'pending');
    readonly cancelSucceeded = computed((): boolean => this.cancellationStatus() === 'success');
    readonly cancelFailed = computed((): boolean => this.cancellationStatus() === 'error');

    // ── Computed — Retrieve ───────────────────────────────────────────────────

    /** True when search is idle with no error and no results yet. */
    readonly searchIsIdle = computed((): boolean =>
        !this.searchLoading() && !this.searchError() && !this.selectedBookingDetails()
    );


    // ── Computed — Ticket Viewer ──────────────────────────────────────────────

    /** Full name of the active ticket passenger. */
    readonly activeTicketPassengerName = computed((): string => {
        const t = this.activeTicket();
        if (!t) return '';
        return `${t.passengerFirstName} ${t.passengerLastName}`;
    });

    /** True when the active ticket is in a valid/confirmed state. */
    readonly activeTicketIsValid = computed((): boolean => {
        const status = this.activeTicket()?.status?.toLowerCase() ?? '';
        return status === 'valid' || status === 'confirmed' || status === 'issued';
    });

    // ── List Actions ──────────────────────────────────────────────────────────

    setBookings(result: IPaginatedResult<IManageBookingDto>): void {
        this.bookings.set(result.items);
        this.currentPage.set(result.pageNumber);
        this.totalPages.set(result.totalPages);
        this.totalCount.set(result.totalCount);
    }

    setFilter(filter: BookingFilter): void {
        this.activeFilter.set(filter);
        this.currentPage.set(1);
    }

    setLoading(v: boolean): void { this.isLoading.set(v); }
    setError(msg: string | null): void { this.errorMessage.set(msg); }

    selectBooking(booking: IManageBookingDto): void { this.selectedBooking.set(booking); }
    clearSelection(): void { this.selectedBooking.set(null); }

    nextPage(): void { if (this.hasNextPage()) this.currentPage.update(p => p + 1); }
    prevPage(): void { if (this.hasPreviousPage()) this.currentPage.update(p => p - 1); }

    // ── Details Actions ───────────────────────────────────────────────────────

    setBookingDetails(detail: IBookingDetailDto): void {
        this.selectedBookingDetails.set(detail);
        if (detail.bookingId) {
            this.bookingId.set(detail.bookingId);
        }
    }

    clearBookingDetails(): void {
        this.selectedBookingDetails.set(null);
        this.detailsError.set(null);
    }

    setDetailsLoading(v: boolean): void { this.isDetailsLoading.set(v); }
    setDetailsError(msg: string | null): void { this.detailsError.set(msg); }

    // ── Ancillary Actions ─────────────────────────────────────────────────────

    setAvailableProducts(products: IAncillaryProduct[]): void {
        this.availableProducts.set(products);
    }

    setCurrentAncillaries(ancillaries: IExistingAncillary[]): void {
        this.currentAncillaries.set(ancillaries);
    }

    setServicesLoading(v: boolean): void { this.isServicesLoading.set(v); }
    setServicesError(msg: string | null): void { this.servicesError.set(msg); }

    /**
     * Adds or increments a product in the pending cart.
     * Enforces the product's maxQuantity ceiling.
     */
    addToCart(product: IAncillaryProduct, quantity: number = 1): void {
        const existing = this.ancillaryCart().find(
            i => i.productId === product.productId && i.mode === 'add'
        );
        const currentQty = existing?.quantity ?? 0;
        const newQty = Math.min(currentQty + quantity, product.maxQuantity ?? 99);

        this.ancillaryCart.update(cart => {
            const filtered = cart.filter(
                i => !(i.productId === product.productId && i.mode === 'add')
            );
            return [
                ...filtered,
                {
                    productId: product.productId,
                    name: product.name,
                    category: product.category,
                    baseCost: product.baseCost,
                    currency: product.currency,
                    quantity: newQty,
                    mode: 'add'
                }
            ];
        });
    }

    /**
     * Decrements quantity of a cart item, removing it when quantity reaches 0.
     */
    decrementFromCart(productId: number): void {
        this.ancillaryCart.update(cart =>
            cart
                .map(i => {
                    if (i.productId === productId && i.mode === 'add') {
                        return { ...i, quantity: i.quantity - 1 };
                    }
                    return i;
                })
                .filter(i => i.quantity > 0)
        );
    }

    /**
     * Removes a product entirely from the add-mode cart.
     */
    removeFromCart(productId: number): void {
        this.ancillaryCart.update(cart =>
            cart.filter(i => !(i.productId === productId && i.mode === 'add'))
        );
    }

    /**
     * Stages an existing ancillary for removal (if removable).
     */
    stageRemoval(ancillary: IExistingAncillary): void {
        if (!ancillary.isRemovable) return;
        const alreadyStaged = this.ancillaryCart().some(
            i => i.mode === 'remove' && i.saleId === ancillary.saleId
        );
        if (alreadyStaged) return;

        this.ancillaryCart.update(cart => [
            ...cart,
            {
                productId: ancillary.productId,
                name: ancillary.productName,
                category: ancillary.category ?? 'Other',
                baseCost: ancillary.pricePaid,
                currency: 'SGD',
                quantity: ancillary.quantity,
                mode: 'remove',
                saleId: ancillary.saleId
            }
        ]);
    }

    /**
     * Unstages a removal from the cart.
     */
    unstageRemoval(saleId: number): void {
        this.ancillaryCart.update(cart =>
            cart.filter(i => !(i.mode === 'remove' && i.saleId === saleId))
        );
    }

    /**
     * Clears the entire pending cart.
     * Called after a successful payment or on page exit.
     */
    clearCart(): void {
        this.ancillaryCart.set([]);
    }

    /**
     * Resets the entire add-services state.
     * Called when navigating away from the add-services page.
     */
    resetServicesState(): void {
        this.availableProducts.set([]);
        this.currentAncillaries.set([]);
        this.ancillaryCart.set([]);
        this.servicesError.set(null);
        this.isServicesLoading.set(false);
    }


    // getCartQuantity(productId: number): number {
    //     return this.ancillaryCart().filter(i => i.productId === productId && i.mode === 'add')
    //         .reduce((s, i) => s + i.quantity, 0);
    // }

    // isStagedForRemoval(saleId: number): boolean {
    //     return this.ancillaryCart().some(i => i.mode === 'remove' && i.saleId === saleId);
    // }
    /**
     * Optimistic: merges confirmed cart additions into currentAncillaries.
     * Call after successful backend confirmation, before API re-fetch.
     */
    applyCartOptimistically(bookingId: number): void {
        const additions = this.ancillaryCart().filter(i => i.mode === 'add');
        const removals = this.ancillaryCart().filter(i => i.mode === 'remove');

        // Remove staged items from current list
        const removeSaleIds = new Set(removals.map(r => r.saleId));
        let updated = this.currentAncillaries().filter(a => !removeSaleIds.has(a.saleId));

        // Add new items optimistically
        const newEntries: IExistingAncillary[] = additions.map(item => ({
            saleId: Date.now() + item.productId, // temp id
            bookingId,
            productId: item.productId,
            productName: item.name,
            category: item.category,
            pricePaid: item.baseCost,
            quantity: item.quantity,
            isRemovable: true
        }));

        this.currentAncillaries.set([...updated, ...newEntries]);
        this.clearCart();
    }


    // ── Modify Booking Actions ────────────────────────────────────────────────

    /**
     * Initialises edit drafts from the currently loaded booking detail.
     * Idempotent — will not overwrite if drafts already exist for this booking.
     */
    initPassengerDrafts(passengers: IBookingPassengerDetailDto[]): void {
        if (this.passengerDrafts().length === passengers.length) return;
        this.passengerDrafts.set(
            passengers.map(p => ({
                passengerId: p.passengerId,
                firstName: p.firstName,
                lastName: p.lastName,
                dateOfBirth: p.dateOfBirth ?? null,
                passportNumber: p.passportNumber ?? null,
                isDirty: false,
                isSaving: false,
                savedAt: null
            }))
        );
    }

    /**
     * Updates a draft's field values and marks it as dirty (unsaved).
     */
    updateDraft(passengerId: number, patch: Partial<Omit<IPassengerEditDraft, 'passengerId' | 'isDirty' | 'isSaving' | 'savedAt'>>): void {
        this.passengerDrafts.update(drafts =>
            drafts.map(d =>
                d.passengerId === passengerId
                    ? { ...d, ...patch, isDirty: true }
                    : d
            )
        );
    }

    /** Marks a specific draft as saving (in-flight API call). */
    setDraftSaving(passengerId: number, isSaving: boolean): void {
        this.passengerDrafts.update(drafts =>
            drafts.map(d => d.passengerId === passengerId ? { ...d, isSaving } : d)
        );
    }

    /** Marks a draft as successfully saved and clears its dirty flag. */
    markDraftSaved(passengerId: number): void {
        this.passengerDrafts.update(drafts =>
            drafts.map(d =>
                d.passengerId === passengerId
                    ? { ...d, isDirty: false, isSaving: false, savedAt: new Date().toISOString() }
                    : d
            )
        );
        this.updateSuccess.set(true);
    }

    /** Clears saving flag without marking as saved (API call failed). */
    clearDraftSaving(passengerId: number): void {
        this.passengerDrafts.update(drafts =>
            drafts.map(d => d.passengerId === passengerId ? { ...d, isSaving: false } : d)
        );
    }

    setIsUpdating(v: boolean): void { this.isUpdating.set(v); }
    setModifyError(msg: string | null): void { this.modifyError.set(msg); }

    /**
     * Resets the entire modify-booking state.
     * Call in ngOnDestroy of ModifyBookingComponent.
     */
    resetModifyState(): void {
        this.passengerDrafts.set([]);
        this.isUpdating.set(false);
        this.updateSuccess.set(false);
        this.modifyError.set(null);
    }

    // ── Cancellation Actions ──────────────────────────────────────────────────

    setCancellationStatus(status: CancellationStatus): void {
        this.cancellationStatus.set(status);
    }

    setCancellationError(msg: string | null): void {
        this.cancellationError.set(msg);
    }

    /**
     * Marks the currently-loaded booking as Cancelled in the local list.
     * Called optimistically on API success, before a full list refresh.
     * Also updates the selectedBookingDetails.isCancelled flag.
     */
    markBookingCancelledInList(pnrCode: string): void {
        this.bookings.update(list =>
            list.map(b =>
                b.pnrCode === pnrCode ? { ...b, status: 'Cancelled' as BookingStatus, canModify: false, canCancel: false } : b
            )
        );
        // Mirror the change on the detail view so the status badge updates immediately
        const detail = this.selectedBookingDetails();
        if (detail) {
            this.selectedBookingDetails.set({ ...detail, isCancelled: true, paymentStatus: 'Cancelled' });
        }
    }

    /**
     * Resets the cancellation flow signals.
     * Called in ngOnDestroy of CancellationComponent to prevent stale state.
     */
    resetCancellationState(): void {
        this.cancellationStatus.set('idle');
        this.cancellationError.set(null);
    }

    // ── Retrieve Booking Actions ──────────────────────────────────────────────

    setSearchLoading(v: boolean): void { this.searchLoading.set(v); }

    setSearchError(msg: string | null): void { this.searchError.set(msg); }

    /**
     * Stores a successfully-retrieved booking detail and records the reference.
     * Used by RetrieveBookingComponent after `getBookingByReference()` succeeds.
     */
    setCurrentBooking(detail: IBookingDetailDto): void {
        this.selectedBookingDetails.set(detail);
        this.lastRetrievedRef.set(detail.bookingReference);
        this.searchError.set(null);
    }

    /** Clears search state when the user navigates away from the retrieve page. */
    resetSearchState(): void {
        this.searchLoading.set(false);
        this.searchError.set(null);
    }

    // ── Ticket Viewer Actions ─────────────────────────────────────────────────

    /**
     * Stores the full ITicketDetailDto fetched by TicketViewerComponent.
     * Clears any previous ticket error.
     */
    setActiveTicket(ticket: ITicketDetailDto): void {
        this.activeTicket.set(ticket);
        this.ticketError.set(null);
    }

    clearActiveTicket(): void {
        this.activeTicket.set(null);
        this.ticketError.set(null);
    }

    setTicketLoading(v: boolean): void { this.ticketLoading.set(v); }
    setTicketError(msg: string | null): void { this.ticketError.set(msg); }

    /**
     * Activates print mode — hides navigation/action UI, then calls window.print().
     * Resets isPrinting after a short delay so the UI restores after the dialog closes.
     */
    triggerPrint(): void {
        this.isPrinting.set(true);
        setTimeout(() => {
            window.print();
            // Small delay to let the dialog close before restoring UI
            setTimeout(() => this.isPrinting.set(false), 500);
        }, 200);
    }

    /**
     * Resets all ticket viewer signals.
     * Called in ngOnDestroy of TicketViewerComponent.
     */
    resetTicketState(): void {
        this.activeTicket.set(null);
        this.ticketLoading.set(false);
        this.ticketError.set(null);
        this.isPrinting.set(false);
    }

    // ── Retrieve Ticket Actions ───────────────────────────────────────────────

    setIsRetrieving(v: boolean): void { this.isRetrieving.set(v); }
    setRetrievalError(msg: string | null): void { this.retrievalError.set(msg); }

    /**
     * Resets all retrieve-ticket page signals.
     * Call in ngOnDestroy of RetrieveTicketComponent.
     */
    resetRetrievalState(): void {
        this.isRetrieving.set(false);
        this.retrievalError.set(null);
    }

}
