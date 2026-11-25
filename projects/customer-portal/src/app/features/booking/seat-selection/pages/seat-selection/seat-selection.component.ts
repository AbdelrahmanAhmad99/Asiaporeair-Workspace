// ============================================================================
// seat-selection.component.ts
// Asiaporeair | "Secure Your Preferred Suite" — Seat Selection Smart Page
// ============================================================================

import {
  Component, OnInit, OnDestroy, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';
import { Subject, forkJoin, takeUntil } from 'rxjs';

import { BookingStore, BookingStep, IPassengerSeatAssignment } from '../../../store/booking.store';
import { SeatService } from '@shared-core';
import {
  ISeatMapDto,
  ISeatDto,
  ICabinSeatLayoutDto
} from '@shared-core';

import { SeatGridComponent } from '../../components/seat-grid/seat-grid.component';
import { SeatLegendComponent } from '../../components/seat-legend/seat-legend.component';
import { PassengerSeatSelectorComponent } from '../../components/passenger-seat-selector/passenger-seat-selector.component';

// ── Animations ────────────────────────────────────────────────────────────────
const SEAT_ANIMATIONS = [
  trigger('pageEnter', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('500ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),
  trigger('cabinFade', [
    transition('* => *', [
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(16px)' }),
        animate('380ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { optional: true })
    ])
  ]),
  trigger('panelSlide', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(20px)' }),
      animate('400ms 100ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateX(0)' }))
    ])
  ]),
  trigger('seatStagger', [
    transition('* => *', [
      query('.seat-row', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        stagger(18, [
          animate('260ms cubic-bezier(0.16,1,0.3,1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('popoverAnim', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-8px) scale(0.97)' }),
      animate('260ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
    ]),
    transition(':leave', [
      animate('180ms ease-in', style({ opacity: 0, transform: 'translateY(-6px) scale(0.97)' }))
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
  selector: 'app-seat-selection',
  standalone: true,
  imports: [
    CommonModule,
    SeatGridComponent,
    SeatLegendComponent,
    PassengerSeatSelectorComponent
  ],
  animations: SEAT_ANIMATIONS,
  templateUrl: './seat-selection.component.html',
  styleUrls: ['./seat-selection.component.scss']
})
export class SeatSelectionComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────────
  readonly bookingStore = inject(BookingStore);
  private readonly seatService = inject(SeatService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // ── Store Reads ───────────────────────────────────────────────────────────
  readonly confirmedBooking = computed(() => this.bookingStore.confirmedBooking());
  readonly seatAssignments = computed(() => this.bookingStore.seatAssignments());
  readonly selectedFlight = computed(() => this.bookingStore.selectedFlight());
  readonly selectedFare = computed(() => this.bookingStore.selectedFare());
  readonly searchCriteria = computed(() => this.bookingStore.searchCriteria());
  readonly isSeatsComplete = computed(() => this.bookingStore.isSeatsComplete());
  readonly currency = signal<string>('SGD');

  // ── Seat Map State ────────────────────────────────────────────────────────
  readonly seatMap = signal<ISeatMapDto | null>(null);
  readonly availableSeats = signal<ISeatDto[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly loadError = signal<string | null>(null);

  // ── UI State ──────────────────────────────────────────────────────────────
  readonly activeCabinIndex = signal<number>(0);
  readonly activePassengerId = signal<number | null>(null);
  readonly hoveredSeatId = signal<string | null>(null);
  readonly popoverSeat = signal<ISeatDto | null>(null);
  readonly assignError = signal<string | null>(null);

  // ── Computed ──────────────────────────────────────────────────────────────

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

  readonly activeCabin = computed((): ICabinSeatLayoutDto | null => {
    const map = this.seatMap();
    const idx = this.activeCabinIndex();
    return map?.cabinLayouts?.[idx] ?? null;
  });

  /** Set of available seatIds for O(1) lookup in template */
  readonly availableSeatIdSet = computed((): Set<string> =>
    new Set(this.availableSeats().map(s => s.seatId))
  );

  /** Currently active passenger assignment stub */
  readonly activeAssignment = computed((): IPassengerSeatAssignment | null => {
    const id = this.activePassengerId();
    return id != null
      ? (this.seatAssignments().find(a => a.passengerId === id) ?? null)
      : null;
  });

  readonly allPassengerLabels = computed(() =>
    this.seatAssignments().map(a => ({
      passengerId: a.passengerId,
      label: a.passengerLabel,
      seatNumber: a.seatNumber,
      isAssigning: a.isAssigning
    }))
  );

  readonly assignedCount = computed(() =>
    this.seatAssignments().filter(a => !!a.seatId).length
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.bookingStore.initSeatAssignments();

    // Set first unassigned passenger as active
    const first = this.seatAssignments().find(a => !a.seatId);
    if (first) this.activePassengerId.set(first.passengerId);

    this.loadSeatData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Private Loaders ───────────────────────────────────────────────────────

  private loadSeatData(): void {
    const booking = this.confirmedBooking();
    const flight = this.selectedFlight();
    const flightInstanceId = flight?.outboundSegments?.[0]?.flightInstanceId as number | undefined;

    if (!flightInstanceId || !booking) {
      this.loadError.set('Flight details are unavailable. Please return to the previous step.');
      return;
    }

    this.isLoading.set(true);
    this.loadError.set(null);

    forkJoin({
      seatMap: this.seatService.getSeatMapForFlight(flightInstanceId),
      available: this.seatService.getAvailableSeats({ flightInstanceId })
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ seatMap, available }) => {
          this.seatMap.set(seatMap);
          this.availableSeats.set(available);
          this.isLoading.set(false);

          // Auto-select cabin matching the booked fare
          const fare = this.selectedFare();
          if (fare?.cabinClass && seatMap.cabinLayouts.length > 1) {
            const matchIdx = seatMap.cabinLayouts.findIndex(c =>
              c.cabinClassName.toLowerCase().includes(fare.cabinClass.toLowerCase())
            );
            if (matchIdx >= 0) this.activeCabinIndex.set(matchIdx);
          }
        },
        error: (err) => {
          console.error('Seat data load error:', err);
          this.loadError.set('Unable to load the seat map. You may skip seat selection and assign seats later.');
          this.isLoading.set(false);
        }
      });
  }

  // ── Public Actions ────────────────────────────────────────────────────────

  setActiveCabin(index: number): void {
    this.activeCabinIndex.set(index);
    this.popoverSeat.set(null);
  }

  setActivePassenger(passengerId: number): void {
    this.activePassengerId.set(passengerId);
    this.popoverSeat.set(null);
    this.assignError.set(null);
  }

  onSeatHover(seat: ISeatDto | null): void {
    this.hoveredSeatId.set(seat?.seatId ?? null);
  }

  onSeatClick(seat: ISeatDto): void {
    // Ignore unavailable / occupied
    if (!seat.isAvailable || !this.availableSeatIdSet().has(seat.seatId)) {
      this.assignError.set(null);
      return;
    }
    // If this seat is already assigned to a passenger, deselect it
    const existingAssignment = this.seatAssignments().find(a => a.seatId === seat.seatId);
    if (existingAssignment) {
      this.bookingStore.clearSeatAssignment(existingAssignment.passengerId);
      if (this.popoverSeat()?.seatId === seat.seatId) {
        this.popoverSeat.set(null);
      }
      return;
    }
    // Show popover for confirmation
    this.popoverSeat.set(seat);
    this.assignError.set(null);
  }

  closePopover(): void {
    this.popoverSeat.set(null);
  }

  onConfirmSeat(seat: ISeatDto): void {
    const booking = this.confirmedBooking();
    const passId = this.activePassengerId();
    if (!booking || passId == null) return;

    const assignment = this.seatAssignments().find(a => a.passengerId === passId);
    if (!assignment) return;

    if (assignment.seatId) {
      this.bookingStore.clearSeatAssignment(passId);
    }

    this.bookingStore.setPassengerAssigning(passId, true);
    this.popoverSeat.set(null);
    this.assignError.set(null);

    this.seatService.assignSeat({
      bookingId: booking.bookingId,
      passengerId: passId,
      seatId: seat.seatId
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
          if (success) {
            this.bookingStore.confirmSeatAssignment(
              passId,
              seat.seatId,
              seat.seatNumber,
              seat.cabinClassName
            );
            // Auto-advance to next unassigned passenger
            const nextPax = this.seatAssignments().find(
              a => a.passengerId !== passId && !a.seatId
            );
            if (nextPax) this.activePassengerId.set(nextPax.passengerId);
          } else {
            this.bookingStore.setPassengerAssigning(passId, false);
            this.assignError.set('Seat assignment failed. Please try another seat.');
          }
        },
        error: (err) => {
          console.error('Seat assignment error:', err);
          this.bookingStore.setPassengerAssigning(passId, false);
          this.assignError.set(
            err?.error?.message ?? 'This seat could not be assigned. Please try another.'
          );
        }
      });
  }

  onChangeSeat(passengerId: number): void {
    this.bookingStore.clearSeatAssignment(passengerId);
    this.activePassengerId.set(passengerId);
    this.popoverSeat.set(null);
    this.assignError.set(null);
  }

  onSkipSeats(): void {
    this.bookingStore.goToStep(BookingStep.Payment);
    this.router.navigate(['/booking/payment']);
  }

  onBack(): void {
    this.bookingStore.goToStep(BookingStep.Addons);
    this.router.navigate(['/booking/ancillaries']);
  }

  onProceedToPayment(): void {
    if (!this.isSeatsComplete()) return;
    this.bookingStore.goToStep(BookingStep.Payment);
    this.router.navigate(['/booking/payment']);
  }

  // ── Template Helpers ──────────────────────────────────────────────────────

  isSeatSelectedForActive(seatId: string): boolean {
    const passId = this.activePassengerId();
    if (passId == null) return false;
    return this.seatAssignments().find(a => a.passengerId === passId)?.seatId === seatId;
  }

  isSeatSelectedByAnyPassenger(seatId: string): boolean {
    return this.seatAssignments().some(a => a.seatId === seatId);
  }

  getPassengerForSeat(seatId: string): IPassengerSeatAssignment | undefined {
    return this.seatAssignments().find(a => a.seatId === seatId);
  }

  formatPrice(amount: number | null | undefined): string {
    if (amount == null) return 'Complimentary';
    return amount === 0
      ? 'Complimentary'
      : `${this.currency()} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  trackByCabin(_: number, c: ICabinSeatLayoutDto): number { return c.cabinClassId; }
  trackBySeat(_: number, s: ISeatDto): string { return s.seatId; }
}