
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

import { GeographyStore } from '../../store/geography.store';
import { CountryHeroSectionComponent } from '../../components/country-hero-section/country-hero-section.component';
import { CountryAirportGridComponent } from '../../components/country-airport-grid/country-airport-grid.component';

@Component({
  selector: 'aoms-country-details',
  standalone: true,
  imports: [
    CommonModule,
    CountryHeroSectionComponent,
    CountryAirportGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './country-details.component.html',
  styleUrl: './country-details.component.scss',
})
export class CountryDetailsComponent implements OnInit, OnDestroy {
  protected readonly store = inject(GeographyStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** The ISO code extracted from route params on init. */
  protected readonly isoCode = signal<string>('');

  /** Tracks whether a deactivation is in-flight (optimistic UI). */
  protected readonly isDeactivating = signal<boolean>(false);

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('isoCode') ?? '';
    this.isoCode.set(code);
    if (code) {
      this.store.loadCountryDetails(code);
    }
  }

  ngOnDestroy(): void {
    this.store.clearCountryDetails();
  }

  // ── Navigation ─────────────────────────────────────────────────────────

  protected goBack(): void {
    this.router.navigate(['aoms/network-infrastructure/global-geography']);
  }

  protected navigateToEdit(): void {
    this.router.navigate([
      'aoms/network-infrastructure/global-geography/manage',
      this.isoCode(),
    ]);
  }

  // ── Actions ────────────────────────────────────────────────────────────

  /**
   * Deactivate the current country with optimistic feedback.
   * Navigates back to inventory after dispatching the delete action.
   */
  protected deactivateCountry(): void {
    const code = this.isoCode();
    if (!code) return;
    this.isDeactivating.set(true);
    this.store.deleteCountry(code);
    // Navigate back after a brief delay to allow the optimistic update to settle
    setTimeout(() => this.goBack(), 300);
  }
}