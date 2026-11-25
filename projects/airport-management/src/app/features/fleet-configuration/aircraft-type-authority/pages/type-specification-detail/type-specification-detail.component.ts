
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

import { AircraftTypesStore } from '../../store/aircraft-types.store';
import { NavigationHeaderComponent, HeaderAction }
  from '../../components/navigation-header/navigation-header.component';
import { ManufacturerBadgeComponent } from '../../components/manufacturer-badge/manufacturer-badge.component';
import { SpecDetailsPanelComponent } from '../../components/spec-details-panel/spec-details-panel.component';
import { RangeVisualizerComponent } from '../../components/range-visualizer/range-visualizer.component';

const ATA_BASE = 'aoms/fleet-configuration/aircraft-type-authority';

@Component({
  selector: 'aoms-type-specification-detail',
  standalone: true,
  imports: [
    CommonModule,
    NavigationHeaderComponent,
    ManufacturerBadgeComponent,
    SpecDetailsPanelComponent,
    RangeVisualizerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './type-specification-detail.component.html',
  styleUrl: './type-specification-detail.component.scss',
})
export class TypeSpecificationDetailComponent implements OnInit, OnDestroy {
  protected readonly store = inject(AircraftTypesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Numeric typeId extracted from the route (may be NaN if route is malformed). */
  private _typeId!: number;

  /** Tracks the current theme mode; initialised from the DOM. */
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    this._typeId = parseInt(raw ?? '', 10);

    if (isNaN(this._typeId)) {
      // Malformed route — redirect back to the catalog
      this.router.navigate([ATA_BASE]);
      return;
    }

    this.store.loadTypeDetails(this._typeId);
  }

  ngOnDestroy(): void {
    this.store.clearSelection();
  }

  // ── Dark Mode Toggle ───────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const html = document.documentElement;
    const next = !this.isDarkMode();
    html.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Toolbar Action Dispatcher ──────────────────────────────────────────
  protected onHeaderAction(action: HeaderAction): void {
    switch (action) {
      case 'back':
        this.router.navigate([ATA_BASE]);
        break;

      case 'edit':
        this.store.handleAction(this._typeId, 'edit');
        break;

      case 'archive':
        this.store.handleAction(this._typeId, 'delete');
        break;

      case 'print':
        this._printTechnicalManual();
        break;
    }
  }

  // ── Print Technical Manual ─────────────────────────────────────────────
  /**
   * Opens a print-friendly view by briefly toggling a print CSS class
   * and invoking window.print(). The component SCSS handles the @media print
   * overrides that strip the sidebar and toolbar, leaving only spec content.
   */
  private _printTechnicalManual(): void {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.add('aoms-print-mode');
      window.print();
      // Clean up after the print dialogue is closed
      window.addEventListener(
        'afterprint',
        () => document.documentElement.classList.remove('aoms-print-mode'),
        { once: true }
      );
    }
  }
}