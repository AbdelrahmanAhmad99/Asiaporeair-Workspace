
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, forkJoin, takeUntil, switchMap, } from 'rxjs';

import { BookingManagementService } from '@shared-core';
import {
    IBookingDto,
    IBookingDetailDto,
    IBookingFilterDto,
    IPassengerDto,
    ITicketDto,
    IUpdateBookingStatusDto,
    IBookingCancelDto, IPassengerFilterDto, IUpdatePassengerDto
} from '@shared-core';
import { IPaginatedResult } from '@shared-core';


// ── Filter Contract ──────────────────────────────────────────────────────
export interface IBcSearchFilters {
    bookingReference: string;
    flightNumber: string;
    departureDateFrom: string;
    departureDateTo: string;
    paymentStatus: string;
    passengerNameContains: string;
}

const DEFAULT_FILTERS: IBcSearchFilters = {
    bookingReference: '',
    flightNumber: '',
    departureDateFrom: '',
    departureDateTo: '',
    paymentStatus: '',
    passengerNameContains: '',
};

// ── Pagination Contract ───────────────────────────────────────────────────
export interface IBcPagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

const DEFAULT_PAGINATION: IBcPagination = {
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 0,
};


// ── Explorer Action State ─────────────────────────────────────────────────
export type ExplorerActionState = 'idle' | 'cancelling' | 'patching';

// ── Timeline Types ────────────────────────────────────────────────────────
export type TimelineStepStatus = 'completed' | 'active' | 'pending' | 'error';

export interface ITimelineStep {
    id: string;
    label: string;
    subLabel: string;
    status: TimelineStepStatus;
    timestamp?: string;
}

// ── Passenger Index filter contract ──────────────────────────────────────
export interface IPaxIndexFilters {
    nameContains: string;
    passportNumber: string;
    userId: string;
}

const DEFAULT_PAX_FILTERS: IPaxIndexFilters = {
    nameContains: '',
    passportNumber: '',
    userId: '',
};

// ── Passenger pagination ───────────────────────────────────────────────────
export interface IPaxPagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

const DEFAULT_PAX_PAGINATION: IPaxPagination = {
    page: 1, pageSize: 30, total: 0, totalPages: 0,
};


// ── Route Base ────────────────────────────────────────────────────────────
const RGH_BASE = '/aoms/reservation-ground/booking-center';

@Injectable({ providedIn: 'root' })
export class BookingCenterStore {
    private readonly svc = inject(BookingManagementService);
    private readonly router = inject(Router);
    private readonly destroy$ = new Subject<void>();

    // ════════════════════════════════════════════════════════════════════════
    // DOMAIN A: Booking Search Terminal
    // ════════════════════════════════════════════════════════════════════════

