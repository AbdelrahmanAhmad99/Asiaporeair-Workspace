
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { FleetInventoryStore } from '../../store/fleet-inventory.store';
import { AircraftAuditLogTableComponent } from '../../components/aircraft-audit-log-table/aircraft-audit-log-table.component';
import { RestoreConfirmationModalComponent } from '../../components/restore-confirmation-modal/restore-confirmation-modal.component';
import { RestoreOperationButtonComponent } from '../../components/restore-operation-button/restore-operation-button.component';

const FIL_BASE = 'aoms/fleet-configuration/fleet-inventory-lifecycle';

@Component({
  selector: 'aoms-fleet-archival-center',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AircraftAuditLogTableComponent,
    RestoreConfirmationModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fleet-archival-center.component.html',
  styleUrl: './fleet-archival-center.component.scss',
})
export class FleetArchivalCenterComponent implements OnInit, OnDestroy {
  protected readonly store = inject(FleetInventoryStore);
  private readonly router = inject(Router);

  // ── Modal State ────────────────────────────────────────────────────────
  protected readonly showModal = signal<boolean>(false);
  protected readonly pendingTailNum = signal<string>('');

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Search Query (two-way bound) ───────────────────────────────────────
  protected searchQuery = '';

  // ── Success auto-dismiss timer ─────────────────────────────────────────
  private _successTimer?: ReturnType<typeof setTimeout>;

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.loadArchivedFleet();
  }

  ngOnDestroy(): void {
    clearTimeout(this._successTimer);
    this.store.clearArchivalState();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Search Filter ──────────────────────────────────────────────────────
  protected onSearchChange(query: string): void {
    this.searchQuery = query;
    this.store.setArchiveFilter(query);
  }

  protected clearSearch(): void {
    this.searchQuery = '';
    this.store.setArchiveFilter('');
  }

  // ── Modal Orchestration ────────────────────────────────────────────────

  /** Called by the audit table when a row's restore button is clicked. */
  protected onRestoreRequested(tailNumber: string): void {
    this.store.clearAuditTrailError();
    this.pendingTailNum.set(tailNumber);
    this.showModal.set(true);
  }

  /** User confirmed restoration inside the modal. */
  protected async onRestoreConfirmed(): Promise<void> {
    const tail = this.pendingTailNum();
    if (!tail) return;

    const result = await this.store.restoreAircraft(tail);

    if (result.success) {
      // Auto-dismiss modal and clear restored tail indicator after 2.5s
      this._successTimer = setTimeout(() => {
        this.showModal.set(false);
        this.pendingTailNum.set('');
        this.store.clearRestoredTail();
      }, 2500);
    }
    // Errors stay visible in the modal — user dismisses via "Dismiss & Review"
  }

  /** User cancelled or dismissed the modal. */
  protected onModalCancelled(): void {
    this.showModal.set(false);
    this.pendingTailNum.set('');
    this.store.clearAuditTrailError();
  }

  /** User dismissed the error state inside the modal. */
  protected onErrorDismissed(): void {
    this.showModal.set(false);
    this.pendingTailNum.set('');
    this.store.clearAuditTrailError();
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected navigateToFleet(): void {
    this.router.navigate([FIL_BASE]);
  }
}