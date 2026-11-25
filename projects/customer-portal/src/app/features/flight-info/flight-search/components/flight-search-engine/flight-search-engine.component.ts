// ================================================================
//  flight-search-engine.component.ts
//  Asiaporeair | "Begin Your Journey" — Flight Search Engine
//  Smart Component: owns all search state via Angular Signals
// ================================================================

import {
    Component,
    OnInit,
    OnDestroy,
    signal,
    computed,
    effect,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    HostListener,
    ElementRef,
    inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    FormArray,
    Validators,
    AbstractControl,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
    trigger,
    transition,
    style,
    animate,
    query,
    stagger,
} from '@angular/animations';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { FlightsService } from '@shared-core';
import { ISearchEnginePatch } from '../../../store/flights.store';
import {
    IFlightSearchRequestDto,
    IFlightItineraryDto,
    IPassengerCountDto,
    ISearchSegmentDto,
    IFlightStatusRequestDto,
    IFlightSegmentDto,
} from '@shared-core';
import { BookingStore } from '../../../../booking/store/booking.store';

// ── Types & Constants ─────────────────────────────────────────
export type SearchType = 'OneWay' | 'RoundTrip' | 'MultiCity';
export type ActiveTab = 'book' | 'status' | 'checkin';

export interface CabinClass {
    value: string;
    label: string;
    sublabel: string;
}

export interface AirportSuggestion {
    iata: string;
    city: string;
    name: string;
    country: string;
}

export const CABIN_CLASSES: CabinClass[] = [
    { value: 'Economy', label: 'Economy', sublabel: 'Most popular' },
    { value: 'PremiumEconomy', label: 'Premium Economy', sublabel: 'Extra comfort' },
    { value: 'Business', label: 'Business Suite', sublabel: 'Premium experience' },
    { value: 'First', label: 'First Class', sublabel: 'Ultimate luxury' },
];

