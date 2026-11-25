
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
import { TypeAuditTableComponent } from '../../components/type-audit-table/type-audit-table.component';
import { AuditFilterMode } from '../../store/aircraft-types.store';

const ATA_BASE = 'aoms/fleet-configuration/aircraft-type-authority';

@Component({
  selector: 'aoms-type-archive-manager',
  standalone: true,
  imports: [
    CommonModule,
    TypeAuditTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './type-archive-manager.component.html',
  styleUrl: './type-archive-manager.component.scss',
})
export class TypeArchiveManagerComponent implements OnInit, OnDestroy {
  protected readonly store = inject(AircraftTypesStore);
  private readonly router = inject(Router);

  /** Tracks the theme for the dark mode toggle button. */
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.loadArchiveData();
  }

  ngOnDestroy(): void {
    this.store.clearArchiveState();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const html = document.documentElement;
    const next = !this.isDarkMode();
    html.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Filter ─────────────────────────────────────────────────────────────
  protected onFilterChange(mode: AuditFilterMode): void {
    this.store.setAuditFilter(mode);
  }

  // ── Restore ────────────────────────────────────────────────────────────
  protected async onRestoreTriggered(typeId: number): Promise<void> {
    await this.store.reactivateFromArchive(typeId);
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected navigateToCatalog(): void {
    this.router.navigate([ATA_BASE]);
  }
}