

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
import { AirportIdentityCardComponent } from '../../components/airport-identity-card/airport-identity-card.component';
import { AirportLocationNavigatorComponent } from '../../components/airport-location-navigator/airport-location-navigator.component';
import { AirportsService } from '@shared-core';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'aoms-airport-details-view',
  standalone: true,
  imports: [
    CommonModule,
    AirportIdentityCardComponent,
    AirportLocationNavigatorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airport-details-view.component.html',
  styleUrl: './airport-details-view.component.scss',
})
export class AirportDetailsViewComponent implements OnInit, OnDestroy {
  protected readonly store = inject(AirportsStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly airportsSvc = inject(AirportsService);

  // ── Route param ──────────────────────────────────────────────────────
  protected readonly iataCode = signal<string>('');

  // ── Confirmation modal state ──────────────────────────────────────────
  /** Controls the deactivation confirmation modal visibility. */
  protected readonly showDeactivateModal = signal<boolean>(false);

  /** True while the deactivation API call is in-flight. */
  protected readonly isDeactivating = signal<boolean>(false);

  // ── Store passthrough signals ─────────────────────────────────────────
  protected readonly airport = this.store.activeAirport;
  protected readonly nearbyAirports = this.store.nearbyAirportsSorted;
  protected readonly viewLoading = this.store.viewLoading;
  protected readonly viewError = this.store.viewError;

  /** Derived page title from the active airport. */
  protected readonly pageTitle = computed<string>(() => {
    const a = this.airport();
    return a ? `${a.iataCode} — ${a.city}` : 'Airport Details';
  });

  // ─────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('iataCode') ?? '';
    this.iataCode.set(code);
    if (code) {
      this.store.loadAirportDeepDetails(code);
    }
  }

  ngOnDestroy(): void {
    this.store.clearActiveAirport();
  }

  // ── Navigation ────────────────────────────────────────────────────────

  protected goBack(): void {
    this.router.navigate(['aoms/network-infrastructure/airport-hub-operations/dashboard']);
  }

  protected navigateToEdit(): void {
    this.router.navigate([
      'aoms/network-infrastructure/airport-hub-operations/manage',
      this.iataCode(),
    ]);
  }

  protected navigateToAudit(): void {
    this.router.navigate([
      'aoms/network-infrastructure/airport-hub-operations/archive',
    ], {
      queryParams: { iataCode: this.iataCode() },
    });
  }

  protected navigateToNearby(iataCode: string): void {
    this.router.navigate([
      'aoms/network-infrastructure/airport-hub-operations/details',
      iataCode,
    ]);
  }

  // ── Deactivation Modal ────────────────────────────────────────────────

  protected openDeactivateModal(): void {
    this.showDeactivateModal.set(true);
  }

  protected closeDeactivateModal(): void {
    this.showDeactivateModal.set(false);
  }

  /**
   * Confirm deactivation:
   *  1. Optimistically remove from the store's list cache.
   *  2. Call the API.
   *  3. On success → navigate back to dashboard.
   *  4. On failure → rollback the store + show error.
   */
  protected confirmDeactivate(): void {
    const code = this.iataCode();
    if (!code) return;

    this.isDeactivating.set(true);
    this.showDeactivateModal.set(false);

    // Snapshot for rollback
    const prevList = this.store.optimisticRemove(code);

    this.airportsSvc.deleteAirport(code).pipe(
      catchError(err => {
        this.store.rollbackRemove(prevList);
        this.store.setViewError(err?.message ?? `Failed to deactivate ${code}.`);
        this.isDeactivating.set(false);
        return EMPTY;
      })
    ).subscribe(() => {
      this.isDeactivating.set(false);
      // Navigate back — the record is gone from the list
      this.goBack();
    });
  }

  // ── Refresh ────────────────────────────────────────────────────────────

  protected refresh(): void {
    const code = this.iataCode();
    if (code) {
      this.store.loadAirportDeepDetails(code);
    }
  }
}