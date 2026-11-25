// AOMS Footer — System Version, Server Status, Airport Time

import {
  Component,
  ChangeDetectionStrategy,
  signal,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutStore } from '../../store/layout.store';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit, OnDestroy {
  protected readonly store = inject(LayoutStore);

  /** System version identifier */
  protected readonly systemVersion = signal<string>('v2.1.0');

  /** Server operational status */
  protected readonly serverStatus = signal<'operational' | 'degraded' | 'down'>('operational');

  /** Live formatted time (updated every second) */
  protected readonly currentTime = signal<string>('');

  /** Timezone label */
  protected readonly timezone = signal<string>('SGT');

  private clockInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.updateTime();
    this.clockInterval = setInterval(() => this.updateTime(), 1000);
  }

  ngOnDestroy(): void {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  private updateTime(): void {
    const now = new Date();
    // Singapore Time (UTC+8)
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Singapore',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    this.currentTime.set(now.toLocaleTimeString('en-GB', options));
  }

  protected get statusLabel(): string {
    switch (this.serverStatus()) {
      case 'operational': return 'Operational';
      case 'degraded': return 'Degraded';
      case 'down': return 'Offline';
    }
  }

  protected get statusClass(): string {
    return `footer__status-dot--${this.serverStatus()}`;
  }
}
