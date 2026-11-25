
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { GeographyStore } from '../../store/geography.store';
import { CountryFormUiComponent, ICountryFormPayload } from '../../components/country-form-ui/country-form-ui.component';
import { ICountryDto } from '@shared-core';
import { CountriesService } from '@shared-core';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'aoms-country-editor',
  standalone: true,
  imports: [CommonModule, CountryFormUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './country-editor.component.html',
  styleUrl: './country-editor.component.scss',
})
export class CountryEditorComponent implements OnInit, OnDestroy {
  protected readonly store = inject(GeographyStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly countriesService = inject(CountriesService);

  // ── Mode ─────────────────────────────────────────────────────────────────
  /** True when the route param is anything other than 'new'. */
  protected readonly isEditMode = signal<boolean>(false);

  /** The ISO code extracted from the route (empty string in Create mode). */
  protected readonly isoCode = signal<string>('');

  // ── Data for the form ─────────────────────────────────────────────────────
  /** Pre-populated data passed to the form in Edit mode. */
  protected readonly initialData = signal<ICountryDto | null>(null);

  /** True while the editor is fetching the country record for Edit mode. */
  protected readonly isFetchingRecord = signal<boolean>(false);

  /** Error from the initial fetch (not from saving). */
  protected readonly fetchError = signal<string | null>(null);

  // ── Computed page metadata ────────────────────────────────────────────────
  protected readonly pageTitle = computed(() =>
    this.isEditMode()
      ? `Edit — ${this.initialData()?.name ?? this.isoCode()}`
      : 'New Country'
  );

  protected readonly breadcrumbCurrent = computed(() =>
    this.isEditMode() ? 'Edit Country' : 'New Country'
  );

  // ── Store passthrough signals ─────────────────────────────────────────────
  /** Passed to the form's `isLoading` input. */
  protected readonly isSaving = this.store.isSaving;
  protected readonly saveError = this.store.saveError;
  protected readonly existingIsoCodes = this.store.existingIsoCodes;

  // ─────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('isoCode') ?? '';
    const isEdit = param !== 'new' && param.length > 0;

    this.isoCode.set(isEdit ? param : '');
    this.isEditMode.set(isEdit);

    // Ensure the list is loaded so existingIsoCodes is populated for duplicate-check
    this.store.loadAll();
    this.store.clearSaveError();

    if (isEdit) {
      this._fetchRecordForEdit(param);
    }
  }

  ngOnDestroy(): void {
    this.store.clearSaveError();
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  protected goBack(): void {
    this.router.navigate(['aoms/network-infrastructure/global-geography']);
  }

  // ── Form event handlers ───────────────────────────────────────────────────

  protected async onSave(payload: ICountryFormPayload): Promise<void> {
    if (this.isEditMode()) {
      const result = await this.store.updateCountry(this.isoCode(), {
        name: payload.name,
        continent: payload.continent,
        currencyCode: payload.currencyCode,
        phoneCode: payload.phoneCode,
      });

      if (result.success) {
        // Navigate to the details page of the updated country
        this.router.navigate([
          'aoms/network-infrastructure/global-geography',
          result.country.isoCode,
        ]);
      }
      // Failure: store already set saveError; the form shows it via the banner.
    } else {
      const result = await this.store.createCountry({
        isoCode: payload.isoCode,
        name: payload.name,
        continent: payload.continent,
        currencyCode: payload.currencyCode,
        phoneCode: payload.phoneCode,
      });

      if (result.success) {
        // Navigate to the new country's details page
        this.router.navigate([
          'aoms/network-infrastructure/global-geography',
          result.country.isoCode,
        ]);
      }
    }
  }

  protected onCancel(): void {
    this.goBack();
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /**
   * Fetches the single country record by ISO code for Edit mode pre-population.
   * Uses CountriesService directly since GeographyStore's detail endpoint
   * returns ICountryWithAirportsDto; here we only need ICountryDto for the form.
   */
  private _fetchRecordForEdit(isoCode: string): void {
    this.isFetchingRecord.set(true);
    this.fetchError.set(null);

    this.countriesService.getCountryByIsoCode(isoCode).pipe(
      catchError(err => {
        const status = err?.status;
        const msg =
          status === 404
            ? `Country "${isoCode}" was not found. It may have been deactivated.`
            : (err?.message ?? 'Failed to load country data.');
        this.fetchError.set(msg);
        this.isFetchingRecord.set(false);
        return of(null);
      })
    ).subscribe(country => {
      if (country) {
        this.initialData.set(country);
      }
      this.isFetchingRecord.set(false);
    });
  }
}