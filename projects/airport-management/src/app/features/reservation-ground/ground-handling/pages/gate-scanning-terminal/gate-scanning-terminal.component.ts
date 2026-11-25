
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { GroundHandlingStore, IGateSearchFilter } from '../../store/ground-handling.store';
import { BoardingStatusMonitorComponent } from '../../components/boarding-status-monitor/boarding-status-monitor.component';
import { GateFeedbackPanelComponent } from '../../components/gate-feedback-panel/gate-feedback-panel.component';
import { BoardingPassSelectorGridComponent } from '../../components/boarding-pass-selector-grid/boarding-pass-selector-grid.component';

@Component({
  selector: 'aoms-gate-scanning-terminal',
  standalone: true,
  imports: [
    CommonModule,
    BoardingStatusMonitorComponent,
    GateFeedbackPanelComponent,
    BoardingPassSelectorGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gate-scanning-terminal.component.html',
  styleUrl: './gate-scanning-terminal.component.scss',
})
export class GateScanningTerminalComponent implements OnInit, OnDestroy {
  protected readonly store = inject(GroundHandlingStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  private flightId!: number;

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('flightId');
    this.flightId = param ? parseInt(param, 10) : 0;
    if (this.flightId) {
      this.store.loadGateContext(this.flightId);
    }
  }

  ngOnDestroy(): void {
    this.store.teardown();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Event bridges ─────────────────────────────────────────────────────
  protected onPassengerSelected(passId: number): void {
    this.store.performScan(passId);
  }

  protected onFilterChanged(filter: IGateSearchFilter): void {
    this.store.updateSearchFilter(filter);
  }

  protected onFilterReset(): void {
    this.store.resetSearchFilter();
  }

  protected onScanReset(): void {
    this.store.resetScan();
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected onSwitchFlight(): void {
    this.store.navigateToSwitchFlight();
  }

  protected onViewManifest(): void {
    this.store.navigateToFinalManifest();
  }

  protected onRefresh(): void {
    this.store.refreshPasses();
  }
}