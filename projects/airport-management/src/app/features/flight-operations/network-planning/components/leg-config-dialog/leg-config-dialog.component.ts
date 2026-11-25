
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
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
  Validators,
} from '@angular/forms';
import {
  IFlightLegDefDto,
  ICreateFlightLegDefDto,
  IAirportDto
} from '@shared-core';

/** Returns true if arrival (offsetDays × 1440 + HH×60 + MM) < departure */
function _isArrivalBeforeDeparture(group: AbstractControl): { arrivalBeforeDep: true } | null {
  const depOffset = Number(group.get('departureOffsetDays')?.value ?? 0);
  const arrOffset = Number(group.get('arrivalOffsetDays')?.value ?? 0);
  const depTime = group.get('departureTimeLocal')?.value as string ?? '';
  const arrTime = group.get('arrivalTimeLocal')?.value as string ?? '';

  if (!depTime || !arrTime) return null;

  const toMins = (t: string, off: number) => {
    const [h, m] = t.split(':').map(Number);
    return off * 1440 + (h ?? 0) * 60 + (m ?? 0);
  };

  return toMins(arrTime, arrOffset) <= toMins(depTime, depOffset)
    ? { arrivalBeforeDep: true }
    : null;
}

@Component({
  selector: 'aoms-leg-config-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './leg-config-dialog.component.html',
  styleUrl: './leg-config-dialog.component.scss',
})
export class LegConfigDialogComponent implements OnInit {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly editTarget = input<IFlightLegDefDto | null>(null);
  readonly airports = input<IAirportDto[]>([]);
  readonly nextSequence = input<number>(1);
  readonly isSaving = input<boolean>(false);
  readonly formError = input<string | null>(null);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly onSave = output<ICreateFlightLegDefDto>();
  readonly onDismiss = output<void>();

  // ── Mode ──────────────────────────────────────────────────────────────
  readonly isEditMode = computed<boolean>(() => this.editTarget() !== null);
  readonly dialogTitle = computed<string>(() =>
    this.isEditMode() ? `Edit Leg #${this.editTarget()!.segmentNumber}` : 'Add Flight Leg'
  );

  // ── Form ──────────────────────────────────────────────────────────────
  readonly form: FormGroup;

  protected readonly timeConflict = computed<boolean>(() => {
    return !!this.form?.hasError('arrivalBeforeDep');
  });

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      segmentNumber: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
      departureAirportIataCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}$/)]],
      arrivalAirportIataCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}$/)]],
      departureOffsetDays: [0, [Validators.required, Validators.min(0)]],
      departureTimeLocal: ['', [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
      arrivalOffsetDays: [0, [Validators.required, Validators.min(0)]],
      arrivalTimeLocal: ['', [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
    }, { validators: _isArrivalBeforeDeparture });

    // Pre-fill from editTarget if provided
    effect(() => {
      const t = this.editTarget();
      if (t) {
        this.form.patchValue({
          segmentNumber: t.segmentNumber,
          departureAirportIataCode: t.departureAirportIataCode,
          arrivalAirportIataCode: t.arrivalAirportIataCode,
          departureOffsetDays: t.departureOffsetDays,
          departureTimeLocal: t.departureTimeLocal,
          arrivalOffsetDays: t.arrivalOffsetDays,
          arrivalTimeLocal: t.arrivalTimeLocal,
        }, { emitEvent: false });
      } else {
        this.form.get('segmentNumber')?.setValue(this.nextSequence(), { emitEvent: false });
      }
    });
  }

  ngOnInit(): void { }

  // ── Uppercase IATA ────────────────────────────────────────────────────
  protected onIataInput(field: string, v: string): void {
    this.form.get(field)?.setValue(v.toUpperCase().slice(0, 4), { emitEvent: true });
    this.form.get(field)?.markAsDirty();
  }

  // ── Validation helpers ────────────────────────────────────────────────
  protected isInvalid(name: string): boolean {
    const c: AbstractControl | null = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  protected fieldError(name: string): string {
    const c = this.form.get(name);
    if (c?.hasError('required')) return 'Required.';
    if (c?.hasError('pattern')) return 'Must be 3 uppercase IATA chars.';
    if (c?.hasError('min')) return 'Must be ≥ 1.';
    if (c?.hasError('max')) return 'Must be ≤ 20.';
    return '';
  }

  // ── Submit ────────────────────────────────────────────────────────────
  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.value;

    this.onSave.emit({
      segmentNumber: Number(v.segmentNumber),
      departureAirportIataCode: v.departureAirportIataCode.trim().toUpperCase(),
      arrivalAirportIataCode: v.arrivalAirportIataCode.trim().toUpperCase(),
    });
  }
}