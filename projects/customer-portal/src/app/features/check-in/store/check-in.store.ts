// ============================================================================
// check-in.store.ts  
// Asiaporeair | Signals-Based Store — Full Check-in Lifecycle
//   · activeBoardingPass    → Holds the most recently issued IBoardingPassDto
//   · generatedBoardingPasses → Accumulates all passes in the session
//   · isGenerating          → Computed; true while any pass API call is in-flight
//   · generatingPassengerIds → Per-card loading state (no full-page block)
//   · checkedInPassengerIds  → Drives "Checked-in" badge on each card
//   · generationErrors       → Per-passenger concierge error messages
//   · generationError        → Global fallback error
// ============================================================================

import { Injectable, signal, computed } from '@angular/core';
import { IBookingDetailDto, IBookingPassengerDetailDto } from '@shared-core';
import { IBoardingPassDto } from '@shared-core';

// ── Domain Types ──────────────────────────────────────────────────────────────

/**
 * The 3-step check-in lifecycle:
 *   1 → Search / PNR lookup
 *   2 → Passenger selection & boarding pass generation
 *   3 → Confirmation / success
 */
export type CheckInStep = 1 | 2 | 3;

/**
 * Granular status for the search phase.
 *   idle      → Initial state, no action taken.
 *   loading   → API call in-flight.
 *   success   → Booking located; navigating to passenger-selection.
 *   not_found → 404: PNR/lastName combo produced no record.
 *   not_open  → 422/409: Flight is outside the 48h–90m check-in window.
 *   error     → Generic network or server error.
 */
export type CheckInSearchStatus =
    | 'idle'
    | 'loading'
    | 'success'
    | 'not_found'
    | 'not_open'
    | 'error';

/** A passenger enriched with a client-side "selected" flag. */
export interface ICheckInPassenger extends IBookingPassengerDetailDto {
    isSelected: boolean;
}

