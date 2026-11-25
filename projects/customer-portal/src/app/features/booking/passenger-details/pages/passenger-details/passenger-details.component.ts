// ============================================================================
// passenger-details.component.ts
// Asiaporeair | "Traveller Profiles" — Passenger Details Smart Page
// ============================================================================

import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { Router } from '@angular/router';

import { BookingStore, BookingStep } from '../../../store/booking.store';
import { PassengerFormComponent, IPassengerFormValue } from '../../components/passenger-form/passenger-form.component';

// ── Animation Definitions ─────────────────────────────────────────────────────
const PASSENGER_ANIMATIONS = [
  trigger('pageEnter', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('500ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ]),

  trigger('formStagger', [
    transition('* => *', [
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(24px)' }),
        stagger(100, [
          animate('480ms cubic-bezier(0.16,1,0.3,1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),

  trigger('summarySlide', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(16px)' }),
      animate('400ms 200ms cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateX(0)' }))
    ])
  ]),

  trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('300ms ease-out', style({ opacity: 1 }))
    ])
  ])
];

// ── Passenger Slot Model ──────────────────────────────────────────────────────
export interface IPassengerSlot {
  index: number;
  type: 'adult' | 'child' | 'infant';
  label: string;
  formValue: IPassengerFormValue | null;
  isValid: boolean;
}

@Component({
  selector: 'app-passenger-details',
  standalone: true,
  imports: [CommonModule, PassengerFormComponent],
  animations: PASSENGER_ANIMATIONS,
  templateUrl: './passenger-details.component.html',
  styleUrls: ['./passenger-details.component.scss']
})
export class PassengerDetailsComponent implements OnInit {

  // ── DI ────────────────────────────────────────────────────────────────────
  readonly bookingStore = inject(BookingStore);
  private readonly router = inject(Router);

  // ── Derived from Store ────────────────────────────────────────────────────
  readonly searchCriteria = computed(() => this.bookingStore.searchCriteria());
  readonly selectedFlight = computed(() => this.bookingStore.selectedFlight());
  readonly selectedFare = computed(() => this.bookingStore.selectedFare());
  readonly totalPrice = computed(() => this.bookingStore.totalPrice());
  readonly currency = signal<string>('SGD');

  // ── Passenger Slots ───────────────────────────────────────────────────────
  readonly passengerSlots = signal<IPassengerSlot[]>([]);

  // ── UI State ──────────────────────────────────────────────────────────────
  readonly activePassengerIndex = signal<number>(0);
  readonly formSubmitAttempted = signal<boolean>(false);

  // ── Computed Helpers ──────────────────────────────────────────────────────
  readonly allFormsValid = computed(() =>
    this.passengerSlots().every(slot => slot.isValid)
  );

  readonly completedCount = computed(() =>
    this.passengerSlots().filter(slot => slot.isValid).length
  );

  readonly totalPassengerCount = computed(() =>
    this.passengerSlots().length
  );

  readonly journeyLabel = computed(() => {
    const c = this.searchCriteria();
    if (!c?.segments?.length) return '';
    const s = c.segments;
    return `${s[0].originIataCode} → ${s[s.length - 1].destinationIataCode}`;
  });

  readonly flightSummaryLabel = computed(() => {
    const flight = this.selectedFlight();
    const fare = this.selectedFare();
    if (!flight || !fare) return null;
    const seg = flight.outboundSegments?.[0];
    if (!seg) return null;
    return {
      route: `${seg.originAirportIata} → ${seg.destinationAirportIata}`,
      airline: seg.airlineName,
      fareName: fare.fareName,
      cabinClass: fare.cabinClass
    };
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.buildPassengerSlots();
  }

  // ── Private Builders ──────────────────────────────────────────────────────

  private buildPassengerSlots(): void {
    const criteria = this.searchCriteria();
    if (!criteria) return;

    const slots: IPassengerSlot[] = [];
    let index = 0;

    const { adults, children, infants } = criteria.passengers;

    for (let i = 0; i < adults; i++) {
      slots.push({
        index: index++,
        type: 'adult',
        label: adults === 1 ? 'Adult Traveller' : `Adult Traveller ${i + 1}`,
        formValue: null,
        isValid: false
      });
    }

    for (let i = 0; i < children; i++) {
      slots.push({
        index: index++,
        type: 'child',
        label: children === 1 ? 'Child Traveller' : `Child Traveller ${i + 1}`,
        formValue: null,
        isValid: false
      });
    }

    for (let i = 0; i < infants; i++) {
      slots.push({
        index: index++,
        type: 'infant',
        label: infants === 1 ? 'Infant' : `Infant ${i + 1}`,
        formValue: null,
        isValid: false
      });
    }

    this.passengerSlots.set(slots);
  }

  // ── Public Actions ────────────────────────────────────────────────────────

  onPassengerFormChange(index: number, value: IPassengerFormValue | null): void {
    this.passengerSlots.update(slots => {
      const updated = [...slots];
      updated[index] = { ...updated[index], formValue: value };
      return updated;
    });
  }

  onPassengerFormValidityChange(index: number, isValid: boolean): void {
    this.passengerSlots.update(slots => {
      const updated = [...slots];
      updated[index] = { ...updated[index], isValid };
      return updated;
    });
  }

  setActivePassenger(index: number): void {
    this.activePassengerIndex.set(index);
  }

  onContinue(): void {
    this.formSubmitAttempted.set(true);

    if (!this.allFormsValid()) return;

    // Save all passenger form values to the booking store
    const passengers = this.passengerSlots()
      .filter(slot => slot.formValue !== null)
      .map(slot => slot.formValue!);

    this.bookingStore.setPassengerDetails(passengers);
    this.bookingStore.goToStep(BookingStep.Addons);
    this.router.navigate(['/booking/ancillaries']);
  }

  onBack(): void {
    this.bookingStore.goToStep(BookingStep.Results);
    this.router.navigate(['/booking/flight-results']);
  }

  // ── Template Helpers ──────────────────────────────────────────────────────

  getPassengerIcon(type: 'adult' | 'child' | 'infant'): string {
    if (type === 'infant') return 'infant';
    if (type === 'child') return 'child';
    return 'adult';
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getProgressPercent(): number {
    const total = this.totalPassengerCount();
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  }

  trackBySlot(_: number, slot: IPassengerSlot): number {
    return slot.index;
  }
}