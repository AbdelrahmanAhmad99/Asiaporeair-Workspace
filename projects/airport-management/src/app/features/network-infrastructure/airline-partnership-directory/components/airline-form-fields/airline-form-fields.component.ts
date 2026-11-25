
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
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
import { IAirportDto, ICreateAirlineDto, IUpdateAirlineDto } from '@shared-core';
import { OPERATING_REGIONS } from '../../store/airlines.store';

// ── Custom validators ─────────────────────────────────────────────────────

function uppercaseLetters(length: number) {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const v: string = ctrl.value ?? '';
    if (!v) return null;
    if (v.length !== length) return { exactLength: { required: length, actual: v.length } };
    if (!/^[A-Z]+$/.test(v)) return { uppercaseOnly: true };
    return null;
  };
}

// ── Save payload ──────────────────────────────────────────────────────────
export type AirlineFormPayload = ICreateAirlineDto | IUpdateAirlineDto;

@Component({
  selector: 'aoms-airline-form-fields',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airline-form-fields.component.html',
  styleUrl: './airline-form-fields.component.scss',
})
export class AirlineFormFieldsComponent implements OnInit {
  // ── Signal Inputs ─────────────────────────────────────────────────────
  readonly initialData = input<ICreateAirlineDto | null>(null);
  readonly isEditMode = input<boolean>(false);
  readonly isSubmitting = input<boolean>(false);
  readonly airportOptions = input<IAirportDto[]>([]);
  readonly airportSearching = input<boolean>(false);
  readonly formError = input<string | null>(null);

  // ── Outputs ───────────────────────────────────────────────────────────
  readonly onSearchAirports = output<string>();
  readonly onSave = output<AirlineFormPayload>();
  readonly onCancel = output<void>();

  // ── Reactive form ─────────────────────────────────────────────────────
  protected readonly form: FormGroup;

  // ── Autocomplete state ─────────────────────────────────────────────────
  /** What the admin has typed into the hub search box (display value). */
  protected readonly hubSearchText = signal<string>('');
  /** True while the autocomplete dropdown is visible. */
  protected readonly hubPanelOpen = signal<boolean>(false);
  /** The confirmed IATA code — mirrors the hidden form control. */
  protected readonly selectedHubIata = signal<string | null>(null);

  protected readonly regions = OPERATING_REGIONS;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      iataCode: [
        '',
        [Validators.required, uppercaseLetters(2)],
      ],
      name: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(120)],
      ],
      callsign: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(40)],
      ],
      operatingRegion: ['', Validators.required],
      // Stores the confirmed IATA code; never shown directly to the user
      baseAirportIataCode: ['', Validators.required],
    });

    // Patch form when initialData arrives (edit pre-population)
    effect(() => {
      const d = this.initialData();
      if (d) {
        this.form.patchValue({
          iataCode: d.iataCode ?? '',
          name: d.name ?? '',
          callsign: d.callsign ?? '',
          operatingRegion: d.operatingRegion ?? '',
          baseAirportIataCode: d.baseAirportIataCode ?? '',
        }, { emitEvent: false });

        // Set display text for the hub field
        this.hubSearchText.set(d.baseAirportIataCode ?? '');
        this.selectedHubIata.set(d.baseAirportIataCode ?? null);
      }
    });

    // Lock IATA in edit mode
    effect(() => {
      if (this.isEditMode()) {
        this.form.get('iataCode')?.disable();
      } else {
        this.form.get('iataCode')?.enable();
      }
    });
  }

  ngOnInit(): void {
    // Auto-uppercase IATA code
    this.form.get('iataCode')?.valueChanges.subscribe((val: string) => {
      if (!val) return;
      const upper = val.toUpperCase().slice(0, 2);
      if (upper !== val) this.form.get('iataCode')?.setValue(upper, { emitEvent: false });
    });

    // Auto-uppercase callsign
    this.form.get('callsign')?.valueChanges.subscribe((val: string) => {
      if (!val) return;
      const upper = val.toUpperCase().slice(0, 40);
      if (upper !== val) this.form.get('callsign')?.setValue(upper, { emitEvent: false });
    });
  }

  // ── Control getters ───────────────────────────────────────────────────
  get iataCtrl() { return this.form.get('iataCode')!; }
  get nameCtrl() { return this.form.get('name')!; }
  get callCtrl() { return this.form.get('callsign')!; }
  get regionCtrl() { return this.form.get('operatingRegion')!; }
  get hubCtrl() { return this.form.get('baseAirportIataCode')!; }

  protected isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  // ── Hub autocomplete handlers ─────────────────────────────────────────

  protected onHubInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.hubSearchText.set(query);

    // Clear the confirmed IATA whenever the admin edits the text
    this.selectedHubIata.set(null);
    this.hubCtrl.setValue('', { emitEvent: false });
    this.hubCtrl.markAsTouched();

    this.hubPanelOpen.set(query.length > 0);
    this.onSearchAirports.emit(query);
  }

  protected selectHub(airport: IAirportDto): void {
    this.selectedHubIata.set(airport.iataCode);
    this.hubCtrl.setValue(airport.iataCode, { emitEvent: false });
    this.hubCtrl.markAsDirty();
    // Replace display text with a clear, unambiguous identifier
    this.hubSearchText.set(`${airport.name} (${airport.iataCode})`);
    this.hubPanelOpen.set(false);
    // Emit empty query to clear the store's options list
    this.onSearchAirports.emit('');
  }

  protected onHubBlur(): void {
    // Delay to allow click on option to register first
    setTimeout(() => {
      this.hubPanelOpen.set(false);
      // If the admin blurred without confirming a valid hub, invalidate
      if (!this.selectedHubIata()) {
        this.hubCtrl.setValue('', { emitEvent: false });
        this.hubCtrl.markAsTouched();
      }
    }, 180);
  }

  protected clearHub(): void {
    this.hubSearchText.set('');
    this.selectedHubIata.set(null);
    this.hubCtrl.setValue('', { emitEvent: false });
    this.hubCtrl.markAsTouched();
    this.hubPanelOpen.set(false);
    this.onSearchAirports.emit('');
  }

  // ── Submit ────────────────────────────────────────────────────────────
  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

    if (this.isEditMode()) {
      const payload: IUpdateAirlineDto = {
        name: (raw.name as string).trim(),
        callsign: (raw.callsign as string).toUpperCase().trim(),
        operatingRegion: raw.operatingRegion as string,
        baseAirportIataCode: raw.baseAirportIataCode as string,
      };
      this.onSave.emit(payload);
    } else {
      const payload: ICreateAirlineDto = {
        iataCode: (raw.iataCode as string).toUpperCase().trim(),
        name: (raw.name as string).trim(),
        callsign: (raw.callsign as string).toUpperCase().trim(),
        operatingRegion: raw.operatingRegion as string,
        baseAirportIataCode: raw.baseAirportIataCode as string,
      };
      this.onSave.emit(payload);
    }
  }

  protected cancel(): void {
    this.onCancel.emit();
  }
}