/** Static airport list — replace with API-backed typeahead in production */
export const AIRPORT_DATA: AirportSuggestion[] = [
    { iata: 'SIN', city: 'Singapore', name: 'Changi Airport', country: 'Singapore' },
    { iata: 'DXB', city: 'Dubai', name: 'Dubai International', country: 'UAE' },
    { iata: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'United Kingdom' },
    { iata: 'CDG', city: 'Paris', name: 'Charles de Gaulle', country: 'France' },
    { iata: 'JFK', city: 'New York', name: 'John F. Kennedy Intl', country: 'USA' },
    { iata: 'NRT', city: 'Tokyo', name: 'Narita International', country: 'Japan' },
    { iata: 'HND', city: 'Tokyo', name: 'Haneda Airport', country: 'Japan' },
    { iata: 'SYD', city: 'Sydney', name: 'Kingsford Smith Airport', country: 'Australia' },
    { iata: 'HKG', city: 'Hong Kong', name: 'Hong Kong International', country: 'Hong Kong' },
    { iata: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport', country: 'Thailand' },
    { iata: 'KUL', city: 'Kuala Lumpur', name: 'KLIA', country: 'Malaysia' },
    { iata: 'ICN', city: 'Seoul', name: 'Incheon International', country: 'South Korea' },
    { iata: 'AMS', city: 'Amsterdam', name: 'Schiphol Airport', country: 'Netherlands' },
    { iata: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany' },
    { iata: 'ZRH', city: 'Zurich', name: 'Zurich Airport', country: 'Switzerland' },
    { iata: 'MNL', city: 'Manila', name: 'Ninoy Aquino Intl', country: 'Philippines' },
    { iata: 'CGK', city: 'Jakarta', name: 'Soekarno-Hatta Intl', country: 'Indonesia' },
    { iata: 'CAI', city: 'Cairo', name: 'Cairo International Airport', country: 'Egypt' },
    { iata: 'LAX', city: 'Los Angeles', name: 'Los Angeles Intl', country: 'USA' },
    { iata: 'ORD', city: 'Chicago', name: "O'Hare International", country: 'USA' },
    { iata: 'MEL', city: 'Melbourne', name: 'Melbourne Airport', country: 'Australia' },
    { iata: 'PVG', city: 'Shanghai', name: 'Pudong International', country: 'China' },
    { iata: 'PEK', city: 'Beijing', name: 'Capital International', country: 'China' },
    { iata: 'MUC', city: 'Munich', name: 'Munich Airport', country: 'Germany' },
    { iata: 'BCN', city: 'Barcelona', name: 'El Prat Airport', country: 'Spain' },
    { iata: 'MAD', city: 'Madrid', name: 'Adolfo Suárez-Barajas', country: 'Spain' },
    { iata: 'IST', city: 'Istanbul', name: 'Istanbul Airport', country: 'Turkey' },
    { iata: 'DOH', city: 'Doha', name: 'Hamad International', country: 'Qatar' },
    { iata: 'ADD', city: 'Addis Ababa', name: 'Bole International', country: 'Ethiopia' },
    { iata: 'CPT', city: 'Cape Town', name: 'Cape Town International', country: 'South Africa' },
];

// ── Angular Animations ────────────────────────────────────────
const SEARCH_ANIMATIONS = [
    trigger('panelReveal', [
        transition(':enter', [
            style({ opacity: 0, transform: 'translateY(-8px) scale(0.99)' }),
            animate('350ms cubic-bezier(0.16, 1, 0.3, 1)',
                style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
        ]),
        transition(':leave', [
            animate('200ms cubic-bezier(0.4, 0, 1, 1)',
                style({ opacity: 0, transform: 'translateY(-6px)' })),
        ]),
    ]),
    trigger('dropdownReveal', [
        transition(':enter', [
            style({ opacity: 0, transform: 'translateY(-6px)' }),
            animate('280ms cubic-bezier(0.16, 1, 0.3, 1)',
                style({ opacity: 1, transform: 'translateY(0)' })),
        ]),
        transition(':leave', [
            animate('160ms ease-in', style({ opacity: 0, transform: 'translateY(-4px)' })),
        ]),
    ]),
    trigger('segmentEnter', [
        transition(':enter', [
            style({ opacity: 0, transform: 'translateX(-10px)' }),
            animate('320ms cubic-bezier(0.16, 1, 0.3, 1)',
                style({ opacity: 1, transform: 'translateX(0)' })),
        ]),
        transition(':leave', [
            animate('180ms ease-in',
                style({ opacity: 0, transform: 'translateX(10px)', height: '0', marginBottom: '0' })),
        ]),
    ]),
    trigger('fadeIn', [
        transition(':enter', [
            style({ opacity: 0 }),
            animate('250ms ease-out', style({ opacity: 1 })),
        ]),
    ]),
    trigger('staggerList', [
        transition(':enter', [
            query('.suggestion-item', [
                style({ opacity: 0, transform: 'translateY(4px)' }),
                stagger('40ms', [
                    animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
                ]),
            ], { optional: true }),
        ]),
    ]),
];

// ── Component ─────────────────────────────────────────────────
@Component({
    selector: 'app-flight-search-engine',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './flight-search-engine.component.html',
    styleUrls: ['./flight-search-engine.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: SEARCH_ANIMATIONS,
})
export class FlightSearchEngineComponent implements OnInit, OnDestroy {

    // ── Injections ────────────────────────────────────────────
    private readonly fb = inject(FormBuilder);
    private readonly flightsService = inject(FlightsService);
    private readonly router = inject(Router);
    private readonly elRef = inject(ElementRef);
    private readonly cdr = inject(ChangeDetectorRef);
    private readonly bookingStore = inject(BookingStore);

    // ── Signals — core UI state ───────────────────────────────
    readonly activeTab = signal<ActiveTab>('book');
    readonly searchType = signal<SearchType>('RoundTrip');
    readonly isLoading = signal(false);
    readonly serverError = signal<string | null>(null);

    // Passenger popup
    readonly showPassengerDropdown = signal(false);
    // Cabin class popup
    readonly showCabinDropdown = signal(false);
    // Airport suggestion panels: key = fieldId
    readonly activeSuggestionField = signal<string | null>(null);
    readonly suggestionQuery = signal('');
    // Calendar
    readonly activeDateField = signal<string | null>(null);
    readonly calendarMonth = signal<Date>(new Date());

    // Flight status tab state
    readonly statusResult = signal<IFlightSegmentDto | null>(null);
    readonly statusError = signal<string | null>(null);
    readonly statusLoading = signal(false);

    // ── Signals — derived ────────────────────────────────────
    readonly totalPassengers = computed(() => {
        const p = this.passengers();
        return p.adults + p.children + p.infants;
    });

    readonly passengers = signal<IPassengerCountDto>({ adults: 1, children: 0, infants: 0 });
    readonly selectedCabin = signal<CabinClass>(CABIN_CLASSES[0]);
    readonly flexibleFares = signal(false);

    /** Airport suggestions filtered by query */
    readonly airportSuggestions = computed<AirportSuggestion[]>(() => {
        const q = this.suggestionQuery().toLowerCase().trim();
        if (q.length < 1) return AIRPORT_DATA.slice(0, 8);
        return AIRPORT_DATA.filter(a =>
            a.iata.toLowerCase().includes(q) ||
            a.city.toLowerCase().includes(q) ||
            a.name.toLowerCase().includes(q) ||
            a.country.toLowerCase().includes(q)
        ).slice(0, 8);
    });

    /** Calendar days for the current month view */
    readonly calendarDays = computed<(Date | null)[]>(() => {
        const month = this.calendarMonth();
        const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
        const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        const days: (Date | null)[] = [];
        // Leading nulls for offset
        for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(month.getFullYear(), month.getMonth(), d));
        }
        return days;
    });

    readonly calendarMonthLabel = computed(() =>
        this.calendarMonth().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    );

    // ── Forms ────────────────────────────────────────────────
    bookForm!: FormGroup;
    statusForm!: FormGroup;
    readonly CABIN_CLASSES = CABIN_CLASSES;

    // Exposed to template
    get segments(): FormArray {
        return this.bookForm.get('segments') as FormArray;
    }

    // ── Internal tracking ────────────────────────────────────
    private readonly destroy$ = new Subject<void>();
    private lastFocusedOriginField: string | null = null;

    // Today's date for min date constraint
    readonly todayISO = new Date().toISOString().split('T')[0];
    readonly weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    // ── Lifecycle ────────────────────────────────────────────
    ngOnInit(): void {
        this.buildBookForm();
        this.buildStatusForm();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Form construction ─────────────────────────────────────
    private buildBookForm(): void {
        this.bookForm = this.fb.group({
            includeFlexibleFares: [false],
            segments: this.fb.array([this.createSegment()]),
            returnDate: [''],
        });
        // Add return segment for initial RoundTrip state
        this.applySearchTypeToForm('RoundTrip');
    }

    private buildStatusForm(): void {
        this.statusForm = this.fb.group({
            flightNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{2}\d{1,4}$/i)]],
            flightDate: ['', Validators.required],
        });
    }

    private createSegment(origin = '', destination = '', date = ''): FormGroup {
        return this.fb.group({
            originIataCode: [origin, Validators.required],
            originDisplay: [origin],
            destinationIataCode: [destination, Validators.required],
            destinationDisplay: [destination],
            departureDate: [date, Validators.required],
        });
    }

    // ── Search type management ────────────────────────────────
    setSearchType(type: SearchType): void {
        this.searchType.set(type);
        this.applySearchTypeToForm(type);
        this.closeAllPanels();
    }

    private applySearchTypeToForm(type: SearchType): void {
        const segs = this.segments;

        if (type === 'OneWay') {
            // Keep only first segment, remove return
            while (segs.length > 1) segs.removeAt(segs.length - 1);
            this.bookForm.get('returnDate')?.reset('');
        } else if (type === 'RoundTrip') {
            while (segs.length > 1) segs.removeAt(segs.length - 1);
            // returnDate field is used for round-trip return
        } else if (type === 'MultiCity') {
            this.bookForm.get('returnDate')?.reset('');
            // Ensure at least 2 segments for multi-city
            while (segs.length < 2) segs.push(this.createSegment());
        }
    }


    addSegment(): void {
        if (this.segments.length >= 5) return;
        this.segments.push(this.createSegment());
    }

    removeSegment(index: number): void {
        if (this.segments.length <= 2) return;
        this.segments.removeAt(index);
    }

    // ── Swap Origin ↔ Destination ─────────────────────────────
    swapRoute(segmentIndex: number): void {
        const seg = this.segments.at(segmentIndex);
        const origin = seg.get('originIataCode')?.value;
        const originDisp = seg.get('originDisplay')?.value;
        const dest = seg.get('destinationIataCode')?.value;
        const destDisp = seg.get('destinationDisplay')?.value;

        seg.patchValue({
            originIataCode: dest,
            originDisplay: destDisp,
            destinationIataCode: origin,
            destinationDisplay: originDisp,
        });
    }

    // ── Passenger management ──────────────────────────────────
    togglePassengerDropdown(): void {
        this.showPassengerDropdown.update(v => !v);
        this.showCabinDropdown.set(false);
        this.closeAirportSuggestions();
        this.activeDateField.set(null);
    }

    adjustPassenger(type: keyof IPassengerCountDto, delta: number): void {
        this.passengers.update(p => {
            const current = (p[type] as number);
            let next = Math.max(0, current + delta);

            // Adults minimum = 1
            if (type === 'adults') next = Math.max(1, next);

            // Infants cannot exceed adults
            if (type === 'infants') {
                const adults = p.adults;
                next = Math.min(next, adults);
            }

            // Total cap = 9
            const total = p.adults + p.children + p.infants - current + next;
            if (total > 9) return p;

            return { ...p, [type]: next };
        });
    }

    get passengerSummary(): string {
        const p = this.passengers();
        const parts: string[] = [`${p.adults} Adult${p.adults !== 1 ? 's' : ''}`];
        if (p.children > 0) parts.push(`${p.children} Child${p.children !== 1 ? 'ren' : ''}`);
        if (p.infants > 0) parts.push(`${p.infants} Infant${p.infants !== 1 ? 's' : ''}`);
        return parts.join(', ');
    }

    // ── Cabin class management ────────────────────────────────
    toggleCabinDropdown(): void {
        this.showCabinDropdown.update(v => !v);
        this.showPassengerDropdown.set(false);
        this.closeAirportSuggestions();
        this.activeDateField.set(null);
    }

    selectCabin(cabin: CabinClass): void {
        this.selectedCabin.set(cabin);
        this.showCabinDropdown.set(false);
    }

    // ── Airport suggestions ───────────────────────────────────
    openAirportSuggestions(fieldId: string, currentValue: string): void {
        this.activeSuggestionField.set(fieldId);
        this.suggestionQuery.set(currentValue || '');
        this.showPassengerDropdown.set(false);
        this.showCabinDropdown.set(false);
        this.activeDateField.set(null);
    }

    onAirportInput(fieldId: string, value: string): void {
        this.suggestionQuery.set(value);
        this.activeSuggestionField.set(fieldId);
    }

    selectAirport(airport: AirportSuggestion, segmentIndex: number, fieldType: 'origin' | 'destination'): void {
        const seg = this.segments.at(segmentIndex);
        if (fieldType === 'origin') {
            seg.patchValue({
                originIataCode: airport.iata,
                originDisplay: `${airport.city} (${airport.iata})`,
            });
        } else {
            seg.patchValue({
                destinationIataCode: airport.iata,
                destinationDisplay: `${airport.city} (${airport.iata})`,
            });
        }
        this.closeAirportSuggestions();
    }

    closeAirportSuggestions(): void {
        this.activeSuggestionField.set(null);
        this.suggestionQuery.set('');
    }

    getFieldId(segmentIndex: number, fieldType: 'origin' | 'destination'): string {
        return `seg_${segmentIndex}_${fieldType}`;
    }

    // ── Date picker ───────────────────────────────────────────
    openDatePicker(fieldId: string): void {
        this.activeDateField.update(v => v === fieldId ? null : fieldId);
        this.showPassengerDropdown.set(false);
        this.showCabinDropdown.set(false);
        this.closeAirportSuggestions();
    }

    closeDatePicker(): void {
        this.activeDateField.set(null);
    }

    prevMonth(): void {
        this.calendarMonth.update(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    }

    nextMonth(): void {
        this.calendarMonth.update(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    }

    isDateDisabled(date: Date): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    }

    isDateSelected(date: Date, fieldId: string): boolean {
        const val = this.getDateFieldValue(fieldId);
        if (!val) return false;

        // Manual parse to match local date object avoids timezone shifting
        const [y, m, d] = val.split('-').map(Number);
        const selected = new Date(y, m - 1, d);

        return date.toDateString() === selected.toDateString();
    }

    isToday(date: Date): boolean {
        return date.toDateString() === new Date().toDateString();
    }

    selectDate(date: Date, fieldId: string): void {
        if (this.isDateDisabled(date)) return;

        // Use local date parts to ensure consistent date selection across all timezones.
        // date.toISOString() can shift the day backward or forward based on local offset.
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const iso = `${year}-${month}-${day}`;

        this.setDateFieldValue(fieldId, iso);
        this.activeDateField.set(null);
    }

    private getDateFieldValue(fieldId: string): string {
        if (fieldId === 'returnDate') {
            return this.bookForm.get('returnDate')?.value || '';
        }
        // fieldId format: "dep_{segmentIndex}"
        const idx = parseInt(fieldId.replace('dep_', ''), 10);
        return this.segments.at(idx)?.get('departureDate')?.value || '';
    }

    private setDateFieldValue(fieldId: string, iso: string): void {
        if (fieldId === 'returnDate') {
            this.bookForm.patchValue({ returnDate: iso });
        } else {
            const idx = parseInt(fieldId.replace('dep_', ''), 10);
            this.segments.at(idx)?.patchValue({ departureDate: iso });
        }
        this.cdr.markForCheck();
    }

    formatDateDisplay(isoDate: string): string {
        if (!isoDate) return '';

        // Parse the YYYY-MM-DD string manually to avoid timezone-dependent parsing issues
        // with new Date(string). Some environments parse YYYY-MM-DD as UTC, others local.
        const [year, month, day] = isoDate.split('-').map(Number);
        const d = new Date(year, month - 1, day);

        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    // ── Close all panels ──────────────────────────────────────
    closeAllPanels(): void {
        this.showPassengerDropdown.set(false);
        this.showCabinDropdown.set(false);
        this.closeAirportSuggestions();
        this.activeDateField.set(null);
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        if (!this.elRef.nativeElement.contains(event.target as Node)) {
            this.closeAllPanels();
            this.cdr.markForCheck();
        }
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        this.closeAllPanels();
        this.cdr.markForCheck();
    }


    /**
     * Public API called by FlightSearchComponent (the parent smart page)
     * when a popular-route or destination card is clicked.
     *
     * Patches segment 0's origin and destination fields without triggering
     * a search. The user can review the pre-filled form and click search.
     *
     * IMPORTANT: This method is intentionally NOT called from inside this
     * component. It is a clean external API surface for the parent page.
     */
    patchSearchForm(patch: ISearchEnginePatch): void {
        // Ensure we're on the 'book' tab
        this.activeTab.set('book');

        // Ensure we're in OneWay or RoundTrip mode (not MultiCity for a simple patch)
        if (this.searchType() === 'MultiCity') {
            this.setSearchType('RoundTrip');
        }

        // Patch segment 0
        const seg = this.segments.at(0);
        if (!seg) return;

        seg.patchValue({
            originIataCode: patch.originIata,
            originDisplay: patch.originDisplay,
            destinationIataCode: patch.destinationIata,
            destinationDisplay: patch.destinationDisplay
        });

        // Apply cabin class if provided
        if (patch.cabinClass) {
            const cabinMatch = CABIN_CLASSES.find(c => c.value === patch.cabinClass);
            if (cabinMatch) {
                this.selectedCabin.set(cabinMatch);
            }
        }

        // Close any open panels so the user sees the patched form clearly
        this.closeAllPanels();

        // Trigger change detection since this is called from outside the component
        this.cdr.markForCheck();
    }

    // ── Tab navigation ────────────────────────────────────────
    setActiveTab(tab: ActiveTab): void {
        this.activeTab.set(tab);
        this.closeAllPanels();
        this.serverError.set(null);
    }

    // ── Validation helpers ────────────────────────────────────
    isSegmentFieldInvalid(segIndex: number, field: string): boolean {
        const ctrl = this.segments.at(segIndex)?.get(field);
        return !!(ctrl?.invalid && ctrl?.touched);
    }

    isReturnDateInvalid(): boolean {
        if (this.searchType() !== 'RoundTrip') return false;
        const dep = this.segments.at(0)?.get('departureDate')?.value;
        const ret = this.bookForm.get('returnDate')?.value;
        if (!dep || !ret) return false;
        return new Date(ret) < new Date(dep);
    }

    touchAllSegments(): void {
        this.segments.controls.forEach(seg => {
            (seg as FormGroup).markAllAsTouched();
        });
    }

    // ── Main Search Submission ────────────────────────────────
    /**
     * Builds the IFlightSearchRequestDto from form state + signals,
     * then delegates to FlightsService.searchFlights().
     * Results are passed via router state to the flight-results page.
     */
    onSearch(): void {
        this.touchAllSegments();
        this.bookForm.markAllAsTouched();

        if (!this.isFormReadyToSubmit()) {
            this.serverError.set('Please complete all required journey fields before searching.');
            return;
        }

        if (this.isReturnDateInvalid()) {
            this.serverError.set('Return date cannot be before your departure date.');
            return;
        }

        const payload = this.buildSearchPayload();
        this.isLoading.set(true);
        this.serverError.set(null);
        this.cdr.markForCheck();

        this.flightsService.searchFlights(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (results: IFlightItineraryDto[]) => {
                    this.isLoading.set(false);
                    this.cdr.markForCheck();
                    this.router.navigate(['/booking/flight-results'], {
                        state: { results, searchPayload: payload },
                    });
                },
                error: (err: any) => {
                    this.isLoading.set(false);
                    this.serverError.set(this.parseSearchError(err));
                    this.cdr.markForCheck();
                },
            });
        this.bookingStore.searchFlights(payload);
        this.router.navigate(['/booking/flight-results']);

    }

    private isFormReadyToSubmit(): boolean {
        const segmentsValid = this.segments.controls.every(seg => {
            const s = seg as FormGroup;
            return (
                s.get('originIataCode')?.valid &&
                s.get('destinationIataCode')?.valid &&
                s.get('departureDate')?.valid
            );
        });

        if (!segmentsValid) return false;

        if (this.searchType() === 'RoundTrip') {
            const ret = this.bookForm.get('returnDate')?.value;
            if (!ret) return false;
        }

        return true;
    }

    private buildSearchPayload(): IFlightSearchRequestDto {
        const formSegments = this.segments.value as any[];
        const p = this.passengers();

        const segments: ISearchSegmentDto[] = formSegments.map(s => ({
            originIataCode: s.originIataCode,
            destinationIataCode: s.destinationIataCode,
            departureDate: new Date(s.departureDate).toISOString(),
        }));

        // For RoundTrip, add a synthetic return segment
        if (this.searchType() === 'RoundTrip') {
            const firstSeg = segments[0];
            const returnDate = this.bookForm.get('returnDate')?.value;
            segments.push({
                originIataCode: firstSeg.destinationIataCode,
                destinationIataCode: firstSeg.originIataCode,
                departureDate: new Date(returnDate).toISOString(),
            });
        }

        return {
            searchType: this.searchType(),
            passengers: { adults: p.adults, children: p.children, infants: p.infants },
            segments,
            cabinClassPreference: this.selectedCabin().value,
            includeFlexibleFares: this.flexibleFares(),
        };
    }

    private parseSearchError(err: any): string {
        if (err?.status === 404) return 'No flights found matching your criteria. Please try different dates or destinations.';
        if (err?.status === 400) return err?.error?.message || 'Some search criteria are invalid. Please review and try again.';
        if (err?.status === 0) return 'Connection unavailable. Please check your network and retry.';
        return err?.error?.message || 'An unexpected issue occurred. Please try again shortly.';
    }

    // ── Flight Status Submission ──────────────────────────────
    onCheckStatus(): void {
        this.statusForm.markAllAsTouched();
        if (this.statusForm.invalid) return;

        const { flightNumber, flightDate } = this.statusForm.value;
        const statusRequest: IFlightStatusRequestDto = {
            flightNumber: flightNumber.toUpperCase(),
            flightDate: new Date(flightDate).toISOString(),
        };

        this.statusLoading.set(true);
        this.statusError.set(null);
        this.statusResult.set(null);
        this.cdr.markForCheck();

        this.flightsService.getFlightStatus(statusRequest)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result: IFlightSegmentDto) => {
                    this.statusLoading.set(false);
                    this.statusResult.set(result);
                    this.cdr.markForCheck();
                },
                error: (err: any) => {
                    this.statusLoading.set(false);
                    this.statusError.set(
                        err?.status === 404
                            ? 'Flight not found. Please verify the flight number and date.'
                            : 'Unable to retrieve flight status at this time.'
                    );
                    this.cdr.markForCheck();
                },
            });
    }

    // ── Utility ───────────────────────────────────────────────
    formatDuration(minutes: number): string {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    }

    trackByIndex(_: number, __: any): number { return _; }
}