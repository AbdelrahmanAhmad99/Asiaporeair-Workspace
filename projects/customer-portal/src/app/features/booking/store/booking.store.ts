// ============================================================================
// booking.store.ts
// Asiaporeair | Signals-based Booking State — Full Flow incl. Success State
// ============================================================================

import { Injectable, signal, computed, inject } from '@angular/core';
import {
    IFlightSearchRequestDto,
    IFlightItineraryDto,
    IFlightFareOptionDto
} from '@shared-core';
import { FlightsService } from '@shared-core';
import { finalize } from 'rxjs/operators';
import { IPassengerFormValue } from '../passenger-details/components/passenger-form/passenger-form.component';
import { IBookingDto, IBookingDetailDto } from '@shared-core';
import { IPaymentTransaction } from '@shared-core';

export enum BookingStep {
    Search = 'Search',
    Results = 'Results',
    Passengers = 'Passengers',
    Addons = 'Addons',
    Seats = 'Seats',
    Payment = 'Payment',
    Complete = 'Complete'
}

// ── Ancillary State ───────────────────────────────────────────────────────────
export interface IPassengerAncillarySelections {
    passengerIndex: number;
    passengerLabel: string;
    selections: Map<number, number>;
}

export interface IAncillaryLineItem {
    productId: number;
    productName: string;
    category: string;
    unitOfMeasure: string;
    baseCost: number;
    quantity: number;
    passengerIndex: number;
    passengerLabel: string;
    lineTotal: number;
}

// ── Seat State ────────────────────────────────────────────────────────────────
export interface IPassengerSeatAssignment {
    passengerIndex: number;
    passengerLabel: string;
    passengerId: number;
    seatId: string;
    seatNumber: string;
    cabinClassName: string;
    isAssigning: boolean;
}

// ── Payment State ─────────────────────────────────────────────────────────────
export interface ICompletedPayment {
    transactionId: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    transactionDate: string;
}

/**
 * Immutable final booking summary persisted in the Success step.
 * Stored after the booking-success page fetches IBookingDetailDto.
 * This is the single source of truth for the receipt view and can
 * survive component destroy/recreate (e.g., page refresh guard).
 */
export interface IFinalBookingSummary {
    bookingId: number;
    bookingReference: string;
    flightNumber: string;
    originCode: string;
    destinationCode: string;
    departureTime: string;
    arrivalTime: string;
    totalPrice: number;
    currency: string;
    paymentStatus: string;
    passengerNames: string[];
    isComplete: true;
}

@Injectable({
    providedIn: 'root'
})
export class BookingStore {
    private flightsService = inject(FlightsService);

    // ── Private State ─────────────────────────────────────────────────────────

    private _searchCriteria = signal<IFlightSearchRequestDto | null>(null);
    private _currentStep = signal<BookingStep>(BookingStep.Search);
    private _availableFlights = signal<IFlightItineraryDto[]>([]);
    private _selectedFlight = signal<IFlightItineraryDto | null>(null);
    private _selectedFare = signal<IFlightFareOptionDto | null>(null);
    private _passengerDetails = signal<IPassengerFormValue[]>([]);
    private _ancillarySelections = signal<IPassengerAncillarySelections[]>([]);
    private _confirmedBooking = signal<IBookingDto | null>(null);
    private _seatAssignments = signal<IPassengerSeatAssignment[]>([]);
    private _completedPayment = signal<ICompletedPayment | null>(null);

    /**
     * Set once on the booking-success page after the full IBookingDetailDto
     * is fetched. This is the final, permanent record for this booking session.
     * Cleared only by startNewBooking() or clearSearch().
     */
    private _finalBookingSummary = signal<IFinalBookingSummary | null>(null);

    private _loading = signal<boolean>(false);
    private _error = signal<string | null>(null);

    // ── Public Selectors ──────────────────────────────────────────────────────

    searchCriteria = computed(() => this._searchCriteria());
    currentStep = computed(() => this._currentStep());
    availableFlights = computed(() => this._availableFlights());
    selectedFlight = computed(() => this._selectedFlight());
    selectedFare = computed(() => this._selectedFare());
    passengerDetails = computed(() => this._passengerDetails());
    ancillarySelections = computed(() => this._ancillarySelections());
    confirmedBooking = computed(() => this._confirmedBooking());
    seatAssignments = computed(() => this._seatAssignments());
    completedPayment = computed(() => this._completedPayment());
    finalBookingSummary = computed(() => this._finalBookingSummary());
    loading = computed(() => this._loading());
    error = computed(() => this._error());

