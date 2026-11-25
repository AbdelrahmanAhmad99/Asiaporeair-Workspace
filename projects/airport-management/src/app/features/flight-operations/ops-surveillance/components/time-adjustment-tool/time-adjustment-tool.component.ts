
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { IFlightInstanceDto, IUpdateFlightTimesDto } from '@shared-core';

function _toDatetimeLocal(val: string | Date | undefined): string {
  if (!val) return '';
  const d = typeof val === 'string' ? new Date(val) : val;
  if (isNaN(d.getTime())) return '';
  // datetime-local requires "YYYY-MM-DDTHH:MM" format
  return d.toISOString().slice(0, 16);
}

@Component({
  selector: 'aoms-time-adjustment-tool',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './time-adjustment-tool.component.html',
  styleUrl: './time-adjustment-tool.component.scss',
})
export class TimeAdjustmentToolComponent implements OnInit {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly flight = input.required<IFlightInstanceDto>();
  readonly isUpdating = input<boolean>(false);
  readonly apiError = input<string | null>(null);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly onSave = output<IUpdateFlightTimesDto>();
  readonly onDismiss = output<void>();

  // ── Form ──────────────────────────────────────────────────────────────
  readonly form: FormGroup;

  protected readonly isTerminal = computed<boolean>(() => {
    const s = this.flight()?.status?.toUpperCase() ?? '';
    return s === 'ARRIVED' || s === 'CANCELLED';
  });

  protected readonly departureDelayWarning = computed<string>(() => {
    const dep = this.form?.get('actualDeparture')?.value as string;
    if (!dep) return '';
    const actual = new Date(dep).getTime();
    const scheduled = new Date(this.flight().scheduledDeparture).getTime();
    const diffMins = Math.round((actual - scheduled) / 60_000);
    if (diffMins > 0)
      return `Departure is ${diffMins} min${diffMins !== 1 ? 's' : ''} behind schedule.`;
    if (diffMins < 0)
      return `Departure is ${Math.abs(diffMins)} min${Math.abs(diffMins) !== 1 ? 's' : ''} ahead of schedule.`;
    return '';
  });

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      actualDeparture: [''],
      actualArrival: [''],
    });
  }

  ngOnInit(): void {
    // Pre-populate with existing actual times if available
    this.form.patchValue({
      actualDeparture: _toDatetimeLocal(this.flight().actualDeparture),
      actualArrival: _toDatetimeLocal(this.flight().actualArrival),
    }, { emitEvent: false });

    if (this.isTerminal()) {
      this.form.disable();
    }
  }

  protected submit(): void {
    if (this.isTerminal() || this.isUpdating()) return;

    const v = this.form.value as { actualDeparture: string; actualArrival: string };

    const payload: IUpdateFlightTimesDto = {};
    if (v.actualDeparture) payload.actualDeparture = new Date(v.actualDeparture).toISOString();
    if (v.actualArrival) payload.actualArrival = new Date(v.actualArrival).toISOString();

    // Require at least one time to be set
    if (!payload.actualDeparture && !payload.actualArrival) return;

    this.onSave.emit(payload);
  }
}