

import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'aoms-flight-hours-logger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './flight-hours-logger.component.html',
  styleUrl: './flight-hours-logger.component.scss',
})
export class FlightHoursLoggerComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly isProcessing = input<boolean>(false);
  readonly currentTotal = input<number | undefined>(undefined);

  // ── Output ──────────────────────────────────────────────────────────────
  readonly hoursLogged = output<number>();

  // ── Local State ──────────────────────────────────────────────────────────
  protected readonly hours = signal<string>('');
  protected readonly MAX_HOURS = 999.9;
  protected readonly STEP_OPTIONS = [0.5, 1, 5, 10] as const;

  protected readonly parsedHours = computed(() => parseFloat(this.hours()));

  protected readonly isValid = computed(() => {
    const v = this.parsedHours();
    return !isNaN(v) && v > 0 && v <= this.MAX_HOURS;
  });

  protected readonly validationMessage = computed(() => {
    const raw = this.hours().trim();
    if (!raw) return null;
    const v = parseFloat(raw);
    if (isNaN(v)) return 'Enter a valid numeric value.';
    if (v <= 0) return 'Hours must be greater than zero.';
    if (v > this.MAX_HOURS) return `Maximum entry per log is ${this.MAX_HOURS} hours.`;
    return null;
  });

  protected addStep(step: number): void {
    const current = this.parsedHours();
    const next = isNaN(current) ? step : Math.min(+(current + step).toFixed(1), this.MAX_HOURS);
    this.hours.set(next.toString());
  }

  protected onSubmit(): void {
    if (!this.isValid() || this.isProcessing()) return;
    this.hoursLogged.emit(this.parsedHours());
    this.hours.set('');
  }
}