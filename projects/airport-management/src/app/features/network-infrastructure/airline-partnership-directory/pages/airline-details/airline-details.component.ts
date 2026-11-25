
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

import { AirlinesStore } from '../../store/airlines.store';
import { AirlineProfileHeaderComponent } from '../../components/airline-profile-header/airline-profile-header.component';
import { AirlineFleetTableComponent } from '../../components/airline-fleet-table/airline-fleet-table.component';

@Component({
  selector: 'aoms-airline-details',
  standalone: true,
  imports: [
    CommonModule,
    AirlineProfileHeaderComponent,
    AirlineFleetTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airline-details.component.html',
  styleUrl: './airline-details.component.scss',
})
export class AirlineDetailsComponent implements OnInit, OnDestroy {
  protected readonly store = inject(AirlinesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // ── Route param ──────────────────────────────────────────────────────
  protected readonly iataCode = signal<string>('');

  // ── Store passthrough signals ─────────────────────────────────────────
  protected readonly airline = this.store.selectedAirline;
  protected readonly fleet = this.store.selectedAirlineFleet;
  protected readonly loading = this.store.detailsLoading;
  protected readonly detailsError = this.store.detailsError;
  protected readonly fleetSize = this.store.fleetSize;
  protected readonly fleetBreakdown = this.store.fleetStatusBreakdown;

  // ── Deactivation guard state ──────────────────────────────────────────
  /** True when the user clicked "Deactivate Partner" (first click). */
  protected readonly guardOpen = signal<boolean>(false);
  /** True while the API deactivation call is in-flight. */
  protected readonly isDeactivating = signal<boolean>(false);
  /** Error from a failed deactivation. */
  protected readonly deactivationError = signal<string | null>(null);

  // ── Derived page metadata ─────────────────────────────────────────────
  protected readonly pageTitle = computed<string>(() => {
    const a = this.airline();
    return a ? `${a.name} — ${a.iataCode}` : 'Partner Profile';
  });

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('iataCode') ?? '';
    this.iataCode.set(code.toUpperCase());
    if (code) {
      this.store.loadAirlineDeepDetails(code.toUpperCase());
    }
  }

  ngOnDestroy(): void {
    this.store.clearAirlineDetails();
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected returnToDirectory(): void {
    this.router.navigate(['aoms/network-infrastructure/airline-partnership-directory/dashboard']);
  }

  protected modifyProfile(): void {
    this.router.navigate([
      'aoms/network-infrastructure/airline-partnership-directory/manage',
      this.iataCode(),
    ]);
  }

  protected viewAuditHistory(): void {
    this.router.navigate([
      'aoms/network-infrastructure/airline-partnership-directory/audit-center',
    ], {
      queryParams: { iataCode: this.iataCode() },
    });
  }

  protected refresh(): void {
    const code = this.iataCode();
    if (code) {
      this.store.loadAirlineDeepDetails(code);
    }
  }

  // ── Deactivation Guard ────────────────────────────────────────────────

  protected openDeactivationGuard(): void {
    this.guardOpen.set(true);
    this.deactivationError.set(null);
  }

  protected closeDeactivationGuard(): void {
    if (this.isDeactivating()) return;
    this.guardOpen.set(false);
    this.deactivationError.set(null);
  }

  protected async confirmDeactivation(): Promise<void> {
    const code = this.iataCode();
    if (!code) return;

    this.isDeactivating.set(true);
    this.deactivationError.set(null);

    const result = await this.store.requestDeactivation(code);

    this.isDeactivating.set(false);

    if (result.success) {
      this.guardOpen.set(false);
      // Navigate back to directory — partner is now deactivated
      this.returnToDirectory();
    } else {
      this.deactivationError.set(result.error ?? 'Deactivation failed. Please try again.');
    }
  }
}