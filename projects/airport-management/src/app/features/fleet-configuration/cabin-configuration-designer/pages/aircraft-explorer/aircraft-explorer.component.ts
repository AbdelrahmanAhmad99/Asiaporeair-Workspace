
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CabinDesignerStore, ILopaFleetFilters } from '../../store/cabin-designer.store';
import { LopaFleetKpiBarComponent } from '../../components/lopa-fleet-kpi-bar/lopa-fleet-kpi-bar.component';
import { AircraftLopaGridComponent } from '../../components/aircraft-lopa-grid/aircraft-lopa-grid.component';

// AIRCRAFT_STATUS constants for the filter dropdown
const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Operational' },
  { value: 'MAINTENANCE', label: 'Under Maintenance' },
  { value: 'GROUNDED', label: 'Grounded' },
  { value: 'AOG', label: 'AOG — Critical' },
  { value: 'RESERVE', label: 'Reserve' },
];

@Component({
  selector: 'aoms-aircraft-explorer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LopaFleetKpiBarComponent,
    AircraftLopaGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aircraft-explorer.component.html',
  styleUrl: './aircraft-explorer.component.scss',
})
export class AircraftExplorerComponent implements OnInit, OnDestroy {
  protected readonly store = inject(CabinDesignerStore);
  private readonly router = inject(Router);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  protected readonly statusOptions = STATUS_OPTIONS;

  // Local two-way bound search fields (fed into store on submit)
  protected tailQuery = '';
  protected statusQuery = '';

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.loadFleet();
  }

  ngOnDestroy(): void {
    this.store.resetFilters();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Search & Filter ────────────────────────────────────────────────────
  protected onApplyFilters(): void {
    this.store.updateFilters({
      status: this.statusQuery,
    });
  }

  protected onResetFilters(): void {
    this.tailQuery = '';
    this.statusQuery = '';
    this.store.resetFilters();
  }

  // ── Pagination ─────────────────────────────────────────────────────────
  protected onPageChanged(page: number): void { this.store.goToPage(page); }
  protected onNextPage(): void { this.store.nextPage(); }
  protected onPrevPage(): void { this.store.prevPage(); }

  // ── LOPA Navigation ────────────────────────────────────────────────────
  protected onManageLopa(tailNumber: string): void {
    this.store.selectAircraftForLOPA(tailNumber);
  }
}