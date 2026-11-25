
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

import { AircraftTypesStore } from '../../store/aircraft-types.store';
import { RangeCalculatorInputComponent } from '../../components/range-calculator-input/range-calculator-input.component';
import { RangeSuitabilityListComponent } from '../../components/range-suitability-list/range-suitability-list.component';
import { RangeMode } from '../../store/aircraft-types.store';

const ATA_BASE = 'aoms/fleet-configuration/aircraft-type-authority';

@Component({
  selector: 'aoms-fleet-range-analyzer',
  standalone: true,
  imports: [
    CommonModule,
    RangeCalculatorInputComponent,
    RangeSuitabilityListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fleet-range-analyzer.component.html',
  styleUrl: './fleet-range-analyzer.component.scss',
})
export class FleetRangeAnalyzerComponent implements OnInit, OnDestroy {
  protected readonly store = inject(AircraftTypesStore);
  private readonly router = inject(Router);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  ngOnInit(): void {
    // Ensure the full list is loaded (needed for local suitabilityResults computation)
    if (this.store.aircraftTypes().length === 0) {
      this.store.loadActiveTypes();
    }
    // Trigger initial analysis at the default distance
    this.store.analyzeRange(this.store.analyzerState().targetDistanceKm);
  }

  ngOnDestroy(): void {
    this.store.clearAnalysis();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const html = document.documentElement;
    const next = !this.isDarkMode();
    html.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Input bridge ───────────────────────────────────────────────────────
  protected onDistanceChanged(distanceKm: number): void {
    this.store.analyzeRange(distanceKm);
  }

  protected onModeChanged(mode: RangeMode): void {
    this.store.setRangeMode(mode);
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected navigateToCatalog(): void {
    this.router.navigate([ATA_BASE]);
  }

  protected onViewSpecs(typeId: number): void {
    this.router.navigate([ATA_BASE, 'details', typeId]);
  }
}