// ── Store ─────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class CheckInStore {

    // ── Core Flow Signals ──────────────────────────────────────────────────────

    /**
     * Active check-in step (1–3).
     * Drives the luxury stepper indicator in the UI.
     */
    readonly checkInStep = signal<CheckInStep>(1);

    /**
     * The full booking detail returned from getBookingByReference().
     * Set in Step 1; consumed by Step 2 & 3.
     * Cleared on store reset.
     */
    readonly currentBooking = signal<IBookingDetailDto | null>(null);

    /**
     * Enriched passenger list derived from currentBooking.
     * Each passenger carries a client-side `isSelected` flag.
     * Populated automatically when currentBooking is set via setCurrentBooking().
     */
    readonly passengers = signal<ICheckInPassenger[]>([]);

    // ── Search Phase Signals ───────────────────────────────────────────────────

    /** Granular search-phase status. */
    readonly searchStatus = signal<CheckInSearchStatus>('idle');

    /** Human-readable, concierge-toned error message for search failures. */
    readonly error = signal<string | null>(null);

    /** True while the PNR lookup call is in-flight. Derived from searchStatus. */
    readonly isLoading = computed((): boolean => this.searchStatus() === 'loading');

    /** The last PNR the user searched for. Used to pre-populate on back-nav. */
    readonly lastSearchedPnr = signal<string>('');

    // ── Passenger Selection Signals ────────────────────────────────────────────

    /** IDs of passengers marked for check-in in the selection UI. */
    readonly selectedPassengerIds = signal<number[]>([]);

    // ── ✨ Boarding Pass Generation Signals (NEW in v2) ────────────────────────

    /**
     * The most recently generated boarding pass.
     * Set immediately after a successful generateBoardingPass() call.
     * Consumed by the /check-in/success page (Step 3).
     */
    readonly activeBoardingPass = signal<IBoardingPassDto | null>(null);

    /**
     * Accumulates every boarding pass generated in the current session.
     * Supports multi-passenger flows where each card triggers its own API call.
     * Deduplicated by passengerId — re-generating for a passenger replaces
     * the previous entry.
     */
    readonly generatedBoardingPasses = signal<IBoardingPassDto[]>([]);

    /**
     * True while at least one boarding pass generation API call is in-flight.
     * Derived from generatingPassengerIds so it never goes stale.
     */
    readonly isGenerating = computed((): boolean => this.generatingPassengerIds().length > 0);

    /**
     * Set of passenger IDs currently awaiting a boarding pass response.
     * Enables per-card loading state without freezing the entire page —
     * the user can still see other cards while one is generating.
     */
    readonly generatingPassengerIds = signal<number[]>([]);

    /**
     * Set of passenger IDs for whom a boarding pass has been successfully issued
     * in this session. Drives the "Checked-in ✓" visual state on each card.
     */
    readonly checkedInPassengerIds = signal<number[]>([]);

    /**
     * Per-passenger generation error messages.
     * Record<passengerId, concierge-toned error string>.
     * Surfaced inline on the specific passenger card that failed.
     */
    readonly generationErrors = signal<Record<number, string>>({});

    /**
     * Global generation error shown at the page level.
     * Set only when all passengers have simultaneously failed, which
     * signals a systemic connectivity issue rather than a per-passenger one.
     */
    readonly generationError = signal<string | null>(null);

    // ── Computed Signals ───────────────────────────────────────────────────────

    /** True when a booking has been successfully retrieved. */
    readonly hasBooking = computed((): boolean => this.currentBooking() !== null);

    /** True when at least one passenger is selected for check-in. */
    readonly hasSelectedPassengers = computed((): boolean =>
        this.selectedPassengerIds().length > 0
    );

    /** True when every passenger in the booking has been checked in. */
    readonly allPassengersCheckedIn = computed((): boolean => {
        const total = this.passengers().length;
        return total > 0 && this.checkedInPassengerIds().length >= total;
    });

    /** Number of passengers checked in so far this session. */
    readonly checkedInCount = computed((): number => this.checkedInPassengerIds().length);

    /** The full name of the primary (first) passenger. */
    readonly primaryPassengerName = computed((): string => {
        const pax = this.currentBooking()?.passengers?.[0];
        return pax ? `${pax.firstName} ${pax.lastName}` : '';
    });

    /** Flight route summary string e.g. "SIN → LHR". */
    readonly flightRouteSummary = computed((): string => {
        const b = this.currentBooking();
        return b ? `${b.originAirportCode} → ${b.destinationAirportCode}` : '';
    });

    /** True when the search phase encountered any error. */
    readonly hasError = computed((): boolean =>
        ['not_found', 'not_open', 'error'].includes(this.searchStatus())
    );

    // ── Actions — Search Phase ─────────────────────────────────────────────────

    setCurrentBooking(booking: IBookingDetailDto): void {
        this.currentBooking.set(booking);
        this.lastSearchedPnr.set(booking.bookingReference);

        const enriched: ICheckInPassenger[] = (booking.passengers ?? []).map(p => ({
            ...p,
            isSelected: true
        }));
        this.passengers.set(enriched);

        this.searchStatus.set('success');
        this.error.set(null);
    }

    beginSearch(pnr: string): void {
        this.lastSearchedPnr.set(pnr.toUpperCase());
        this.searchStatus.set('loading');
        this.error.set(null);
    }

    setSearchError(
        status: Exclude<CheckInSearchStatus, 'idle' | 'loading' | 'success'>,
        msg: string
    ): void {
        this.searchStatus.set(status);
        this.error.set(msg);
    }

    // ── Actions — Boarding Pass Generation (NEW in v2) ────────────────────────

    /**
     * Marks a passenger's generation as in-flight.
     * Must be called immediately before dispatching the API call so the
     * card shows its skeleton/spinner without delay.
     */
    beginGenerating(passengerId: number): void {
        this.generatingPassengerIds.update(ids =>
            ids.includes(passengerId) ? ids : [...ids, passengerId]
        );
        // Clear any stale error for this specific passenger
        this.generationErrors.update(errs => {
            const next = { ...errs };
            delete next[passengerId];
            return next;
        });
        this.generationError.set(null);
    }

    /**
     * Stores a successfully generated boarding pass and resolves all loading state.
     * Also marks the passenger as fully checked-in for this session.
     */
    setBoardingPassSuccess(boardingPass: IBoardingPassDto): void {
        const { passengerId } = boardingPass;

        this.activeBoardingPass.set(boardingPass);

        this.generatedBoardingPasses.update(passes => [
            ...passes.filter(p => p.passengerId !== passengerId),
            boardingPass
        ]);

        this.checkedInPassengerIds.update(ids =>
            ids.includes(passengerId) ? ids : [...ids, passengerId]
        );

        this.generatingPassengerIds.update(ids => ids.filter(id => id !== passengerId));
    }

    /**
     * Records a per-passenger generation failure.
     * If every passenger in the booking has failed, a global error is also set.
     */
    setBoardingPassError(passengerId: number, message: string): void {
        this.generatingPassengerIds.update(ids => ids.filter(id => id !== passengerId));
        this.generationErrors.update(errs => ({ ...errs, [passengerId]: message }));

        const allFailed = this.passengers().every(
            p => !!this.generationErrors()[p.passengerId]
        );
        if (allFailed) {
            this.generationError.set(
                'Our boarding systems are temporarily unavailable. Please contact our concierge team or try again shortly.'
            );
        }
    }

    // ── Per-Passenger Helper Queries ───────────────────────────────────────────

    /** True if the specific passenger's API call is in-flight. */
    isPassengerGenerating(passengerId: number): boolean {
        return this.generatingPassengerIds().includes(passengerId);
    }

    /** True if the specific passenger has been successfully checked in. */
    isPassengerCheckedIn(passengerId: number): boolean {
        return this.checkedInPassengerIds().includes(passengerId);
    }

    /** Returns the inline error for a specific passenger, or null. */
    getPassengerError(passengerId: number): string | null {
        return this.generationErrors()[passengerId] ?? null;
    }

    // ── Navigation Actions ─────────────────────────────────────────────────────

    advanceStep(): void {
        const current = this.checkInStep();
        if (current < 3) this.checkInStep.set((current + 1) as CheckInStep);
    }

    retreatStep(): void {
        const current = this.checkInStep();
        if (current > 1) this.checkInStep.set((current - 1) as CheckInStep);
    }

    togglePassenger(passengerId: number): void {
        this.selectedPassengerIds.update(ids =>
            ids.includes(passengerId)
                ? ids.filter(id => id !== passengerId)
                : [...ids, passengerId]
        );
    }

    // ── Reset Actions ─────────────────────────────────────────────────────────

    /** Full store wipe — called when the user explicitly starts a new check-in. */
    resetStore(): void {
        this.checkInStep.set(1);
        this.currentBooking.set(null);
        this.passengers.set([]);
        this.searchStatus.set('idle');
        this.error.set(null);
        this.selectedPassengerIds.set([]);
        this.lastSearchedPnr.set('');
        this.activeBoardingPass.set(null);
        this.generatedBoardingPasses.set([]);
        this.generatingPassengerIds.set([]);
        this.checkedInPassengerIds.set([]);
        this.generationErrors.set({});
        this.generationError.set(null);
    }

    /** Resets only the PNR search phase (preserves booking data). */
    resetSearchPhase(): void {
        this.searchStatus.set('idle');
        this.error.set(null);
    }

    /** Clears generation errors so the user can retry failed passengers. */
    resetGenerationErrors(): void {
        this.generationErrors.set({});
        this.generationError.set(null);
        this.generatingPassengerIds.set([]);
    }
}