
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpsFlightStatus, VALID_TRANSITIONS } from '../../store/ops-surveillance.store';

interface IStatusOption {
  value: OpsFlightStatus;
  label: string;
  icon: string; // Now holds SVG path data
  colorCls: string;
}

const SVGS = {
  SCHEDULED: 'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z',
  DELAYED: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  BOARDING: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4',
  DEPARTED: 'M6 12 3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5',
  IN_FLIGHT: 'M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.63 8.41m5.96 5.96a14.96 14.96 0 0 1-10.58 4.39L2 21l.88-3.01a14.96 14.96 0 0 1 4.39-10.58m5.96 5.96 1.25-1.25',
  ARRIVED: 'M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3',
  CANCELLED: 'm9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  DIVERTED: 'M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 0 0 0 12h3',
};

const ALL_STATUS_OPTIONS: IStatusOption[] = [
  { value: 'SCHEDULED', label: 'Scheduled', icon: SVGS.SCHEDULED, colorCls: 'status--scheduled' },
  { value: 'DELAYED', label: 'Delayed', icon: SVGS.DELAYED, colorCls: 'status--delayed' },
  { value: 'BOARDING', label: 'Boarding', icon: SVGS.BOARDING, colorCls: 'status--boarding' },
  { value: 'DEPARTED', label: 'Departed', icon: SVGS.DEPARTED, colorCls: 'status--departed' },
  { value: 'IN_FLIGHT', label: 'In Flight', icon: SVGS.IN_FLIGHT, colorCls: 'status--inflight' },
  { value: 'ARRIVED', label: 'Arrived', icon: SVGS.ARRIVED, colorCls: 'status--arrived' },
  { value: 'CANCELLED', label: 'Cancelled', icon: SVGS.CANCELLED, colorCls: 'status--cancelled' },
  { value: 'DIVERTED', label: 'Diverted', icon: SVGS.DIVERTED, colorCls: 'status--diverted' },
];

export interface IStatusChangePayload {
  status: OpsFlightStatus;
  reason?: string;
}

// ── Component ─────────────────────────────────────────────────────────────

@Component({
  selector: 'aoms-status-update-dropdown',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-update-dropdown.component.html',
  styleUrl: './status-update-dropdown.component.scss',
})
export class StatusUpdateDropdownComponent {
  readonly currentStatus = input.required<string>();
  readonly validTransitions = input<OpsFlightStatus[]>([]);
  readonly isUpdating = input<boolean>(false);

  readonly onStatusChange = output<IStatusChangePayload>();

  protected readonly isOpen = signal<boolean>(false);

  protected readonly currentOption = computed<IStatusOption | undefined>(() =>
    ALL_STATUS_OPTIONS.find(o => o.value === this.currentStatus()?.toUpperCase())
  );

  protected readonly availableOptions = computed<IStatusOption[]>(() => {
    const valid = this.validTransitions();
    return ALL_STATUS_OPTIONS.filter(o => valid.includes(o.value));
  });

  protected readonly isTerminal = computed<boolean>(() => {
    const valid = VALID_TRANSITIONS[this.currentStatus()?.toUpperCase() ?? ''];
    return !!valid && valid.length === 0;
  });

  protected toggleMenu(): void {
    if (this.isUpdating() || this.isTerminal()) return;
    this.isOpen.update(v => !v);
  }

  protected selectStatus(option: IStatusOption): void {
    this.isOpen.set(false);
    this.onStatusChange.emit({ status: option.value });
  }

  protected closeMenu(): void {
    setTimeout(() => this.isOpen.set(false), 180);
  }
}