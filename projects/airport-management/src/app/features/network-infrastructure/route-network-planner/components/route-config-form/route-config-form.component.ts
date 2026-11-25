

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { IAirportDto, ICreateRouteDto } from '@shared-core';

export interface IRouteSavePayload {
  originAirportIataCode: string;
  destinationAirportIataCode: string;
  distanceKm: number;
}

// ── Custom Validators ─────────────────────────────────────────────────────

function iataFormat(ctrl: AbstractControl): ValidationErrors | null {
  const v: string = ctrl.value ?? '';
  if (!v) return null;
  return /^[A-Z]{3,4}$/.test(v) ? null : { invalidIata: true };
}

function noSameEndpoints(group: AbstractControl): ValidationErrors | null {
  const origin = group.get('originAirportIataCode')?.value;
  const dest = group.get('destinationAirportIataCode')?.value;
  if (origin && dest && origin === dest) return { sameEndpoints: true };
  return null;
}

@Component({
  selector: 'aoms-route-config-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './route-config-form.component.html',
  styleUrl: './route-config-form.component.scss',
})
export class RouteConfigFormComponent implements OnInit {
  // ── Signal Inputs ─────────────────────────────────────────────────────
  readonly airports = input<IAirportDto[]>([]);
  readonly initialData = input<ICreateRouteDto | null>(null);
  readonly isEditMode = input<boolean>(false);
  readonly isSaving = input<boolean>(false);
  readonly composerError = input<string | null>(null);
  readonly airportsLoading = input<boolean>(false);

  // ── Outputs ───────────────────────────────────────────────────────────
  readonly onSave = output<IRouteSavePayload>();
  readonly onCancel = output<void>();
  readonly onDirtyChange = output<boolean>();

  // ── Form ──────────────────────────────────────────────────────────────
  protected readonly form: FormGroup;

  // ── Origin autocomplete ───────────────────────────────────────────────
  protected readonly originSearch = signal<string>('');
  protected readonly originPanelOpen = signal<boolean>(false);
  protected readonly originConfirmed = signal<IAirportDto | null>(null);

  // ── Destination autocomplete ──────────────────────────────────────────
  protected readonly destSearch = signal<string>('');
  protected readonly destPanelOpen = signal<boolean>(false);
  protected readonly destConfirmed = signal<IAirportDto | null>(null);