    baseFareTotal = computed(() => {
        const fare = this._selectedFare();
        const criteria = this._searchCriteria();
        if (!fare || !criteria) return 0;
        const { adults, children, infants } = criteria.passengers;
        return (fare.pricePerAdult * adults) +
            (fare.pricePerChild * children) +
            (fare.pricePerInfant * infants);
    });

    totalPrice = computed(() => this.baseFareTotal());

    isPassengersComplete = computed(() => {
        const criteria = this._searchCriteria();
        const details = this._passengerDetails();
        if (!criteria) return false;
        const required = criteria.passengers.adults +
            criteria.passengers.children +
            criteria.passengers.infants;
        return details.length === required;
    });

    hasAnyAncillarySelected = computed(() =>
        this._ancillarySelections().some(pax =>
            Array.from(pax.selections.values()).some(qty => qty > 0)
        )
    );

    isSeatsComplete = computed(() => {
        const booking = this._confirmedBooking();
        const assignments = this._seatAssignments();
        if (!booking || booking.passengers.length === 0) return false;
        return booking.passengers.every(pax =>
            assignments.some(a => a.passengerId === pax.passengerId && a.seatId)
        );
    });

    isPaymentComplete = computed(() =>
        this._completedPayment()?.status?.toLowerCase() === 'succeeded'
    );

    /** True once the success page has stored the final summary. */
    isBookingFlowComplete = computed(() => this._finalBookingSummary() !== null);

    getSeatForPassenger = (passengerIndex: number): IPassengerSeatAssignment | undefined =>
        this._seatAssignments().find(a => a.passengerIndex === passengerIndex);

    constructor() { }

    // ── Flight Actions ────────────────────────────────────────────────────────

    setSearchCriteria(criteria: IFlightSearchRequestDto): void {
        this._searchCriteria.set(criteria);
    }

    searchFlights(criteria: IFlightSearchRequestDto): void {
        this._loading.set(true);
        this._error.set(null);
        this._searchCriteria.set(criteria);
        this._currentStep.set(BookingStep.Results);
        this._availableFlights.set([]);
        this._selectedFlight.set(null);
        this._selectedFare.set(null);
        this._passengerDetails.set([]);
        this._ancillarySelections.set([]);
        this._confirmedBooking.set(null);
        this._seatAssignments.set([]);
        this._completedPayment.set(null);
        this._finalBookingSummary.set(null);

        this.flightsService.searchFlights(criteria)
            .pipe(finalize(() => this._loading.set(false)))
            .subscribe({
                next: (flights) => this._availableFlights.set(flights),
                error: (err) => {
                    console.error('Flight Search Error:', err);
                    this._error.set('Failed to fetch flights. Please try again.');
                }
            });
    }

    selectFlight(flight: IFlightItineraryDto | null): void {
        this._selectedFlight.set(flight);
        this._selectedFare.set(null);
    }

    selectFare(fare: IFlightFareOptionDto | null): void {
        this._selectedFare.set(fare);
    }

    // ── Passenger Actions ─────────────────────────────────────────────────────

    setPassengerDetails(passengers: IPassengerFormValue[]): void {
        this._passengerDetails.set([...passengers]);
    }

    updatePassengerDetail(index: number, value: IPassengerFormValue): void {
        this._passengerDetails.update(current => {
            const updated = [...current];
            updated[index] = value;
            return updated;
        });
    }

    clearPassengerDetails(): void {
        this._passengerDetails.set([]);
    }

    // ── Ancillary Actions ─────────────────────────────────────────────────────

    initAncillarySelections(labels: { index: number; label: string }[]): void {
        const existing = this._ancillarySelections();
        if (existing.length === labels.length) return;
        this._ancillarySelections.set(
            labels.map(p => ({
                passengerIndex: p.index,
                passengerLabel: p.label,
                selections: new Map<number, number>()
            }))
        );
    }

    setAncillaryQuantity(passengerIndex: number, productId: number, quantity: number): void {
        this._ancillarySelections.update(list =>
            list.map(pax => {
                if (pax.passengerIndex !== passengerIndex) return pax;
                const newMap = new Map(pax.selections);
                quantity > 0 ? newMap.set(productId, quantity) : newMap.delete(productId);
                return { ...pax, selections: newMap };
            })
        );
    }

    getAncillaryQuantity(passengerIndex: number, productId: number): number {
        return this._ancillarySelections()
            .find(p => p.passengerIndex === passengerIndex)
            ?.selections.get(productId) ?? 0;
    }

    clearAncillarySelections(): void {
        this._ancillarySelections.update(list =>
            list.map(pax => ({ ...pax, selections: new Map<number, number>() }))
        );
    }

    // ── Confirmed Booking ─────────────────────────────────────────────────────

