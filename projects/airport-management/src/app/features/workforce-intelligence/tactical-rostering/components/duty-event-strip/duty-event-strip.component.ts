

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type DutyEventType =
  | 'flight' | 'standby' | 'training' | 'rest'
  | 'off' | 'ground' | 'medical' | 'simulator';

export interface IScheduleDutyEvent {
  raw: {
    eventId: number;
    employeeId: number;
    type: DutyEventType;
    title: string;
    startTime: string;
    endTime: string;
    status: string;
    flightNo?: string;
    originIata?: string;
    destinationIata?: string;
    aircraftTailNo?: string;
    notes?: string;
  };
  startDate: Date;
  endDate: Date;
  durationMinutes: number;
  isMultiDay: boolean;
  spanDays: number;
}

interface IEventMeta {
  label: string;
  iconPath: string;
  colorKey: string; // CSS class suffix
  shortCode: string;
}

const EVENT_META: Record<DutyEventType, IEventMeta> = {
  flight: {
    label: 'Flight Duty',
    shortCode: 'FLT',
    iconPath: 'M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5',
    colorKey: 'flight',
  },
  standby: {
    label: 'Standby Duty',
    shortCode: 'SBY',
    iconPath: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    colorKey: 'standby',
  },
  training: {
    label: 'Training Session',
    shortCode: 'TRN',
    iconPath: 'M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 10.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5',
    colorKey: 'training',
  },
  rest: {
    label: 'Rest Period',
    shortCode: 'RST',
    iconPath: 'M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998z',
    colorKey: 'rest',
  },
  off: {
    label: 'Day Off',
    shortCode: 'OFF',
    iconPath: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',
    colorKey: 'off',
  },
  ground: {
    label: 'Ground Operations',
    shortCode: 'GND',
    iconPath: 'M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
    colorKey: 'ground',
  },
  medical: {
    label: 'Medical Check',
    shortCode: 'MED',
    iconPath: 'M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    colorKey: 'medical',
  },
  simulator: {
    label: 'Simulator Session',
    shortCode: 'SIM',
    iconPath: 'M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3',
    colorKey: 'simulator',
  },
};

@Component({
  selector: 'aoms-duty-event-strip',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './duty-event-strip.component.html',
  styleUrl: './duty-event-strip.component.scss',
})
export class DutyEventStripComponent {
  readonly event = input.required<IScheduleDutyEvent>();
  readonly compact = input<boolean>(false);   // true = weekly cell (smaller)
  readonly showTooltip = input<boolean>(true);

  readonly eventClicked = output<IScheduleDutyEvent>();

  protected readonly isTooltipVisible = signal<boolean>(false);

  protected readonly meta = computed<IEventMeta>(() =>
    EVENT_META[this.event().raw.type] ?? EVENT_META['flight']
  );

  protected readonly timeRange = computed(() => {
    const fmt = (d: Date) =>
      d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${fmt(this.event().startDate)} – ${fmt(this.event().endDate)}`;
  });

  protected readonly durationLabel = computed(() => {
    const m = this.event().durationMinutes;
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r > 0 ? `${h}h ${r}m` : `${h}h`;
  });

  protected readonly routeLabel = computed(() => {
    const e = this.event().raw;
    if (e.originIata && e.destinationIata) return `${e.originIata} → ${e.destinationIata}`;
    return null;
  });

  protected onMouseEnter(): void { if (this.showTooltip()) this.isTooltipVisible.set(true); }
  protected onMouseLeave(): void { this.isTooltipVisible.set(false); }
}