  // ── Airport filter logic ──────────────────────────────────────────────
  protected readonly filteredOrigin = computed<IAirportDto[]>(() => {
    const q = this.originSearch().toLowerCase().trim();
    if (q.length < 1) return this.airports().slice(0, 40);
    return this.airports().filter(a =>
      a.iataCode.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q)
    ).slice(0, 40);
  });

  protected readonly filteredDest = computed<IAirportDto[]>(() => {
    const q = this.destSearch().toLowerCase().trim();
    if (q.length < 1) return this.airports().slice(0, 40);
    return this.airports().filter(a =>
      a.iataCode.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q)
    ).slice(0, 40);
  });

  // ── Calculated flight time from distance ──────────────────────────────
  protected readonly estimatedTime = computed<string>(() => {
    const km = Number(this.form?.get('distanceKm')?.value ?? 0);
    if (!km || km <= 0) return '—';
    const h = Math.floor(km / 900);
    const m = Math.round(((km / 900) - h) * 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  });

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      originAirportIataCode: ['', [Validators.required, iataFormat]],
      destinationAirportIataCode: ['', [Validators.required, iataFormat]],
      distanceKm: [null, [Validators.required, Validators.min(1), Validators.max(25000)]],
    }, { validators: noSameEndpoints });

    // Pre-populate when editing an existing route
    effect(() => {
      const d = this.initialData();
      if (d) {
        this.form.patchValue({
          originAirportIataCode: d.originAirportIataCode,
          destinationAirportIataCode: d.destinationAirportIataCode,
          distanceKm: d.distanceKm,
        }, { emitEvent: false });

        // Resolve display text from airports list if available
        const airports = this.airports();
        const orig = airports.find(a => a.iataCode === d.originAirportIataCode);
        const dest = airports.find(a => a.iataCode === d.destinationAirportIataCode);

        this.originConfirmed.set(orig ?? { iataCode: d.originAirportIataCode, name: d.originAirportIataCode } as IAirportDto);
        this.originSearch.set(orig ? `${orig.name} (${orig.iataCode})` : d.originAirportIataCode);

        this.destConfirmed.set(dest ?? { iataCode: d.destinationAirportIataCode, name: d.destinationAirportIataCode } as IAirportDto);
        this.destSearch.set(dest ? `${dest.name} (${dest.iataCode})` : d.destinationAirportIataCode);
      }
    });

    // Lock endpoint fields in edit mode
    effect(() => {
      if (this.isEditMode()) {
        this.form.get('originAirportIataCode')?.disable();
        this.form.get('destinationAirportIataCode')?.disable();
      } else {
        this.form.get('originAirportIataCode')?.enable();
        this.form.get('destinationAirportIataCode')?.enable();
      }
    });
  }

  ngOnInit(): void {
    // Emit dirty state on any form value change
    this.form.valueChanges.subscribe(() => {
      this.onDirtyChange.emit(this.form.dirty);
    });
  }

  // ── Control getters ───────────────────────────────────────────────────
  get originCtrl() { return this.form.get('originAirportIataCode')!; }
  get destCtrl() { return this.form.get('destinationAirportIataCode')!; }
  get distCtrl() { return this.form.get('distanceKm')!; }

  protected isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  protected get sameEndpoints(): boolean {
    return !!(this.form.errors?.['sameEndpoints'] && this.form.touched);
  }

  // ── Origin autocomplete ───────────────────────────────────────────────

  protected onOriginInput(v: string): void {
    this.originSearch.set(v);
    this.originConfirmed.set(null);
    this.originCtrl.setValue('', { emitEvent: false });
    this.originCtrl.markAsTouched();
    this.originPanelOpen.set(true);
  }

  protected selectOrigin(airport: IAirportDto): void {
    this.originConfirmed.set(airport);
    this.originCtrl.setValue(airport.iataCode, { emitEvent: false });
    this.originCtrl.markAsDirty();
    this.originSearch.set(`${airport.name} (${airport.iataCode})`);
    this.originPanelOpen.set(false);
  }

  protected onOriginBlur(): void {
    setTimeout(() => {
      this.originPanelOpen.set(false);
      if (!this.originConfirmed()) {
        this.originCtrl.setValue('', { emitEvent: false });
        this.originCtrl.markAsTouched();
      }
    }, 180);
  }

  protected clearOrigin(): void {
    this.originConfirmed.set(null);
    this.originSearch.set('');
    this.originCtrl.setValue('', { emitEvent: false });
    this.originCtrl.markAsTouched();
  }

  // ── Destination autocomplete ──────────────────────────────────────────

  protected onDestInput(v: string): void {
    this.destSearch.set(v);
    this.destConfirmed.set(null);
    this.destCtrl.setValue('', { emitEvent: false });
    this.destCtrl.markAsTouched();
    this.destPanelOpen.set(true);
  }

  protected selectDest(airport: IAirportDto): void {
    this.destConfirmed.set(airport);
    this.destCtrl.setValue(airport.iataCode, { emitEvent: false });
    this.destCtrl.markAsDirty();
    this.destSearch.set(`${airport.name} (${airport.iataCode})`);
    this.destPanelOpen.set(false);
  }

  protected onDestBlur(): void {
    setTimeout(() => {
      this.destPanelOpen.set(false);
      if (!this.destConfirmed()) {
        this.destCtrl.setValue('', { emitEvent: false });
        this.destCtrl.markAsTouched();
      }
    }, 180);
  }

  protected clearDest(): void {
    this.destConfirmed.set(null);
    this.destSearch.set('');
    this.destCtrl.setValue('', { emitEvent: false });
    this.destCtrl.markAsTouched();
  }

  // ── Auto-calculate distance from km input ─────────────────────────────
  protected onDistanceInput(): void {
    // estimatedTime is a computed signal — no action needed, it auto-updates
  }

  // ── Submit ────────────────────────────────────────────────────────────
  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue() as {
      originAirportIataCode: string;
      destinationAirportIataCode: string;
      distanceKm: number;
    };

    this.onSave.emit({
      originAirportIataCode: raw.originAirportIataCode.trim().toUpperCase(),
      destinationAirportIataCode: raw.destinationAirportIataCode.trim().toUpperCase(),
      distanceKm: Number(raw.distanceKm),
    });
  }

  protected cancel(): void {
    this.onCancel.emit();
  }

  /** Expose for imperative submit from Smart Page header button. */
  triggerSubmit(): void {
    this.submit();
  }
}