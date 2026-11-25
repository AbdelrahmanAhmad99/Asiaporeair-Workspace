
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { interval, Subscription, catchError, of } from 'rxjs';

import { OpsSurveillanceStore } from '../../store/ops-surveillance.store';
import { FidsFilterBarComponent, IFidsFilterChange } from '../../components/fids-filter-bar/fids-filter-bar.component';
import { FidsDigitalBoardComponent } from '../../components/fids-digital-board/fids-digital-board.component';
import type { FidsView } from '../../components/fids-digital-board/fids-digital-board.component';

const FIDS_POLL_MS = 60_000;

@Component({
  selector: 'aoms-fids-management-console',
  standalone: true,
  imports: [CommonModule, FidsFilterBarComponent, FidsDigitalBoardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fids-management-console.component.html',
  styleUrl: './fids-management-console.component.scss',
})
export class FidsManagementConsoleComponent implements OnInit, OnDestroy {
  protected readonly store = inject(OpsSurveillanceStore);
  private readonly router = inject(Router);

  // ── Store passthrough ─────────────────────────────────────────────────
  protected readonly displayRows = this.store.fidsDisplayRows;
  protected readonly activeView = this.store.activeFidsView;
  protected readonly fidsLoading = this.store.fidsLoading;
  protected readonly fidsError = this.store.fidsError;
  protected readonly lastRefresh = this.store.fidsLastRefreshLabel;
  protected readonly hasFidsFilter = this.store.hasFidsFilter;
  protected readonly boardingCount = this.store.boardingCount;
  protected readonly delayedCount = this.store.fidsDelayedCount;
  protected readonly airportCode = this.store.fidsAirportCode;
  protected readonly totalRows = this.store.fidsDepartures;    // for header count

  // ── Polling ───────────────────────────────────────────────────────────
  private _pollSub: Subscription | null = null;
  protected readonly isPolling = signal<boolean>(false);

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.store.clearFidsError();
    this.store.loadFidsData({ airportCode: this.airportCode() });
    this._startPolling();
  }

  ngOnDestroy(): void {
    this._stopPolling();
    this.store.clearFidsFilters();
    this.store.clearFidsError();
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected goToLiveMonitor(): void {
    this.router.navigate(['aoms/flight-operations/ops-surveillance/live-monitor']);
  }

  // ── Polling ───────────────────────────────────────────────────────────

  private _startPolling(): void {
    if (this._pollSub) return;
    this.isPolling.set(true);
    this._pollSub = interval(FIDS_POLL_MS).subscribe(() => {
      this.store.loadFidsData({ silent: true });
    });
  }

  private _stopPolling(): void {
    this._pollSub?.unsubscribe();
    this._pollSub = null;
    this.isPolling.set(false);
  }

  // ── Filter events ─────────────────────────────────────────────────────

  protected onViewToggle(view: FidsView): void {
    this.store.toggleFidsView(view as 'DEPARTURES' | 'ARRIVALS');
  }

  protected onFilterChange(change: IFidsFilterChange): void {
    this.store.updateFidsFilters(change);
  }

  protected onClearFilters(): void {
    this.store.clearFidsFilters();
  }

  protected onAirportChange(code: string): void {
    this.store.setFidsAirport(code);
    this.store.loadFidsData({ airportCode: code });
  }

  protected onManualRefresh(): void {
    this.store.loadFidsData({ airportCode: this.airportCode() });
  }

  protected dismissError(): void {
    this.store.clearFidsError();
  }
}