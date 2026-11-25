
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IRouteDto } from '@shared-core';
import { IAirlineDto } from '@shared-core';
import { IAircraftDto } from '@shared-core';
import { ICreateAdHocFlightInstanceDto } from '@shared-core';

export interface IAdHocStatusOption { value: string; label: string; }

const STATUS_OPTIONS: IAdHocStatusOption[] = [
  { value: 'SCHEDULED', label: 'Scheduled — Confirmed Mission' },
  { value: 'TENTATIVE', label: 'Tentative — Pending Authorization' },
];

@Component({
  selector: 'aoms-ad-hoc-flight-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ad-hoc-flight-form.component.html',
  styleUrl: './ad-hoc-flight-form.component.scss',
})
export class AdHocFlightFormComponent implements OnInit {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly routes = input<IRouteDto[]>([]);
  readonly airlines = input<IAirlineDto[]>([]);
  readonly aircraft = input<IAircraftDto[]>([]);
  readonly isSubmitting = input<boolean>(false);
  readonly formError = input<string | null>(null);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly onSubmit = output<ICreateAdHocFlightInstanceDto>();
  readonly onCancel = output<void>();

  // ── Status options ────────────────────────────────────────────────────
  protected readonly statusOptions = STATUS_OPTIONS;

  // ── Form ──────────────────────────────────────────────────────────────
  private readonly fb = inject(FormBuilder);
  readonly form: FormGroup = this.fb.group({
    flightNo: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{2,8}$/)]],
    routeId: [null, Validators.required],
    airlineIataCode: ['', Validators.required],
    scheduledDepartureTime: ['', Validators.required],
    scheduledArrivalTime: ['', Validators.required],
    assignedAircraftTailNumber: [''],
    status: ['SCHEDULED', Validators.required],
  });

  // ── Route picker state ────────────────────────────────────────────────
  protected readonly routeSearch = signal<string>('');
  protected readonly routeOpen = signal<boolean>(false);
  protected readonly confirmedRoute = signal<IRouteDto | null>(null);

  protected readonly filteredRoutes = computed<IRouteDto[]>(() => {
    const q = this.routeSearch().toLowerCase().trim();
    if (q.length < 1) return this.routes().slice(0, 60);
    return this.routes().filter(r =>
      r.originAirportIataCode.toLowerCase().includes(q) ||
      r.destinationAirportIataCode.toLowerCase().includes(q) ||
      r.originCity.toLowerCase().includes(q) ||
      r.destinationCity.toLowerCase().includes(q) ||
      r.originAirportName.toLowerCase().includes(q) ||
      r.destinationAirportName.toLowerCase().includes(q)
    ).slice(0, 60);
  });

  // ── Airline picker state ──────────────────────────────────────────────
  protected readonly airlineSearch = signal<string>('');
  protected readonly airlineOpen = signal<boolean>(false);
  protected readonly confirmedAirline = signal<IAirlineDto | null>(null);

  protected readonly filteredAirlines = computed<IAirlineDto[]>(() => {
    const q = this.airlineSearch().toLowerCase().trim();
    if (q.length < 1) return this.airlines().slice(0, 60);
    return this.airlines().filter(a =>
      a.iataCode.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.callsign.toLowerCase().includes(q)
    ).slice(0, 60);
  });

  // ── Aircraft picker state ─────────────────────────────────────────────
  protected readonly aircraftSearch = signal<string>('');
  protected readonly aircraftOpen = signal<boolean>(false);
  protected readonly confirmedAircraft = signal<IAircraftDto | null>(null);

  protected readonly filteredAircraft = computed<IAircraftDto[]>(() => {
    const q = this.aircraftSearch().toLowerCase().trim();
    if (q.length < 1) return this.aircraft().slice(0, 60);
    return this.aircraft().filter(a =>
      a.tailNumber.toLowerCase().includes(q) ||
      (a.aircraftTypeModel?.toLowerCase().includes(q) ?? false) ||
      a.airlineIataCode.toLowerCase().includes(q)
    ).slice(0, 60);
  });

  // ── Confirmation strip ────────────────────────────────────────────────
  protected readonly routeLabel = computed<string>(() => {
    const r = this.confirmedRoute();
    return r
      ? `${r.originAirportIataCode} → ${r.destinationAirportIataCode} · ${r.distanceKm.toLocaleString()} km`
      : '';
  });

  // ── Form validity summary ─────────────────────────────────────────────
  private readonly formStatus = toSignal(this.form.statusChanges, { initialValue: 'INVALID' });

  protected readonly isFormReady = computed<boolean>(() =>
    !!(this.confirmedRoute() &&
      this.confirmedAirline() &&
      (this.formStatus() === 'VALID' || this.form.valid) &&
      !this.isSubmitting())
  );

  constructor() { }

  ngOnInit(): void { }

  // ── IATA uppercase ─────────────────────────────────────────────────────
  protected onFlightNoInput(v: string): void {
    this.form.get('flightNo')?.setValue(v.toUpperCase().slice(0, 8), { emitEvent: true });
    this.form.get('flightNo')?.markAsDirty();
  }

  // ── Route picker ──────────────────────────────────────────────────────

  protected onRouteInput(v: string): void {
    this.routeSearch.set(v);
    this.confirmedRoute.set(null);
    this.form.get('routeId')?.setValue(null);
    this.routeOpen.set(true);
  }

  protected selectRoute(route: IRouteDto): void {
    this.confirmedRoute.set(route);
    this.routeSearch.set(`${route.originAirportIataCode} → ${route.destinationAirportIataCode}`);
    this.form.get('routeId')?.setValue(route.routeId);
    this.form.get('routeId')?.markAsDirty();
    this.routeOpen.set(false);
  }

  protected onRouteBlur(): void {
    setTimeout(() => {
      this.routeOpen.set(false);
      if (!this.confirmedRoute()) {
        this.routeSearch.set('');
        this.form.get('routeId')?.setValue(null);
      }
    }, 180);
  }

  protected clearRoute(): void {
    this.confirmedRoute.set(null);
    this.routeSearch.set('');
    this.form.get('routeId')?.setValue(null);
    this.routeOpen.set(false);
  }

  // ── Airline picker ────────────────────────────────────────────────────

  protected onAirlineInput(v: string): void {
    this.airlineSearch.set(v);
    this.confirmedAirline.set(null);
    this.form.get('airlineIataCode')?.setValue('');
    this.airlineOpen.set(true);
  }

  protected selectAirline(airline: IAirlineDto): void {
    this.confirmedAirline.set(airline);
    this.airlineSearch.set(`${airline.iataCode} · ${airline.name}`);
    this.form.get('airlineIataCode')?.setValue(airline.iataCode);
    this.form.get('airlineIataCode')?.markAsDirty();
    this.airlineOpen.set(false);
  }

  protected onAirlineBlur(): void {
    setTimeout(() => {
      this.airlineOpen.set(false);
      if (!this.confirmedAirline()) {
        this.airlineSearch.set('');
        this.form.get('airlineIataCode')?.setValue('');
      }
    }, 180);
  }

  protected clearAirline(): void {
    this.confirmedAirline.set(null);
    this.airlineSearch.set('');
    this.form.get('airlineIataCode')?.setValue('');
    this.airlineOpen.set(false);
  }

  // ── Aircraft picker ───────────────────────────────────────────────────

  protected onAircraftInput(v: string): void {
    this.aircraftSearch.set(v.toUpperCase());
    this.confirmedAircraft.set(null);
    this.form.get('assignedAircraftTailNumber')?.setValue('');
    this.aircraftOpen.set(true);
  }

  protected selectAircraft(ac: IAircraftDto): void {
    this.confirmedAircraft.set(ac);
    this.aircraftSearch.set(`${ac.tailNumber}${ac.aircraftTypeModel ? ' · ' + ac.aircraftTypeModel : ''}`);
    this.form.get('assignedAircraftTailNumber')?.setValue(ac.tailNumber);
    this.form.get('assignedAircraftTailNumber')?.markAsDirty();
    this.aircraftOpen.set(false);
  }

  protected onAircraftBlur(): void {
    setTimeout(() => {
      this.aircraftOpen.set(false);
      if (!this.confirmedAircraft()) {
        this.aircraftSearch.set('');
        this.form.get('assignedAircraftTailNumber')?.setValue('');
      }
    }, 180);
  }

  protected clearAircraft(): void {
    this.confirmedAircraft.set(null);
    this.aircraftSearch.set('');
    this.form.get('assignedAircraftTailNumber')?.setValue('');
    this.aircraftOpen.set(false);
  }

  // ── Validation helpers ────────────────────────────────────────────────

  protected isInvalid(name: string): boolean {
    const c: AbstractControl | null = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  protected aircraftStatusBadge(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'Ready', MAINTENANCE: 'Maintenance', GROUNDED: 'Grounded', DELETED: 'Retired',
    };
    return map[status?.toUpperCase() ?? ''] ?? status;
  }

  // ── Submit ────────────────────────────────────────────────────────────

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.confirmedRoute() || !this.confirmedAirline()) return;

    const v = this.form.value as {
      flightNo: string;
      routeId: number;
      airlineIataCode: string;
      scheduledDepartureTime: string;
      scheduledArrivalTime: string;
      assignedAircraftTailNumber: string;
      status: string;
    };

    this.onSubmit.emit({
      flightNo: v.flightNo.trim().toUpperCase(),
      routeId: Number(v.routeId),
      airlineIataCode: v.airlineIataCode.trim().toUpperCase(),
      scheduledDeparture: v.scheduledDepartureTime,
      scheduledArrival: v.scheduledArrivalTime,
      aircraftTailNumber: v.assignedAircraftTailNumber || undefined,
      status: v.status,
    });
  }
}