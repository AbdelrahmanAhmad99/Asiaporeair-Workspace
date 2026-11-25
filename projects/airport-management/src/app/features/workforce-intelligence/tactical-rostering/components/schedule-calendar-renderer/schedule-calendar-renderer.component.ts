

import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DutyEventStripComponent, IScheduleDutyEvent } from '../duty-event-strip/duty-event-strip.component';

export type CalendarView = 'monthly' | 'weekly';

export interface ICalendarDay {
  date: Date;
  iso: string;         // YYYY-MM-DD
  dayNum: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  events: IScheduleDutyEvent[];
}

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

@Component({
  selector: 'aoms-schedule-calendar-renderer',
  standalone: true,
  imports: [CommonModule, DutyEventStripComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedule-calendar-renderer.component.html',
  styleUrl: './schedule-calendar-renderer.component.scss',
})
export class ScheduleCalendarRendererComponent {
  readonly view = input.required<CalendarView>();
  readonly rangeStart = input.required<Date>();
  readonly rangeEnd = input.required<Date>();
  readonly eventsByDate = input.required<Map<string, IScheduleDutyEvent[]>>();
  readonly loading = input<boolean>(false);

  readonly eventClicked = output<IScheduleDutyEvent>();

  protected readonly dowLabels = DOW_LABELS;
  protected readonly today = new Date().toISOString().slice(0, 10);

  // Build the monthly calendar grid (up to 6 rows × 7 cols)
  protected readonly monthDays = computed<ICalendarDay[][]>(() => {
    if (this.view() !== 'monthly') return [];
    const start = this.rangeStart();
    const evMap = this.eventsByDate();
    const today = this.today;
    const curMonth = start.getMonth();

    // First cell = first day of month aligned to Sunday
    const firstCell = new Date(start);
    firstCell.setDate(1);
    firstCell.setDate(firstCell.getDate() - firstCell.getDay());

    const rows: ICalendarDay[][] = [];
    const cur = new Date(firstCell);

    for (let w = 0; w < 6; w++) {
      const row: ICalendarDay[] = [];
      for (let d = 0; d < 7; d++) {
        const iso = cur.toISOString().slice(0, 10);
        row.push({
          date: new Date(cur),
          iso,
          dayNum: cur.getDate(),
          isToday: iso === today,
          isCurrentMonth: cur.getMonth() === curMonth,
          isWeekend: cur.getDay() === 0 || cur.getDay() === 6,
          events: evMap.get(iso) ?? [],
        });
        cur.setDate(cur.getDate() + 1);
      }
      rows.push(row);
      // Stop at 5 weeks if the month ends before week 6
      if (w >= 4 && cur.getMonth() !== curMonth) break;
    }
    return rows;
  });

  // Build the weekly view (7 × 1 cells, events stacked per day)
  protected readonly weekDays = computed<ICalendarDay[]>(() => {
    if (this.view() !== 'weekly') return [];
    const start = this.rangeStart();
    const evMap = this.eventsByDate();
    const today = this.today;
    const days: ICalendarDay[] = [];
    const cur = new Date(start);

    for (let d = 0; d < 7; d++) {
      const iso = cur.toISOString().slice(0, 10);
      days.push({
        date: new Date(cur),
        iso,
        dayNum: cur.getDate(),
        isToday: iso === today,
        isCurrentMonth: true,
        isWeekend: cur.getDay() === 0 || cur.getDay() === 6,
        events: evMap.get(iso) ?? [],
      });
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  });

  protected readonly shimmerRows = Array(5).fill(null);
  protected readonly shimmerCols = Array(7).fill(null);

  protected trackByIso(_: number, d: ICalendarDay): string { return d.iso; }
  protected trackByEvent(_: number, e: IScheduleDutyEvent): number { return e.raw.eventId; }
}