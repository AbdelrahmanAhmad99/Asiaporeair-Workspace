

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { TacticalTrcStore } from '../../store/tactical-trc.store';
import { ScheduleCalendarRendererComponent } from '../../components/schedule-calendar-renderer/schedule-calendar-renderer.component';
import {
  DutyEventStripComponent,
  IScheduleDutyEvent
} from '../../components/duty-event-strip/duty-event-strip.component';
import { CalendarView } from '../../components/schedule-calendar-renderer/schedule-calendar-renderer.component';

const TRC_BASE = 'aoms/workforce-intelligence/tactical-rostering';
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Component({
  selector: 'aoms-personal-duty-visualizer',
  standalone: true,
  imports: [
    CommonModule,
    ScheduleCalendarRendererComponent,
    DutyEventStripComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './personal-duty-visualizer.component.html',
  styleUrl: './personal-duty-visualizer.component.scss',
})
export class PersonalDutyVisualizerComponent implements OnInit, OnDestroy {
  protected readonly store = inject(TacticalTrcStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected memberId = 0;

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // Selected event for the detail drawer
  protected readonly selectedEvent = signal<IScheduleDutyEvent | null>(null);

  // KPI summary data
  protected readonly kpiFlights = computed(() => this.store.flightEvents().length);
  protected readonly kpiDutyHrs = computed(() => this.store.totalDutyHours());
  protected readonly kpiEvents = computed(() => this.store.activeSchedule().length);

  // Period label
  protected readonly periodLabel = computed(() => {
    const r = this.store.scheduleDateRange();
    const v = this.store.calendarView();
    const s = r.start;
    if (v === 'monthly') return `${MONTH_NAMES[s.getMonth()]} ${s.getFullYear()}`;
    const e = r.end;
    const sameMon = s.getMonth() === e.getMonth();
    if (sameMon) return `${s.getDate()}–${e.getDate()} ${MONTH_NAMES[s.getMonth()]} ${s.getFullYear()}`;
    return `${s.getDate()} ${MONTH_NAMES[s.getMonth()]} – ${e.getDate()} ${MONTH_NAMES[e.getMonth()]} ${e.getFullYear()}`;
  });

  ngOnInit(): void {
    this.memberId = parseInt(this.route.snapshot.paramMap.get('id') ?? '0', 10);
    if (!this.memberId) {
      this.router.navigate([TRC_BASE, 'roster-planner']);
      return;
    }
    // Initialise with current month
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.store.loadSchedule(this.memberId, { start, end });
  }

  ngOnDestroy(): void {
    this.store.clearSchedule();
  }

  // ── Navigation ──────────────────────────────────────────────────────
  protected goToRosterPlanner(): void {
    this.router.navigate([TRC_BASE, 'roster-planner']);
  }

  protected goToAvailabilityExplorer(): void {
    this.router.navigate([TRC_BASE, 'availability-explorer']);
  }

  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Calendar controls ────────────────────────────────────────────────
  protected onViewChange(v: CalendarView): void {
    this.store.setCalendarView(v);
  }

  protected onPrevPeriod(): void {
    this.store.navigatePeriodBack();
  }

  protected onNextPeriod(): void {
    this.store.navigatePeriodForward();
  }

  protected onToday(): void {
    this.store.navigateToToday();
  }

  protected onRetrySync(): void {
    if (this.memberId) {
      this.store.loadSchedule(this.memberId, this.store.scheduleDateRange());
    }
  }

  // ── Event interaction ─────────────────────────────────────────────────
  protected onEventClicked(ev: IScheduleDutyEvent): void {
    this.selectedEvent.set(ev);
  }

  protected closeEventDetail(): void {
    this.selectedEvent.set(null);
  }
}