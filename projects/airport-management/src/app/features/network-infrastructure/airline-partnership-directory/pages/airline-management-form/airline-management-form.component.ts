
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { AirlinesStore } from '../../store/airlines.store';
import { AirlineFormFieldsComponent, AirlineFormPayload } from '../../components/airline-form-fields/airline-form-fields.component';
import { ICreateAirlineDto, IUpdateAirlineDto } from '@shared-core';

@Component({
  selector: 'aoms-airline-management-form',
  standalone: true,
  imports: [CommonModule, AirlineFormFieldsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airline-management-form.component.html',
  styleUrl: './airline-management-form.component.scss',
})
export class AirlineManagementFormComponent implements OnInit, OnDestroy {
  protected readonly store = inject(AirlinesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // ── Mode ─────────────────────────────────────────────────────────────
  protected readonly isEditMode = signal<boolean>(false);
  protected readonly iataCode = signal<string>('');

  // ── Store passthrough signals ─────────────────────────────────────────
  protected readonly airline = this.store.selectedAirline;
  protected readonly airportOptions = this.store.baseAirportOptions;
  protected readonly airportSearching = this.store.airportSearching;
  protected readonly isSubmitting = this.store.formProcessing;
  protected readonly formError = this.store.formError;
  protected readonly detailsLoading = this.store.detailsLoading;

  /** Pre-population data: resolved to ICreateAirlineDto shape for the form. */
  protected readonly initialData = computed<ICreateAirlineDto | null>(() => {
    const a = this.airline();
    if (!a) return null;
    return {
      iataCode: a.iataCode,
      name: a.name,
      callsign: a.callsign,
      operatingRegion: a.operatingRegion,
      baseAirportIataCode: a.baseAirportIataCode,
    };
  });

  // ── Page metadata ─────────────────────────────────────────────────────
  protected readonly pageTitle = computed<string>(() =>
    this.isEditMode()
      ? `Modify Partner — ${this.iataCode()}`
      : 'Onboard New Partner'
  );

  protected readonly breadcrumbLabel = computed<string>(() =>
    this.isEditMode() ? 'Edit Configuration' : 'New Partner'
  );

  // ── Reference to form component for imperative submit from header ─────
  @ViewChild(AirlineFormFieldsComponent) private formFieldsRef?: AirlineFormFieldsComponent;

  // ── Internal save-in-progress (triggered from header CTA) ─────────────
  /** Prevent double-trigger when the header Save button is clicked. */
  protected readonly headerSaveTriggered = signal<boolean>(false);

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('iataCode') ?? '';
    const isEdit = param !== 'new' && param.trim().length > 0;

    this.iataCode.set(isEdit ? param.toUpperCase() : '');
    this.isEditMode.set(isEdit);

    this.store.clearFormError();
    this.store.clearAirportOptions();

    if (isEdit) {
      this.store.loadAirlineDeepDetails(param.toUpperCase());
    }
  }

  ngOnDestroy(): void {
    this.store.clearFormError();
    this.store.clearAirportOptions();
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected returnToDashboard(): void {
    this.router.navigate(['aoms/network-infrastructure/airline-partnership-directory/dashboard']);
  }

  protected viewAuditLog(): void {
    this.router.navigate(
      ['aoms/network-infrastructure/airline-partnership-directory/audit-center'],
      this.isEditMode() ? { queryParams: { iataCode: this.iataCode() } } : {}
    );
  }

  /** Trigger the form's own submit from the header button. */
  protected headerSave(): void {
    // Access the form component's internal submit method via a custom public method
    (this.formFieldsRef as unknown as { submit: () => void })?.submit?.();
  }

  // ── Events from AirlineFormFieldsComponent ────────────────────────────

  protected onSearchAirports(query: string): void {
    this.store.searchBaseAirports(query);
  }

  protected async onSave(payload: AirlineFormPayload): Promise<void> {
    const result = await this.store.submitAirlineForm(
      payload,
      this.isEditMode(),
      this.isEditMode() ? this.iataCode() : undefined
    );

    if (result.success && result.iataCode) {
      this.router.navigate([
        'aoms/network-infrastructure/airline-partnership-directory/details',
        result.iataCode,
      ]);
    }
  }

  protected onCancel(): void {
    if (this.isEditMode()) {
      this.router.navigate([
        'aoms/network-infrastructure/airline-partnership-directory/details',
        this.iataCode(),
      ]);
    } else {
      this.returnToDashboard();
    }
  }
}