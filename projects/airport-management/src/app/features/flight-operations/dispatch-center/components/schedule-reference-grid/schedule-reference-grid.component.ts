
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { IFlightScheduleDto } from '@shared-core';

type DayKey = 'Mo' | 'Tu' | 'We' | 'Th' | 'Fr' | 'Sa' | 'Su';

const DAY_MAP: Record<string, DayKey> = {
  '1': 'Mo', '2': 'Tu', '3': 'We', '4': 'Th', '5': 'Fr', '6': 'Sa', '7': 'Su',
};

const ALL_DAYS: DayKey[] = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

@Component({
  selector: 'aoms-schedule-reference-grid',
  standalone: true,
  imports: [CommonModule, DatePipe, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedule-reference-grid.component.html',
  styleUrl: './schedule-reference-grid.component.scss',
})
export class ScheduleReferenceGridComponent {
  readonly schedules = input.required<IFlightScheduleDto[]>();
  readonly loading = input<boolean>(false);

  protected readonly filterQuery = signal<string>('');
  protected readonly shimmerRows = Array(8).fill(null);
  protected readonly allDays = ALL_DAYS;

  protected readonly filteredSchedules = computed<IFlightScheduleDto[]>(() => {
    const q = this.filterQuery().toLowerCase().trim();
    if (!q) return this.schedules();
    return this.schedules().filter(s =>
      s.flightNo.toLowerCase().includes(q) ||
      s.originAirportIata.toLowerCase().includes(q) ||
      s.destinationAirportIata.toLowerCase().includes(q) ||
      s.airlineIataCode.toLowerCase().includes(q) ||
      s.routeName?.toLowerCase().includes(q)
    );
  });

  protected readonly activeCount = computed<number>(
    () => this.schedules().filter(s => s.isActive).length
  );

  protected readonly filteredCount = computed<number>(
    () => this.filteredSchedules().length
  );

  protected onFilterInput(v: string): void {
    this.filterQuery.set(v);
  }

  protected clearFilter(): void {
    this.filterQuery.set('');
  }

  /** Parse daysOfWeek string "1,2,3,5" or number 1235 → Set of DayKey. */
  protected activeDays(daysOfWeek: string | number | undefined | null): Set<DayKey> {
    const result = new Set<DayKey>();
    if (daysOfWeek === undefined || daysOfWeek === null) return result;

    const dStr = String(daysOfWeek);
    // Handle both comma-separated strings "1,2,3" and digit sequences "123" or 123
    const tokens = dStr.includes(',') ? dStr.split(',') : dStr.split('');

    tokens.forEach(t => {
      const key = DAY_MAP[t.trim()];
      if (key) result.add(key);
    });
    return result;
  }

  /** Approximate block time from departure/arrival strings. */
  protected blockTime(dep: string, arr: string): string {
    if (!dep || !arr) return '—';
    const [dh, dm] = dep.split(':').map(Number);
    const [ah, am] = arr.split(':').map(Number);
    let diff = (ah * 60 + am) - (dh * 60 + dm);
    if (diff < 0) diff += 1440; // crosses midnight
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  }

  protected trackById(_: number, s: IFlightScheduleDto): number {
    return s.scheduleId;
  }
}