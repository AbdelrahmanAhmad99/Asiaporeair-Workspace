
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { FleetInventoryStore } from '../../store/fleet-inventory.store';
import { OperationalIdentityCardComponent } from '../../components/operational-identity-card/operational-identity-card.component';
import { FlightHoursLoggerComponent } from '../../components/flight-hours-logger/flight-hours-logger.component';
import { StatusManagementFormComponent, IStatusChangeEvent }
  from '../../components/status-management-form/status-management-form.component';

const FIL_BASE = 'aoms/fleet-configuration/fleet-inventory-lifecycle';

@Component({
  selector: 'aoms-aircraft-profile-hub',
  standalone: true,
  imports: [
    CommonModule,
    OperationalIdentityCardComponent,
    FlightHoursLoggerComponent,
    StatusManagementFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aircraft-profile-hub.component.html',
  styleUrl: './aircraft-profile-hub.component.scss',
})
export class AircraftProfileHubComponent implements OnInit, OnDestroy {
  protected readonly store = inject(FleetInventoryStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected tailNumber = '';

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  /** Local toast state (separate from store feedback for auto-dismiss). */
  protected readonly toast = signal<{ message: string; type: 'success' | 'error' } | null>(null);
  private _toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    // Watch store actionSuccess → show toast
    effect(() => {
      const msg = this.store.actionSuccess();
      if (msg) this._showToast(msg, 'success');
    });

    // Watch store actionError → show error toast
    effect(() => {
      const err = this.store.actionError();
      if (err) this._showToast(err, 'error');
    });
  }

  ngOnInit(): void {
    this.tailNumber = this.route.snapshot.paramMap.get('tailNumber') ?? '';
    if (!this.tailNumber) {
      this.router.navigate([FIL_BASE]);
      return;
    }
    this.store.loadAircraftFullProfile(this.tailNumber);
  }

  ngOnDestroy(): void {
    this.store.clearAircraftProfile();
    clearTimeout(this._toastTimer);
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const html = document.documentElement;
    const next = !this.isDarkMode();
    html.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected backToFleet(): void {
    this.router.navigate([FIL_BASE]);
  }

  protected navigateToEdit(): void {
    this.router.navigate([FIL_BASE, 'edit', this.tailNumber]);
  }

  // ── Action Handlers ────────────────────────────────────────────────────
  protected async onHoursLogged(hours: number): Promise<void> {
    await this.store.logFlightHours(this.tailNumber, hours);
  }

  protected async onStatusChanged(event: IStatusChangeEvent): Promise<void> {
    await this.store.updateAircraftStatus(this.tailNumber, event.status, event.reason);
  }

  protected async onDecommission(): Promise<void> {
    const confirmed = window.confirm(
      `Confirm decommissioning of ${this.tailNumber}?\n\nThis action will remove the aircraft from active fleet assignments.`
    );
    if (!confirmed) return;

    const success = await this.store.decommissionAircraft(this.tailNumber);
    if (success) this.router.navigate([FIL_BASE]);
  }

  // ── Toast ──────────────────────────────────────────────────────────────
  private _showToast(message: string, type: 'success' | 'error'): void {
    clearTimeout(this._toastTimer);
    this.toast.set({ message, type });
    this._toastTimer = setTimeout(() => {
      this.toast.set(null);
      this.store.clearActionFeedback();
    }, 5000);
  }

  protected dismissToast(): void {
    clearTimeout(this._toastTimer);
    this.toast.set(null);
    this.store.clearActionFeedback();
  }
}