    setConfirmedBooking(booking: IBookingDto): void {
        this._confirmedBooking.set(booking);
    }

    // ── Seat Assignments ──────────────────────────────────────────────────────

    initSeatAssignments(): void {
        const booking = this._confirmedBooking();
        if (!booking) return;
        const existing = this._seatAssignments();
        if (existing.length === booking.passengers.length) return;
        this._seatAssignments.set(
            booking.passengers.map((pax, idx) => ({
                passengerIndex: idx,
                passengerLabel: `${pax.firstName} ${pax.lastName}`,
                passengerId: pax.passengerId,
                seatId: '',
                seatNumber: '',
                cabinClassName: '',
                isAssigning: false
            }))
        );
    }

    setPassengerAssigning(passengerId: number, isAssigning: boolean): void {
        this._seatAssignments.update(list =>
            list.map(a => a.passengerId === passengerId ? { ...a, isAssigning } : a)
        );
    }

    confirmSeatAssignment(passengerId: number, seatId: string, seatNumber: string, cabinClassName: string): void {
        this._seatAssignments.update(list =>
            list.map(a =>
                a.passengerId === passengerId
                    ? { ...a, seatId, seatNumber, cabinClassName, isAssigning: false }
                    : a
            )
        );
    }

    clearSeatAssignment(passengerId: number): void {
        this._seatAssignments.update(list =>
            list.map(a =>
                a.passengerId === passengerId
                    ? { ...a, seatId: '', seatNumber: '', cabinClassName: '', isAssigning: false }
                    : a
            )
        );
    }

    clearAllSeatAssignments(): void {
        this._seatAssignments.set([]);
    }

    // ── Payment Actions ───────────────────────────────────────────────────────

    setCompletedPayment(transaction: IPaymentTransaction): void {
        this._completedPayment.set({
            transactionId: transaction.transactionId,
            amount: transaction.amount,
            currency: transaction.currency,
            method: transaction.paymentMethod,
            status: transaction.status,
            transactionDate: transaction.transactionDate
        });
    }

    clearPayment(): void {
        this._completedPayment.set(null);
    }

    // ── Final Booking Summary ─────────────────────────────────────────────────

    /**
     * Called by booking-success.component after fetching full IBookingDetailDto.
     * This crystallises the booking flow into its final permanent state.
     * After this call, goToStep(BookingStep.Complete) should be called.
     *
     * @param detail Full booking detail from the server
     * @param currency Display currency code, defaults to 'SGD'
     */
    setFinalBookingSummary(detail: IBookingDetailDto, currency: string = 'SGD'): void {
        this._finalBookingSummary.set({
            bookingId: detail.bookingId,
            bookingReference: detail.bookingReference,
            flightNumber: detail.flightNumber,
            originCode: detail.originAirportCode,
            destinationCode: detail.destinationAirportCode,
            departureTime: typeof detail.flightDepartureTime === 'string' ? detail.flightDepartureTime : detail.flightDepartureTime.toISOString(),
            arrivalTime: typeof detail.flightArrivalTime === 'string' ? detail.flightArrivalTime : detail.flightArrivalTime.toISOString(),
            totalPrice: detail.totalPrice,
            currency,
            paymentStatus: detail.paymentStatus,
            passengerNames: detail.passengers.map(p => `${p.firstName} ${p.lastName}`),
            isComplete: true
        });
        this._currentStep.set(BookingStep.Complete);
    }

    /**
     * Resets the entire booking flow so the user can start a fresh booking.
     * Preserves the finalBookingSummary so the user can still see the receipt
     * if they navigate back to the success page in the same session.
     */
    startNewBooking(): void {
        this._searchCriteria.set(null);
        this._currentStep.set(BookingStep.Search);
        this._availableFlights.set([]);
        this._selectedFlight.set(null);
        this._selectedFare.set(null);
        this._passengerDetails.set([]);
        this._ancillarySelections.set([]);
        this._confirmedBooking.set(null);
        this._seatAssignments.set([]);
        this._completedPayment.set(null);
        this._error.set(null);
    }

    // ── Navigation ────────────────────────────────────────────────────────────

    goToStep(step: BookingStep): void {
        this._currentStep.set(step);
    }

    clearSearch(): void {
        this._availableFlights.set([]);
        this._selectedFlight.set(null);
        this._selectedFare.set(null);
        this._passengerDetails.set([]);
        this._ancillarySelections.set([]);
        this._confirmedBooking.set(null);
        this._seatAssignments.set([]);
        this._completedPayment.set(null);
        this._finalBookingSummary.set(null);
        this._error.set(null);
    }
}