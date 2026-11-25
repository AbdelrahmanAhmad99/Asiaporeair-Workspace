
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
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
import { IFlightInstanceDto } from '@shared-core';

export interface ICancellationPayload {
  reason: string;
  notes: string;
}

export const CANCELLATION_REASONS = [
  { value: 'MECHANICAL', label: 'Mechanical / Technical Fault' },
  { value: 'WEATHER', label: 'Adverse Weather Conditions' },
  { value: 'ATC_RESTRICTION', label: 'ATC Restriction / Slot Denial' },
  { value: 'CREW_UNAVAILABILITY', label: 'Crew Unavailability' },
  { value: 'AIRPORT_CLOSURE', label: 'Airport Closure' },
  { value: 'COMMERCIAL', label: 'Commercial Decision (Low Load)' },
  { value: 'SECURITY', label: 'Security Incident' },
  { value: 'MEDICAL_EMERGENCY', label: 'Medical Emergency On Board' },
  { value: 'OPERATIONAL', label: 'General Operational Decision' },
];

@Component({
  selector: 'aoms-flight-cancellation-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './flight-cancellation-dialog.component.html',
  styleUrl: './flight-cancellation-dialog.component.scss',
})
export class FlightCancellationDialogComponent implements OnInit {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly instance = input.required<IFlightInstanceDto>();
  readonly isProcessing = input<boolean>(false);
  readonly apiError = input<string | null>(null);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly onConfirm = output<ICancellationPayload>();
  readonly onDismiss = output<void>();

  // ── Form ───────────────────────────────────────────────────────────────
  readonly form: FormGroup;
  protected readonly reasons = CANCELLATION_REASONS;
  protected charCount = 0;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      reason: ['', Validators.required],
      notes: ['', Validators.maxLength(500)],
    });
  }

  ngOnInit(): void {
    this.form.get('notes')?.valueChanges.subscribe(v => {
      this.charCount = (v ?? '').length;
    });
  }

  protected isInvalid(name: string): boolean {
    const c: AbstractControl | null = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { reason, notes } = this.form.value as { reason: string; notes: string };
    this.onConfirm.emit({ reason, notes: notes ?? '' });
  }
}