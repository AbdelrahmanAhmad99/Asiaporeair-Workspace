
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { AirportsStore } from '../../store/airports.store';
import { AirportBaseFormComponent, AirportBaseFormPayload } from '../../components/airport-base-form/airport-base-form.component';
import { AirportTaxFormComponent } from '../../components/airport-tax-form/airport-tax-form.component';
import { AirportStatusToggleComponent } from '../../components/airport-status-toggle/airport-status-toggle.component';
import { AirportsService } from '@shared-core';
import { ICreateAirportDto, IUpdateAirportDto } from '@shared-core';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'aoms-airport-terminal-editor',
  standalone: true,
  imports: [
    CommonModule,
    AirportBaseFormComponent,
    AirportTaxFormComponent,
    AirportStatusToggleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airport-terminal-editor.component.html',
  styleUrl: './airport-terminal-editor.component.scss',
})
export class AirportTerminalEditorComponent implements OnInit, OnDestroy {
  protected readonly store = inject(AirportsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly airportsSvc = inject(AirportsService);

  // ── Mode signals ─────────────────────────────────────────────────────
  protected readonly isEditMode = signal<boolean>(false);
  protected readonly iataCode = signal<string>('');

  // ── Pre-population data for base form (Edit mode) ─────────────────────
  protected readonly initialData = signal<ICreateAirportDto | null>(null);

  /** True while fetching the existing record for edit pre-population. */
  protected readonly isFetching = signal<boolean>(false);
  protected readonly fetchError = signal<string | null>(null);

  // ── Store passthrough ─────────────────────────────────────────────────
  protected readonly availableCountries = this.store.countriesSorted;
  protected readonly isProcessing = this.store.isProcessing;
  protected readonly processingError = this.store.processingError;

  /** Set of existing IATA codes for the duplicate check in Create mode. */
  protected readonly existingIataCodes = computed<Set<string>>(
    () => new Set(this.store.airports().map(a => a.iataCode.toUpperCase()))
  );

  // ── Computed metadata ─────────────────────────────────────────────────
  protected readonly pageTitle = computed<string>(() =>
    this.isEditMode() ? `Edit — ${this.iataCode()}` : 'Register New Airport'
  );

  protected readonly breadcrumbLabel = computed<string>(() =>
    this.isEditMode() ? 'Edit Terminal' : 'New Terminal'
  );

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('iataCode') ?? '';
    const isEdit = param !== 'new' && param.trim().length > 0;

    this.iataCode.set(isEdit ? param.toUpperCase() : '');
    this.isEditMode.set(isEdit);

    // Always load country selection data
    this.store.loadSelectionData();
    this.store.clearProcessingError();

    // Ensure the master list is populated for duplicate check
    if (this.store.airports().length === 0) {
      this.store.loadAllActive();
    }

    if (isEdit) {
      this._fetchForEdit(param.toUpperCase());
    }
  }

  ngOnDestroy(): void {
    this.store.clearProcessingError();
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected goBack(): void {
    this.router.navigate(['aoms/network-infrastructure/airport-hub-operations/dashboard']);
  }

  // ── Save handler (from AirportBaseFormComponent) ───────────────────────

  protected async onSave(payload: AirportBaseFormPayload): Promise<void> {
    const result = await this.store.saveAirport({
      mode: this.isEditMode() ? 'update' : 'create',
      iataCode: this.isEditMode() ? this.iataCode() : undefined,
      data: payload,
    });

    if (result.success) {
      if (this.isEditMode()) {
        // Navigate to the updated airport's details page
        this.router.navigate([
          'aoms/network-infrastructure/airport-hub-operations/details',
          result.airport.iataCode,
        ]);
      } else {
        // Navigate to the new airport's details page
        this.router.navigate([
          'aoms/network-infrastructure/airport-hub-operations/details',
          result.airport.iataCode,
        ]);
      }
    }
    // On failure: `store.processingError` is set; base form displays it.
  }

  protected onCancel(): void {
    this.goBack();
  }

  // ── Deactivate handler (from AirportStatusToggleComponent) ────────────

  protected async onDeactivateConfirmed(): Promise<void> {
    const result = await this.store.removeAirport(this.iataCode());
    if (result.success) {
      // Navigate back to dashboard — the node is gone
      this.goBack();
    }
    // On failure: store.processingError is set and displayed by the editor banner.
  }

  // ── Private: fetch record for Edit pre-population ─────────────────────

  private _fetchForEdit(iataCode: string): void {
    this.isFetching.set(true);
    this.fetchError.set(null);

    this.airportsSvc.getAirportByIataCode(iataCode).pipe(
      catchError(err => {
        const status = (err as { status?: number })?.status;
        const msg =
          status === 404
            ? `Airport "${iataCode}" was not found. It may have been deactivated.`
            : ((err as Error)?.message ?? 'Failed to load airport data.');
        this.fetchError.set(msg);
        this.isFetching.set(false);
        return of(null);
      })
    ).subscribe(airport => {
      if (airport) {
        this.initialData.set({
          iataCode: airport.iataCode,
          icaoCode: airport.icaoCode,
          name: airport.name,
          city: airport.city,
          countryIsoCode: airport.countryIsoCode,
          latitude: airport.latitude,
          longitude: airport.longitude,
          altitude: airport.altitude,
        });
      }
      this.isFetching.set(false);
    });
  }
}