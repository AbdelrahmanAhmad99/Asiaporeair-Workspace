
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

import { FleetInventoryStore } from '../../store/fleet-inventory.store';
import { AircraftBaseFormComponent } from '../../components/aircraft-base-form/aircraft-base-form.component';
import { ActionToolbarComponent, ToolbarAction } from '../../components/action-toolbar/action-toolbar.component';
import { DecommissionModalComponent } from '../../components/decommission-modal/decommission-modal.component';
import { ICreateAircraftDto, IUpdateAircraftDto } from '@shared-core';

const FIL_BASE = 'aoms/fleet-configuration/fleet-inventory-lifecycle';

@Component({
  selector: 'aoms-aircraft-registration-wizard',
  standalone: true,
  imports: [
    CommonModule,
    AircraftBaseFormComponent,
    ActionToolbarComponent,
    DecommissionModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aircraft-registration-wizard.component.html',
  styleUrl: './aircraft-registration-wizard.component.scss',
})
export class AircraftRegistrationWizardComponent implements OnInit, OnDestroy {
  protected readonly store = inject(FleetInventoryStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /** Tail number from route — present in Edit mode only. */
  protected tailNumber = '';
  protected isEditMode = false;

  /** Tracks form validity from AircraftBaseFormComponent output. */
  protected readonly isFormValid = signal<boolean>(false);
  /** Tracks form dirty state from AircraftBaseFormComponent output. */
  protected readonly isFormDirty = signal<boolean>(false);

  /** Partial form data updated on every `formChanged` event. */
  private _formData: Partial<ICreateAircraftDto> = {};

  /** Controls the decommission modal visibility. */
  protected readonly showDecommissionModal = signal<boolean>(false);

  /** Dark mode signal. */
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.tailNumber = this.route.snapshot.paramMap.get('tailNumber') ?? '';
    this.isEditMode = !!this.tailNumber && this.tailNumber !== 'new';

    // Load aircraft types for the dropdown
    this.store.loadSupportData();

    // In edit mode, load the current aircraft data
    if (this.isEditMode) {
      this.store.loadAircraftFullProfile(this.tailNumber);
    }
  }

  ngOnDestroy(): void {
    this.store.clearWizardErrors();
    if (this.isEditMode) {
      this.store.clearAircraftProfile?.();
    }
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Form Bridge ────────────────────────────────────────────────────────
  protected onFormChanged(data: Partial<ICreateAircraftDto>): void {
    this._formData = data;
    this.isFormDirty.set(true);
  }

  protected onValidityChanged(valid: boolean): void {
    this.isFormValid.set(valid);
  }

  // ── Toolbar Dispatcher ─────────────────────────────────────────────────
  protected async onToolbarAction(action: ToolbarAction): Promise<void> {
    switch (action) {
      case 'cancel':
        this._navigateBack();
        break;

      case 'decommission':
        this.showDecommissionModal.set(true);
        break;

      case 'save':
        await this._save();
        break;
    }
  }

  // ── Decommission Modal ─────────────────────────────────────────────────
  protected onDecommissionConfirmed(): void {
    this._decommission();
  }

  protected onDecommissionCancelled(): void {
    this.showDecommissionModal.set(false);
  }

  // ── Private Save ──────────────────────────────────────────────────────
  private async _save(): Promise<void> {
    if (!this.isFormValid()) return;

    let result: { success: boolean; tailNumber?: string };

    if (this.isEditMode) {
      const dto: IUpdateAircraftDto = {
        airlineIataCode: this._formData.airlineIataCode ?? '',
        aircraftTypeId: this._formData.aircraftTypeId ?? 0,
        acquisitionDate: this._formData.acquisitionDate,
      };
      result = await this.store.updateAircraftRecords(this.tailNumber, dto);
    } else {
      const dto: ICreateAircraftDto = {
        tailNumber: this._formData.tailNumber ?? '',
        airlineIataCode: this._formData.airlineIataCode ?? '',
        aircraftTypeId: this._formData.aircraftTypeId ?? 0,
        acquisitionDate: this._formData.acquisitionDate,
        status: this._formData.status ?? 'ACTIVE',
      };
      result = await this.store.registerAircraft(dto);
    }

    if (result.success && result.tailNumber) {
      this.router.navigate([FIL_BASE, result.tailNumber]);
    }
  }

  private async _decommission(): Promise<void> {
    const result = await this.store.decommissionAircraft(this.tailNumber);
    this.showDecommissionModal.set(false);
    if (result.success) {
      this.router.navigate([FIL_BASE]);
    }
  }

  private _navigateBack(): void {
    if (this.isEditMode) {
      this.router.navigate([FIL_BASE, this.tailNumber]);
    } else {
      this.router.navigate([FIL_BASE]);
    }
  }
}