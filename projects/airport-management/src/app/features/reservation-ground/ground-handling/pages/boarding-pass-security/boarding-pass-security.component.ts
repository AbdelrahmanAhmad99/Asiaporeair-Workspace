
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

import { GroundHandlingStore, ISecuritySearchFilter } from '../../store/ground-handling.store';
import { BoardingPassDataGridComponent } from '../../components/boarding-pass-data-grid/boarding-pass-data-grid.component';
import { VoidConfirmationDialogComponent } from '../../components/void-confirmation-dialog/void-confirmation-dialog.component';
import { IBoardingPassDto } from '@shared-core';

@Component({
  selector: 'aoms-boarding-pass-security',
  standalone: true,
  imports: [
    CommonModule,
    BoardingPassDataGridComponent,
    VoidConfirmationDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './boarding-pass-security.component.html',
  styleUrl: './boarding-pass-security.component.scss',
})
export class BoardingPassSecurityComponent implements OnInit, OnDestroy {
  protected readonly store = inject(GroundHandlingStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  /** Void confirmation modal visibility */
  protected readonly showVoidDialog = signal<boolean>(false);
  /** PassId queued for voiding */
  protected readonly pendingVoidId = signal<number | null>(null);

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Run a default open search on entry to load recent passes
    this.store.searchPasses();
  }

  ngOnDestroy(): void {
    this.store.teardownSecurity();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected goToGateTerminal(): void {
    const flightId = this.store.activeFlightId();
    if (flightId) {
      this.router.navigate(['/aoms/reservation-ground/ground-handling/gate-terminal', flightId]);
    } else {
      // Fallback: No active flight, go to base which should ideally show a selector
      this.router.navigate(['/aoms/reservation-ground/ground-handling']);
    }
  }

  protected goToManifestAudit(): void {
    const flightId = this.store.activeFlightId();
    if (flightId) {
      this.router.navigate(['/aoms/reservation-ground/ground-handling/flight-final-manifest', flightId]);
    } else {
      this.router.navigate(['/aoms/reservation-ground/ground-handling']);
    }
  }

  // ── Search / Filter ────────────────────────────────────────────────────
  protected onSearchSubmitted(filters: ISecuritySearchFilter): void {
    this.store.searchPasses(filters);
  }

  protected onSearchCleared(): void {
    this.store.clearSecuritySearch();
    this.store.searchPasses();
  }

  protected onFilterChanged(partial: Partial<ISecuritySearchFilter>): void {
    this.store.updateSecurityFilter(partial);
  }

  // ── Grid events ────────────────────────────────────────────────────────
  protected onPassSelected(pass: IBoardingPassDto): void {
    this.store.inspectPass(pass.passId);
  }

  protected onVoidRequested(pass: IBoardingPassDto): void {
    this.store.clearSecurityError();
    this.pendingVoidId.set(pass.passId);
    this.showVoidDialog.set(true);
  }

  protected onInspectionClosed(): void {
    this.store.clearInspection();
  }

  // ── Void dialog flow ───────────────────────────────────────────────────
  protected onVoidConfirmed(): void {
    const id = this.pendingVoidId();
    if (id == null) return;
    this.showVoidDialog.set(false);
    this.store.confirmAndVoid(id);
    this.pendingVoidId.set(null);
  }

  protected onVoidCancelled(): void {
    this.showVoidDialog.set(false);
    this.pendingVoidId.set(null);
    this.store.clearSecurityError();
  }

  // ── Pagination ─────────────────────────────────────────────────────────
  protected onNextPage(): void { this.store.securityNextPage(); }
  protected onPrevPage(): void { this.store.securityPrevPage(); }

  // ── Error / Toast dismiss ──────────────────────────────────────────────
  protected onDismissError(): void {
    this.store.clearSecurityError();
  }

  protected onDismissVoidSuccess(): void {
    this.store.clearVoidSuccess();
  }

  protected onRetry(): void {
    this.store.searchPasses();
  }
}