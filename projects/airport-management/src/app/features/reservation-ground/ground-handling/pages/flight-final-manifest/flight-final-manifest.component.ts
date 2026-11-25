

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { GroundHandlingStore, INoShowPassenger } from '../../store/ground-handling.store';
import { PassengerDiscrepancyCardComponent } from '../../components/passenger-discrepancy-card/passenger-discrepancy-card.component';
import { ManifestExportButtonComponent, ExportFormat } from '../../components/manifest-export-button/manifest-export-button.component';
import { ManifestComparisonTableComponent } from '../../components/manifest-comparison-table/manifest-comparison-table.component';

@Component({
  selector: 'aoms-flight-final-manifest',
  standalone: true,
  imports: [
    CommonModule,
    PassengerDiscrepancyCardComponent,
    ManifestExportButtonComponent,
    ManifestComparisonTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './flight-final-manifest.component.html',
  styleUrl: './flight-final-manifest.component.scss',
})
export class FlightFinalManifestComponent implements OnInit, OnDestroy {
  protected readonly store = inject(GroundHandlingStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

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
      this.store.loadFinalManifest(this.flightId);
    }
  }

  ngOnDestroy(): void {
    this.store.teardownFinalManifest();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected goToGateTerminal(): void {
    this.router.navigate([
      '/aoms/reservation-ground/ground-handling/gate-terminal',
      this.flightId,
    ]);
  }

  protected goToGroundHandling(): void {
    this.router.navigate(['/aoms/reservation-ground/ground-handling']);
  }

  // ── Export ─────────────────────────────────────────────────────────────
  protected onExportRequested(format: ExportFormat): void {
    this.store.exportOfficialManifest(format);
  }

  // ── Discrepancy locate ─────────────────────────────────────────────────
  protected onLocatePassenger(passenger: INoShowPassenger): void {
    // Navigate to Passenger Master Index filtered by this passenger's ID
    this.router.navigate(
      ['/aoms/reservation-ground/booking-center/passenger-index'],
      { queryParams: { passengerId: passenger.passengerId } }
    );
  }

  // ── Retry ──────────────────────────────────────────────────────────────
  protected onRetry(): void {
    if (this.flightId) this.store.loadFinalManifest(this.flightId);
  }

  // ── Dismiss export toast ───────────────────────────────────────────────
  protected onDismissExportToast(): void {
    this.store.clearManifestExportState();
  }
}