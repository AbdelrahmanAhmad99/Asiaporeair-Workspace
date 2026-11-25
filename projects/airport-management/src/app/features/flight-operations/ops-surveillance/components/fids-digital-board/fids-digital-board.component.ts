
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IFlightInstanceForFidsDto } from '@shared-core';

export type FidsView = 'DEPARTURES' | 'ARRIVALS';

interface IFidsStatusMeta {
  label: string;
  cls: string;
  flashing: boolean;
}

const STATUS_META: Record<string, IFidsStatusMeta> = {
  BOARDING: { label: 'BOARDING', cls: 'boarding', flashing: true },
  ON_TIME: { label: 'ON TIME', cls: 'ontime', flashing: false },
  SCHEDULED: { label: 'SCHEDULED', cls: 'scheduled', flashing: false },
  DELAYED: { label: 'DELAYED', cls: 'delayed', flashing: false },
  DEPARTED: { label: 'DEPARTED', cls: 'departed', flashing: false },
  ARRIVED: { label: 'ARRIVED', cls: 'arrived', flashing: false },
  CANCELLED: { label: 'CANCELLED', cls: 'cancelled', flashing: false },
  DIVERTED: { label: 'DIVERTED', cls: 'diverted', flashing: false },
};

@Component({
  selector: 'aoms-fids-digital-board',
  standalone: true,
  imports: [CommonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fids-digital-board.component.html',
  styleUrl: './fids-digital-board.component.scss',
})
export class FidsDigitalBoardComponent {
  readonly rows = input.required<IFlightInstanceForFidsDto[]>();
  readonly view = input.required<FidsView>();
  readonly loading = input<boolean>(false);

  protected readonly shimmerRows = Array(8).fill(null);

  protected readonly originDestLabel = computed<string>(() =>
    this.view() === 'DEPARTURES' ? 'DESTINATION' : 'ORIGIN'
  );

  protected readonly timeLabel = computed<string>(() =>
    this.view() === 'DEPARTURES' ? 'DEPARTURE' : 'ARRIVAL'
  );

  protected statusMeta(status: string): IFidsStatusMeta {
    return STATUS_META[status?.toUpperCase() ?? ''] ??
      { label: status?.toUpperCase() ?? '—', cls: 'unknown', flashing: false };
  }

  /**
   * Detect if actual (estimated) time differs from scheduled time.
   * Returns the delay in minutes for the delay badge display.
   */
  protected delayMinutes(sched: string | undefined, est: string | undefined): number {
    if (!sched || !est) return 0;
    const s = new Date(sched).getTime();
    const e = new Date(est).getTime();
    return isNaN(s) || isNaN(e) ? 0 : Math.round((e - s) / 60_000);
  }

  protected trackByFlight(_: number, f: IFlightInstanceForFidsDto): string {
    return f.flightNo;
  }
}