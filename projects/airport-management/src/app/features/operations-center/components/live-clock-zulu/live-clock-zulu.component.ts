import { ChangeDetectionStrategy, Component, computed, input, untracked } from '@angular/core';

import { DEFAULT_HUB_TIME_ZONE, HubTimeZone } from '../../models/command-bar.models';
import { EpochMillis } from '../../models/operations-center.models';
import { formatZuluClock, formatZuluDate } from '../../store/operations-center.store';

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;


@Component({
  selector: 'aoms-live-clock-zulu',
  templateUrl: './live-clock-zulu.component.html',
  styleUrl: './live-clock-zulu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveClockZuluComponent {
  /** UTC epoch ms, whole-second resolution (from the store). */
  readonly epochMs = input.required<EpochMillis>();
  readonly hubTimeZone = input<HubTimeZone>(DEFAULT_HUB_TIME_ZONE);

  // ── Zulu ───────────────────────────────────────────────────────────────────
  protected readonly zuluDigits = computed(() => formatZuluClock(this.epochMs()).slice(0, -1));
  protected readonly zuluIso = computed(() => new Date(this.epochMs()).toISOString());

  private readonly dayBucket = computed(() => Math.floor(this.epochMs() / MS_PER_DAY));
  protected readonly zuluDate = computed(() => formatZuluDate(this.dayBucket() * MS_PER_DAY));

  // ── Local hub time ─────────────────────────────────────────────────────────
  /** Formatter is rebuilt only when the hub changes. Invalid zones fall back to UTC. */
  private readonly localFormatter = computed(() => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    };
    try {
      return new Intl.DateTimeFormat('en-GB', { ...options, timeZone: this.hubTimeZone().ianaTimeZone });
    } catch {
      return new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' });
    }
  });

  protected readonly localDigits = computed(() => this.localFormatter().format(this.epochMs()));

  private readonly hourBucket = computed(() => Math.floor(this.epochMs() / MS_PER_HOUR));

  /** `UTC+8`. Recomputed hourly (DST-safe), not every second. */
  protected readonly offsetLabel = computed(() => {
    this.hourBucket();
    const epoch = untracked(this.epochMs);
    try {
      const part = new Intl.DateTimeFormat('en-GB', {
        timeZone: this.hubTimeZone().ianaTimeZone,
        timeZoneName: 'shortOffset',
      })
        .formatToParts(epoch)
        .find((p) => p.type === 'timeZoneName');
      const raw = part?.value ?? 'GMT';
      return raw === 'GMT' ? 'UTC' : raw.replace('GMT', 'UTC');
    } catch {
      return 'UTC';
    }
  });

  // ── Seconds hairline ───────────────────────────────────────────────────────
  private readonly secondOfMinute = computed(() => Math.floor((this.epochMs() % MS_PER_MINUTE) / 1_000));
  protected readonly isMinuteReset = computed(() => this.secondOfMinute() === 0);
  protected readonly progressTransform = computed(() => `scaleX(${this.secondOfMinute() / 60})`);
}