    // ── Private writable state ────────────────────────────────────────────
    private readonly _bookings = signal<IBookingDto[]>([]);
    private readonly _selectedBooking = signal<IBookingDetailDto | null>(null);
    private readonly _filters = signal<IBcSearchFilters>({ ...DEFAULT_FILTERS });
    private readonly _pagination = signal<IBcPagination>({ ...DEFAULT_PAGINATION });
    private readonly _isLoading = signal<boolean>(false);
    private readonly _isDrawerLoading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);
    private readonly _drawerError = signal<string | null>(null);
    private readonly _isDrawerOpen = signal<boolean>(false);
    private readonly _hasSearched = signal<boolean>(false);
    private readonly _actionSuccess = signal<string | null>(null);


    private readonly _globalPassengers = signal<IPassengerDto[]>([]);
    private readonly _focusedPassenger = signal<IPassengerDto | null>(null);
    private readonly _isIndexLoading = signal<boolean>(false);
    private readonly _indexError = signal<string | null>(null);
    private readonly _paxFilters = signal<IPaxIndexFilters>({ ...DEFAULT_PAX_FILTERS });
    private readonly _paxPagination = signal<IPaxPagination>({ ...DEFAULT_PAX_PAGINATION });
    private readonly _paxActionLoading = signal<boolean>(false);
    private readonly _paxActionError = signal<string | null>(null);
    private readonly _paxActionSuccess = signal<string | null>(null);
    private readonly _paxHasSearched = signal<boolean>(false);

    // ── Public read-only signals ──────────────────────────────────────────
    readonly bookings = this._bookings.asReadonly();
    readonly selectedBooking = this._selectedBooking.asReadonly();
    readonly filters = this._filters.asReadonly();
    readonly pagination = this._pagination.asReadonly();
    readonly isLoading = this._isLoading.asReadonly();
    readonly isDrawerLoading = this._isDrawerLoading.asReadonly();
    readonly error = this._error.asReadonly();
    readonly drawerError = this._drawerError.asReadonly();
    readonly isDrawerOpen = this._isDrawerOpen.asReadonly();
    readonly hasSearched = this._hasSearched.asReadonly();
    readonly actionSuccess = this._actionSuccess.asReadonly();

    readonly globalPassengers = this._globalPassengers.asReadonly();
    readonly focusedPassenger = this._focusedPassenger.asReadonly();
    readonly isIndexLoading = this._isIndexLoading.asReadonly();
    readonly indexError = this._indexError.asReadonly();
    readonly paxFilters = this._paxFilters.asReadonly();
    readonly paxPagination = this._paxPagination.asReadonly();
    readonly paxActionLoading = this._paxActionLoading.asReadonly();
    readonly paxActionError = this._paxActionError.asReadonly();
    readonly paxActionSuccess = this._paxActionSuccess.asReadonly();
    readonly paxHasSearched = this._paxHasSearched.asReadonly();

    // ── Computed signals ──────────────────────────────────────────────────
    readonly hasActiveFilters = computed<boolean>(() => {
        const f = this._filters();
        return !!(
            f.bookingReference ||
            f.flightNumber ||
            f.departureDateFrom ||
            f.departureDateTo ||
            f.paymentStatus ||
            f.passengerNameContains
        );
    });

    readonly isEmpty = computed<boolean>(
        () => this._hasSearched() && this._bookings().length === 0 && !this._isLoading()
    );

    readonly resultLabel = computed<string>(() => {
        const { total } = this._pagination();
        if (!this._hasSearched()) return '';
        if (total === 0) return 'No records found';
        return `${total.toLocaleString()} record${total === 1 ? '' : 's'} found`;
    });

    readonly paxIsEmpty = computed<boolean>(
        () => this._paxHasSearched() && this._globalPassengers().length === 0 && !this._isIndexLoading()
    );

    readonly paxResultLabel = computed<string>(() => {
        const { total } = this._paxPagination();
        if (!this._paxHasSearched()) return '';
        return total === 0 ? 'No passengers found'
            : `${total.toLocaleString()} record${total === 1 ? '' : 's'}`;
    });

    readonly paxHasActiveFilters = computed<boolean>(() => {
        const f = this._paxFilters();
        return !!(f.nameContains || f.passportNumber || f.userId);
    });

    // ── Public methods ────────────────────────────────────────────────────

    /** Orchestrates a full search with current filters from page 1. */
    executeSearch(filters?: Partial<IBcSearchFilters>): void {
        if (filters) {
            this._filters.update(f => ({ ...f, ...filters }));
        }
        this._pagination.update(p => ({ ...p, page: 1 }));
        this._performSearch();
    }


    searchByReference(bookingReference: string): void {
        if (!bookingReference?.trim()) {
            this._error.set('Please provide a valid Booking Reference.');
            return;
        }

        this._isLoading.set(true);
        this._error.set(null);
        this._bookings.set([]);

        this.svc.getBookingByReference(bookingReference.trim())
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (detail) => {
                    const bookingCard: IBookingDto = {
                        bookingId: detail.bookingId,
                        bookingReference: detail.bookingReference,
                        bookingTime: detail.bookingTime,
                        paymentStatus: detail.paymentStatus,
                        totalPrice: detail.totalPrice,
                        flightNumber: detail.flightNumber,
                        flightDepartureTime: detail.flightDepartureTime,
                        originAirportCode: detail.originAirportCode,
                        destinationAirportCode: detail.destinationAirportCode,
                        fareBasisCode: detail.fareBasisCode,
                        passengers: detail.passengers.map(p => ({
                            passengerId: p.passengerId,
                            linkedUserId: 0,
                            firstName: p.firstName,
                            lastName: p.lastName,
                            dateOfBirth: p.dateOfBirth
                                ? (typeof p.dateOfBirth === 'string' ? p.dateOfBirth : p.dateOfBirth.toISOString())
                                : null,
                            passportNumber: p.passportNumber || null,
                            frequentFlyerCardNumber: null,
                        })),
                    };

                    this._bookings.set([bookingCard]);
                    this._pagination.set({
                        page: 1,
                        pageSize: 1,
                        total: 1,
                        totalPages: 1,
                    });
                    this._isLoading.set(false);
                    this._hasSearched.set(true);
                },
                error: (err) => {
                    const msg = this._resolveErrorMessage(err);
                    this._error.set(msg);
                    this._bookings.set([]);
                    this._pagination.set({ ...DEFAULT_PAGINATION });
                    this._isLoading.set(false);
                    this._hasSearched.set(true);
                },
            });
    }

    /** Updates filters signal without triggering a search (for reactive form binding). */
    updateFilters(partial: Partial<IBcSearchFilters>): void {
        this._filters.update(f => ({ ...f, ...partial }));
    }

    /** Resets all filters and clears results. */
    resetFilters(): void {
        this._filters.set({ ...DEFAULT_FILTERS });
        this._bookings.set([]);
        this._pagination.set({ ...DEFAULT_PAGINATION });
        this._hasSearched.set(false);
        this._error.set(null);
    }

    /** Loads full booking detail into the Quick View Drawer. */
    loadBookingQuickView(bookingId: number): void {
        this._isDrawerLoading.set(true);
        this._drawerError.set(null);
        this._isDrawerOpen.set(true);
        this._selectedBooking.set(null);

        this.svc.getBookingDetails(bookingId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (detail) => {
                    this._selectedBooking.set(detail as any);
                    this._isDrawerLoading.set(false);
                },
                error: (err) => {
                    this._drawerError.set(
                        err?.message ?? `Unable to retrieve PNR details. Please try again.`
                    );
                    this._isDrawerLoading.set(false);
                },
            });
    }

    /** Closes the Quick View Drawer and clears selected booking. */
    closeDrawer(): void {
        this._isDrawerOpen.set(false);
        setTimeout(() => {
            this._selectedBooking.set(null);
            this._drawerError.set(null);
        }, 320);
    }

    /** Navigates to full PNR detail page. */
    navigateToPnrDetail(bookingId: number): void {
        this.router.navigate([RGH_BASE, 'pnr-deep-explorer', bookingId]);
    }

    /** Navigates to the Create New Booking wizard. */
    navigateToCreateBooking(): void {
        this.router.navigate([RGH_BASE, 'create']);
    }

    /** Navigates to the Passenger Index. */
    navigateToPassengerIndex(): void {
        this.router.navigate([RGH_BASE, 'passenger-index']);
    }

    navigateToSearchTerminal(): void {
        this.router.navigate([RGH_BASE]);
    }

    /** Pagination: go to a specific page. */
    goToPage(page: number): void {
        const { totalPages } = this._pagination();
        if (page < 1 || page > totalPages) return;
        this._pagination.update(p => ({ ...p, page }));
        this._performSearch();
    }

    nextPage(): void {
        const { page, totalPages } = this._pagination();
        if (page < totalPages) this.goToPage(page + 1);
    }

    prevPage(): void {
        const { page } = this._pagination();
        if (page > 1) this.goToPage(page - 1);
    }

    /** Clears transient action state (errors, success toasts). */
    clearActionState(): void {
        this._error.set(null);
        this._actionSuccess.set(null);
    }

    /** Cleanup on component destroy. */
    destroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }


    // ════════════════════════════════════════════════════════════════════════
    // DOMAIN B: PNR Deep Explorer
    // ════════════════════════════════════════════════════════════════════════

    private readonly _activeBooking = signal<IBookingDetailDto | null>(null);
    private readonly _bookingPassengers = signal<IPassengerDto[]>([]);
    private readonly _bookingTickets = signal<ITicketDto[]>([]);
    private readonly _explorerLoading = signal<boolean>(false);
    private readonly _explorerError = signal<string | null>(null);
    private readonly _explorerActionState = signal<ExplorerActionState>('idle');
    private readonly _explorerActionError = signal<string | null>(null);
    private readonly _explorerActionSuccess = signal<string | null>(null);

    readonly activeBooking = this._activeBooking.asReadonly();
    readonly bookingPassengers = this._bookingPassengers.asReadonly();
    readonly bookingTickets = this._bookingTickets.asReadonly();
    readonly explorerLoading = this._explorerLoading.asReadonly();
    readonly explorerError = this._explorerError.asReadonly();
    readonly explorerActionState = this._explorerActionState.asReadonly();
    readonly explorerActionError = this._explorerActionError.asReadonly();
    readonly explorerActionSuccess = this._explorerActionSuccess.asReadonly();

    readonly explorerActionProcessing = computed<boolean>(
        () => this._explorerActionState() !== 'idle'
    );

    readonly bookingTimeline = computed<ITimelineStep[]>(() => {
        const b = this._activeBooking();
        return b ? buildTimeline(b) : [];
    });

    /**
     * Parallel orchestration via forkJoin:
     * Fires getBookingDetails + getPassengersForBooking + getTicketsForBookingAdmin
     * simultaneously and resolves all three into their respective signals.
     */
    loadFullPnrData(bookingId: number): void {
        this._explorerLoading.set(true);
        this._explorerError.set(null);
        this._activeBooking.set(null);
        this._bookingPassengers.set([]);
        this._bookingTickets.set([]);
        this._explorerActionState.set('idle');
        this._explorerActionError.set(null);
        this._explorerActionSuccess.set(null);

        forkJoin({
            booking: this.svc.getBookingDetails(bookingId),
            passengers: this.svc.getPassengersForBooking(bookingId),
            tickets: this.svc.getTicketsForBookingAdmin(bookingId),
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: ({ booking, passengers, tickets }) => {
                    this._activeBooking.set(booking as any);

                    const mappedPassengers = (passengers ?? []).map(p => ({
                        ...p,
                        passengerId: (p as any).id,
                        linkedUserId: (p as any).userId
                    })) as any;

                    this._bookingPassengers.set(mappedPassengers);
                    this._bookingTickets.set(tickets as any);
                    this._explorerLoading.set(false);
                },
                error: (err) => {
                    this._explorerError.set(this._resolveExplorerError(err));
                    this._explorerLoading.set(false);
                },
            });
    }

    /** Administrative cancellation with optimistic local update. */
    triggerCancelBooking(bookingId: number, reason?: string): void {
        this._explorerActionState.set('cancelling');
        this._explorerActionError.set(null);
        this._explorerActionSuccess.set(null);

        const dto = { reason: reason ?? undefined };

        this.svc.cancelBooking(bookingId, dto as any).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this._activeBooking.update(b =>
                    b ? { ...b, isCancelled: true, paymentStatus: 'Cancelled' } : b
                );
                this._explorerActionState.set('idle');
                this._explorerActionSuccess.set('Booking has been successfully cancelled.');
                this._refreshBookingDetail(bookingId);
            },
            error: (err) => {
                this._explorerActionError.set(
                    err?.message ?? 'Cancellation failed. Please retry or contact Operations.'
                );
                this._explorerActionState.set('idle');
            },
        });
    }

    /** Patches booking payment / operational status. */
    patchBookingStatus(bookingId: number, newStatus: string, reason?: string): void {
        this._explorerActionState.set('patching');
        this._explorerActionError.set(null);
        this._explorerActionSuccess.set(null);

        const dto: IUpdateBookingStatusDto = { newStatus, ...(reason && { reason }) };

        this.svc.updateBookingStatus(bookingId, dto).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this._activeBooking.update(b => b ? { ...b, paymentStatus: newStatus } : b);
                this._explorerActionState.set('idle');
                this._explorerActionSuccess.set(`Status updated to "${newStatus}" successfully.`);
                this._refreshBookingDetail(bookingId);
            },
            error: (err) => {
                this._explorerActionError.set(err?.message ?? 'Status update failed. Please retry.');
                this._explorerActionState.set('idle');
            },
        });
    }

    clearExplorerActionState(): void {
        this._explorerActionError.set(null);
        this._explorerActionSuccess.set(null);
    }

    teardownExplorer(): void {
        this._activeBooking.set(null);
        this._bookingPassengers.set([]);
        this._bookingTickets.set([]);
        this._explorerError.set(null);
        this._explorerActionState.set('idle');
        this._explorerActionError.set(null);
        this._explorerActionSuccess.set(null);
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────


    /**
      * Executes a paginated passenger search.
      * Resets to page 1 when new filter criteria are provided.
      */
    executePassengerSearch(query?: Partial<IPaxIndexFilters>, page: number = 1): void {
        if (query) this._paxFilters.update(f => ({ ...f, ...query }));
        this._paxPagination.update(p => ({ ...p, page }));
        this._runPassengerSearch();
    }

    /** Updates filter signal without triggering a search (for live form binding). */
    updatePaxFilters(partial: Partial<IPaxIndexFilters>): void {
        this._paxFilters.update(f => ({ ...f, ...partial }));
    }

    /** Resets all passenger search state. */
    resetPaxSearch(): void {
        this._paxFilters.set({ ...DEFAULT_PAX_FILTERS });
        this._globalPassengers.set([]);
        this._paxPagination.set({ ...DEFAULT_PAX_PAGINATION });
        this._paxHasSearched.set(false);
        this._indexError.set(null);
        this._focusedPassenger.set(null);
    }

    /** Loads the full detail record for a passenger into the detail form. */
    loadPassengerDetails(passengerId: number): void {
        this._isIndexLoading.set(true);
        this._indexError.set(null);
        this._focusedPassenger.set(null);

        this.svc.getPassengerDetails(passengerId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (p: any) => {
                    const { id, userId, passengerId: _, linkedUserId: __, ...rest } = p;
                    this._focusedPassenger.set({
                        ...rest,
                        passengerId: id,
                        linkedUserId: userId
                    } as IPassengerDto);
                    this._isIndexLoading.set(false);
                },
                error: (err) => {
                    this._indexError.set(this._resolvePaxError(err));
                    this._isIndexLoading.set(false);
                },
            });
    }

    /** Clears the focused passenger (closes the detail panel). */
    clearFocusedPassenger(): void {
        this._focusedPassenger.set(null);
        this._paxActionError.set(null);
        this._paxActionSuccess.set(null);
    }

    /**
     * Commits an update to a passenger record and refreshes the focused signal
     * plus the in-list record optimistically.
     */
    commitPassengerUpdate(passengerId: number, data: IUpdatePassengerDto): void {
        this._paxActionLoading.set(true);
        this._paxActionError.set(null);
        this._paxActionSuccess.set(null);

        this.svc.updatePassengerDetails(passengerId, data as any)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (updated: any) => {
                    const { id, userId, passengerId: _, linkedUserId: __, ...rest } = updated;
                    const mapped = {
                        ...rest,
                        passengerId: id,
                        linkedUserId: userId
                    } as IPassengerDto;
                    this._focusedPassenger.set(mapped);
                    this._globalPassengers.update(list =>
                        list.map(p => p.passengerId === passengerId ? mapped : p)
                    );
                    this._paxActionLoading.set(false);
                    this._paxActionSuccess.set('Passenger record updated successfully.');
                },
                error: (err) => {
                    this._paxActionError.set(this._resolvePaxError(err));
                    this._paxActionLoading.set(false);
                },
            });
    }

    /**
     * Deletes a passenger record and removes it from the local list.
     * Returns a Promise<boolean> so the smart component can close the
     * detail panel on success without a round-trip search refresh.
     */
    commitPassengerDeletion(passengerId: number): Promise<boolean> {
        this._paxActionLoading.set(true);
        this._paxActionError.set(null);
        this._paxActionSuccess.set(null);

        return new Promise<boolean>((resolve) => {
            this.svc.deletePassenger(passengerId)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this._globalPassengers.update(list => list.filter(p => p.passengerId !== passengerId));
                        this._paxPagination.update(pg => ({
                            ...pg,
                            total: Math.max(0, pg.total - 1),
                        }));
                        this._focusedPassenger.set(null);
                        this._paxActionLoading.set(false);
                        this._paxActionSuccess.set('Passenger record permanently removed.');
                        resolve(true);
                    },
                    error: (err) => {
                        this._paxActionError.set(this._resolvePaxError(err));
                        this._paxActionLoading.set(false);
                        resolve(false);
                    },
                });
        });
    }

    /** Passenger index pagination helpers */
    paxNextPage(): void {
        const { page, totalPages } = this._paxPagination();
        if (page < totalPages) {
            this._paxPagination.update(p => ({ ...p, page: p.page + 1 }));
            this._runPassengerSearch();
        }
    }

    paxPrevPage(): void {
        const { page } = this._paxPagination();
        if (page > 1) {
            this._paxPagination.update(p => ({ ...p, page: p.page - 1 }));
            this._runPassengerSearch();
        }
    }

    paxGoToPage(page: number): void {
        const { totalPages } = this._paxPagination();
        if (page < 1 || page > totalPages) return;
        this._paxPagination.update(p => ({ ...p, page }));
        this._runPassengerSearch();
    }

    /** Clears passenger action transient state (toasts, errors). */
    clearPaxActionState(): void {
        this._paxActionError.set(null);
        this._paxActionSuccess.set(null);
    }

    /** Full teardown when the Passenger Master Index is destroyed. */
    teardownPassengerIndex(): void {
        this._globalPassengers.set([]);
        this._focusedPassenger.set(null);
        this._isIndexLoading.set(false);
        this._indexError.set(null);
        this._paxFilters.set({ ...DEFAULT_PAX_FILTERS });
        this._paxPagination.set({ ...DEFAULT_PAX_PAGINATION });
        this._paxActionLoading.set(false);
        this._paxActionError.set(null);
        this._paxActionSuccess.set(null);
        this._paxHasSearched.set(false);
    }

    // ── Private orchestration ─────────────────────────────────────────────

    private _performSearch(): void {
        this._isLoading.set(true);
        this._error.set(null);

        const f = this._filters();
        const { page, pageSize } = this._pagination();

        const filterDto: IBookingFilterDto = {
            ...(f.bookingReference && { bookingReference: f.bookingReference }),
            ...(f.passengerNameContains && { passengerNameContains: f.passengerNameContains }),
            ...(f.paymentStatus && { paymentStatus: f.paymentStatus }),
            ...(f.departureDateFrom && { bookingDateFrom: f.departureDateFrom }),
            ...(f.departureDateTo && { bookingDateTo: f.departureDateTo }),
        };

        this.svc.searchBookings(filterDto, page, pageSize)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result: any) => {
                    this._bookings.set(result.items ?? []);
                    this._pagination.update(p => ({
                        ...p,
                        total: result.totalCount ?? 0,
                        totalPages: Math.ceil((result.totalCount ?? 0) / pageSize),
                    }));
                    this._isLoading.set(false);
                    this._hasSearched.set(true);
                },
                error: (err) => {
                    const msg = this._resolveErrorMessage(err);
                    this._error.set(msg);
                    this._bookings.set([]);
                    this._isLoading.set(false);
                    this._hasSearched.set(true);
                },
            });
    }

    private _resolveErrorMessage(err: unknown): string {
        if (typeof err === 'object' && err !== null) {
            const e = err as Record<string, unknown>;
            if (e['status'] === 404) return 'PNR not found. Verify the reference and retry.';
            if (e['status'] === 0 || e['status'] === 503)
                return 'Network timeout — Ground Control is unreachable. Please try again.';
            if (typeof e['message'] === 'string') return e['message'];
        }
        return 'An unexpected error occurred. The operations team has been notified.';
    }

    private _refreshBookingDetail(bookingId: number): void {
        this.svc.getBookingDetails(bookingId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({ next: (b) => this._activeBooking.set(b as any) });
    }


    private _resolveExplorerError(err: unknown): string {
        if (typeof err === 'object' && err !== null) {
            const e = err as Record<string, unknown>;
            if (e['status'] === 404)
                return 'Booking record not found. The ID may be incorrect or the record archived.';
            if (e['status'] === 403)
                return 'Access Denied — your role does not permit viewing this PNR.';
            if (e['status'] === 0 || e['status'] === 503)
                return 'Ground Systems unreachable. Check your connection and retry.';
            if (typeof e['message'] === 'string') return e['message'];
        }
        return 'Unable to load booking record. Please retry or contact system support.';
    }

    private _runPassengerSearch(): void {
        this._isIndexLoading.set(true);
        this._indexError.set(null);

        const f = this._paxFilters();
        const { page, pageSize } = this._paxPagination();

        const filterDto: IPassengerFilterDto = {
            ...(f.nameContains && { nameContains: f.nameContains }),
            ...(f.passportNumber && { passportNumber: f.passportNumber }),
            ...(f.userId && { userId: parseInt(f.userId, 10) }),
        };

        this.svc.searchPassengers(filterDto, page, pageSize)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result: any) => {
                    const mappedItems = (result.items ?? []).map((p: any) => {
                        const { id, userId, passengerId, linkedUserId, ...rest } = p;
                        return {
                            ...rest,
                            passengerId: id,
                            linkedUserId: userId
                        } as IPassengerDto;
                    });

                    this._globalPassengers.set(mappedItems);
                    this._paxPagination.update(p => ({
                        ...p,
                        total: result.totalCount ?? 0,
                        totalPages: Math.ceil((result.totalCount ?? 0) / pageSize),
                    }));
                    this._isIndexLoading.set(false);
                    this._paxHasSearched.set(true);
                },
                error: (err) => {
                    this._indexError.set(this._resolvePaxError(err));
                    this._globalPassengers.set([]);
                    this._isIndexLoading.set(false);
                    this._paxHasSearched.set(true);
                },
            });
    }

    private _resolvePaxError(err: unknown): string {
        if (typeof err === 'object' && err !== null) {
            const e = err as Record<string, unknown>;
            if (e['status'] === 404) return 'Passenger record not found.';
            if (e['status'] === 409) return 'This record is linked to active bookings and cannot be deleted.';
            if (e['status'] === 403) return 'Access Denied — insufficient privileges for this operation.';
            if (e['status'] === 0 || e['status'] === 503)
                return 'Ground Systems unreachable. Verify your connection and retry.';
            if (typeof e['message'] === 'string') return e['message'];
        }
        return 'An unexpected error occurred. Contact system support.';
    }
}



