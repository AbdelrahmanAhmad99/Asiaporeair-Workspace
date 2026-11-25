

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  effect,
  input,
  output,
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
import { ICreateAirportDto, IUpdateAirportDto } from '@shared-core';
import { ICountryDto } from '@shared-core';

// ── Custom validators ─────────────────────────────────────────────────────

function uppercaseLettersOnly(ctrl: AbstractControl): ValidationErrors | null {
  const v: string = ctrl.value ?? '';
  if (!v) return null;
  return /^[A-Z]+$/.test(v) ? null : { uppercaseOnly: true };
}

// ── Save payload union type ───────────────────────────────────────────────

export type AirportBaseFormPayload = ICreateAirportDto | IUpdateAirportDto;

@Component({
  selector: 'aoms-airport-base-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airport-base-form.component.html',
  styleUrl: './airport-base-form.component.scss',
})
export class AirportBaseFormComponent implements OnInit {
  // ── Signal Inputs ─────────────────────────────────────────────────────
  readonly initialData = input<ICreateAirportDto | null>(null);
  readonly availableCountries = input<ICountryDto[]>([]);
  readonly isLoading = input<boolean>(false);
  readonly isEditMode = input<boolean>(false);
  readonly existingIataCodes = input<Set<string>>(new Set());
  readonly saveError = input<string | null>(null);

  // ── Outputs ───────────────────────────────────────────────────────────
  readonly onSave = output<AirportBaseFormPayload>();
  readonly onCancel = output<void>();

  // ── Reactive Form ─────────────────────────────────────────────────────
  protected readonly form: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      iataCode: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(3),
          uppercaseLettersOnly,
        ],
      ],
      icaoCode: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(4),
          uppercaseLettersOnly,
        ],
      ],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
      city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      countryIsoCode: ['', [Validators.required]],
      latitude: [null as number | null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [null as number | null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      altitude: [null as number | null, [Validators.min(-500), Validators.max(9000)]],
    });

    // Patch form when initialData changes (edit mode population)
    effect(() => {
      const d = this.initialData();
      if (d) {
        this.form.patchValue({
          iataCode: d.iataCode ?? '',
          icaoCode: d.icaoCode ?? '',
          name: d.name ?? '',
          city: d.city ?? '',
          countryIsoCode: d.countryIsoCode ?? '',
          latitude: d.latitude ?? null,
          longitude: d.longitude ?? null,
          altitude: d.altitude ?? null,
        }, { emitEvent: false });
      }
    });

    // Lock IATA in edit mode
    effect(() => {
      if (this.isEditMode()) {
        this.form.get('iataCode')?.disable();
        this.form.get('icaoCode')?.disable();
      } else {
        this.form.get('iataCode')?.enable();
        this.form.get('icaoCode')?.enable();
      }
    });
  }

  ngOnInit(): void {
    this._autoUpper('iataCode', 3);
    this._autoUpper('icaoCode', 4);
  }

  // ── Control getters ───────────────────────────────────────────────────
  get iataCtrl() { return this.form.get('iataCode')!; }
  get icaoCtrl() { return this.form.get('icaoCode')!; }
  get nameCtrl() { return this.form.get('name')!; }
  get cityCtrl() { return this.form.get('city')!; }
  get countryCtrl() { return this.form.get('countryIsoCode')!; }
  get latCtrl() { return this.form.get('latitude')!; }
  get lonCtrl() { return this.form.get('longitude')!; }
  get altCtrl() { return this.form.get('altitude')!; }

  protected isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  protected isDuplicateIata(): boolean {
    if (this.isEditMode()) return false;
    const v = (this.iataCtrl.value ?? '').toUpperCase();
    return v.length === 3 && this.existingIataCodes().has(v);
  }

  // ── Submit ────────────────────────────────────────────────────────────
  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isDuplicateIata()) return;

    const raw = this.form.getRawValue();

    if (this.isEditMode()) {
      const payload: IUpdateAirportDto = {
        name: (raw.name as string).trim(),
        city: (raw.city as string).trim(),
        countryIsoCode: raw.countryIsoCode as string,
        latitude: Number(raw.latitude),
        longitude: Number(raw.longitude),
        altitude: raw.altitude !== null ? Number(raw.altitude) : undefined,
      };
      this.onSave.emit(payload);
    } else {
      const payload: ICreateAirportDto = {
        iataCode: (raw.iataCode as string).toUpperCase().trim(),
        icaoCode: (raw.icaoCode as string).toUpperCase().trim(),
        name: (raw.name as string).trim(),
        city: (raw.city as string).trim(),
        countryIsoCode: raw.countryIsoCode as string,
        latitude: Number(raw.latitude),
        longitude: Number(raw.longitude),
        altitude: raw.altitude !== null ? Number(raw.altitude) : undefined,
      };
      this.onSave.emit(payload);
    }
  }

  protected cancel(): void {
    this.onCancel.emit();
  }

  // ── Private helpers ───────────────────────────────────────────────────
  private _autoUpper(name: string, max: number): void {
    this.form.get(name)?.valueChanges.subscribe((val: string) => {
      if (!val) return;
      let next = val.toUpperCase().slice(0, max);
      if (next !== val) {
        this.form.get(name)?.setValue(next, { emitEvent: false });
      }
    });
  }
}