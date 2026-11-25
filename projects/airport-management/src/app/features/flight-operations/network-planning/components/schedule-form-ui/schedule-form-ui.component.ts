

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
  Validators,
} from '@angular/forms';
import {
  IFlightScheduleDto,
  ICreateFlightScheduleDto,
  IAirlineDto,
  IAircraftTypeDto
} from '@shared-core';

interface IDayToggle { value: number; label: string; short: string; }

const DAYS: IDayToggle[] = [
  { value: 1, label: 'Monday', short: 'Mo' },
  { value: 2, label: 'Tuesday', short: 'Tu' },
  { value: 4, label: 'Wednesday', short: 'We' },
  { value: 8, label: 'Thursday', short: 'Th' },
  { value: 16, label: 'Friday', short: 'Fr' },
  { value: 32, label: 'Saturday', short: 'Sa' },
  { value: 64, label: 'Sunday', short: 'Su' },
];

function _formatDate(d: string | Date | undefined): string {
  if (!d) return '';
  const dd = typeof d === 'string' ? d : d.toISOString();
  return dd.split('T')[0];
}

@Component({
  selector: 'aoms-schedule-form-ui',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedule-form-ui.component.html',
  styleUrl: './schedule-form-ui.component.scss',
})
export class ScheduleFormUiComponent implements OnInit {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly initialData = input<IFlightScheduleDto | null>(null);
  readonly airlines = input<IAirlineDto[]>([]);
  readonly aircraftTypes = input<IAircraftTypeDto[]>([]);
  readonly isSaving = input<boolean>(false);
  readonly formError = input<string | null>(null);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly onSave = output<ICreateFlightScheduleDto>();
  readonly onDirtyChange = output<boolean>();

  // ── Days selection ─────────────────────────────────────────────────────
  protected readonly selectedDays = signal<Set<number>>(new Set<number>([1, 2, 4, 8, 16]));
  protected readonly days = DAYS;

  // ── Form ──────────────────────────────────────────────────────────────
  readonly form: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      flightNo: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{2,8}$/)]],
      routeId: [null, [Validators.required, Validators.min(1)]],
      airlineIataCode: ['', Validators.required],
      aircraftTypeId: [null, Validators.required],
      departureTimeScheduled: ['', [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
      arrivalTimeScheduled: ['', [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
      effectiveStartDate: ['', Validators.required],
      effectiveEndDate: [''],
    });

    // Pre-populate when initialData arrives
    effect(() => {
      const d = this.initialData();
      if (d) {
        const extractTime = (iso: string) => {
          if (!iso || !iso.includes('T')) return iso; // Fallback if already HH:MM
          return iso.split('T')[1].substring(0, 5); // "2024-01-01T15:30:00" -> "15:30"
        };

        this.form.patchValue({
          flightNo: d.flightNo,
          routeId: d.routeId,
          airlineIataCode: d.airlineIataCode,
          aircraftTypeId: d.aircraftTypeId,
          departureTimeScheduled: extractTime(d.departureTimeScheduled),
          arrivalTimeScheduled: extractTime(d.arrivalTimeScheduled),
          effectiveStartDate: _formatDate(d.effectiveStartDate),
          effectiveEndDate: _formatDate(d.effectiveEndDate),
        }, { emitEvent: false });

        // Parse daysOfWeek bitmask
        if (d.daysOfWeek !== undefined) {
          const selected = new Set<number>();
          DAYS.forEach(day => {
            if ((d.daysOfWeek & day.value) === day.value) {
              selected.add(day.value);
            }
          });
          this.selectedDays.set(selected);
        }
      }
    });
  }

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => this.onDirtyChange.emit(this.form.dirty));
  }

  // ── Day toggles ───────────────────────────────────────────────────────

  protected toggleDay(v: number): void {
    const s = new Set(this.selectedDays());
    s.has(v) ? s.delete(v) : s.add(v);
    this.selectedDays.set(s);
  }

  protected isDaySelected(v: number): boolean {
    return this.selectedDays().has(v);
  }

  // ── IATA uppercase ────────────────────────────────────────────────────

  protected onFlightNoInput(v: string): void {
    this.form.get('flightNo')?.setValue(v.toUpperCase().slice(0, 8), { emitEvent: true });
    this.form.get('flightNo')?.markAsDirty();
  }

  // ── Validation helpers ────────────────────────────────────────────────

  protected isInvalid(name: string): boolean {
    const c: AbstractControl | null = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  // ── Submit ────────────────────────────────────────────────────────────

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    if (this.selectedDays().size === 0) return;

    const v = this.form.value;

    // Calculate bitmask
    const bitmask = [...this.selectedDays()].reduce((acc, curr) => acc + curr, 0);

    // Convert HH:MM + date to ISO string for backend
    const toIso = (dateStr: string, timeStr: string) => {
      if (!dateStr || !timeStr) return '';
      return `${dateStr}T${timeStr}:00.000Z`;
    };

    this.onSave.emit({
      flightNo: v.flightNo.trim().toUpperCase(),
      routeId: Number(v.routeId),
      airlineIataCode: v.airlineIataCode,
      aircraftTypeId: Number(v.aircraftTypeId),
      departureTimeScheduled: toIso(v.effectiveStartDate, v.departureTimeScheduled),
      arrivalTimeScheduled: toIso(v.effectiveStartDate, v.arrivalTimeScheduled),
      daysOfWeek: bitmask,
      effectiveStartDate: v.effectiveStartDate,
      effectiveEndDate: v.effectiveEndDate || undefined,
    });
  }

  /** Imperative submit for Smart Page header Save button. */
  triggerSubmit(): void { this.submit(); }
}