// ════════════════════════════════════════════════════════════════════════
// Timeline Builder — Pure function, no store dependency
// ════════════════════════════════════════════════════════════════════════

function buildTimeline(b: IBookingDetailDto): ITimelineStep[] {
    const status = (b.paymentStatus ?? '').toLowerCase();
    const cancelled = b.isCancelled;

    const steps: ITimelineStep[] = [
        {
            id: 'booking_created',
            label: 'Booking Created',
            subLabel: 'PNR registered in reservation system',
            status: 'completed',
            timestamp: typeof b.bookingTime === 'string' ? b.bookingTime : undefined,
        },
        {
            id: 'payment_confirmed',
            label: 'Payment Confirmed',
            subLabel: 'Financial clearance received',
            status: cancelled ? 'error'
                : (status === 'confirmed' || status === 'refunded') ? 'completed'
                    : status === 'pending' ? 'active'
                        : 'pending',
        },
        {
            id: 'tickets_issued',
            label: 'Tickets Issued',
            subLabel: 'E-tickets generated and delivered',
            status: cancelled ? 'error'
                : status === 'confirmed' ? 'completed'
                    : 'pending',
        },
        {
            id: 'check_in',
            label: 'Check-In',
            subLabel: 'Boarding services engaged',
            status: cancelled ? 'error' : 'pending',
        },
    ];

    if (cancelled) {
        steps.push({
            id: 'cancelled',
            label: 'Booking Cancelled',
            subLabel: 'Record archived — no further action',
            status: 'error',
        });
    }

    return steps;
}
