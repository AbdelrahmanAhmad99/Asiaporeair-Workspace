
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { GeographyStore } from '../../store/geography.store';
import { CountryStatsCardsComponent } from '../../components/country-stats-cards/country-stats-cards.component';
import { CountryFilterBarComponent } from '../../components/country-filter-bar/country-filter-bar.component';
import { CountryDataTableComponent, ITableActionEvent } from '../../components/country-data-table/country-data-table.component';
import { IGeographyFilters } from '../../store/geography.store';

@Component({
  selector: 'aoms-country-inventory',
  standalone: true,
  imports: [
    CommonModule,
    CountryStatsCardsComponent,
    CountryFilterBarComponent,
    CountryDataTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './country-inventory.component.html',
  styleUrl: './country-inventory.component.scss',
})
export class CountryInventoryComponent implements OnInit {
  protected readonly store = inject(GeographyStore);
  private readonly router = inject(Router);

  /** Tracks the current theme mode; initialised from the DOM. */
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  ngOnInit(): void {
    this.store.loadAll();
  }

  // ── Dark Mode Toggle ───────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const html = document.documentElement;
    const next = !this.isDarkMode();
    html.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Filter Bridge ──────────────────────────────────────────────────────
  protected onFiltersChanged(partial: Partial<IGeographyFilters>): void {
    this.store.applyFilters(partial);
  }

  // ── Table Action Dispatcher ────────────────────────────────────────────
  protected onTableAction(event: ITableActionEvent): void {
    switch (event.action) {
      case 'view':
        this.router.navigate(['aoms/network-infrastructure/global-geography', event.isoCode]);
        break;
      case 'edit':
        this.router.navigate(['aoms/network-infrastructure/global-geography/manage', event.isoCode]);
        break;
      case 'delete':
        this.store.deleteCountry(event.isoCode);
        break;
      case 'reactivate':
        this.store.reactivateCountry(event.isoCode);
        break;
    }
  }

  // ── Create Navigation ──────────────────────────────────────────────────
  protected navigateToCreate(): void {
    this.router.navigate(['aoms/network-infrastructure/global-geography/manage', 'new']);
  }
}