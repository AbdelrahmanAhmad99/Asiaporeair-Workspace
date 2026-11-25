
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  BookingCenterStore,
  IPaxIndexFilters,
} from '../../store/booking-center.store';
import { PaxManifestTableComponent } from '../../components/pax-manifest-table/pax-manifest-table.component';
import { PassengerDetailFormComponent } from '../../components/passenger-detail-form/passenger-detail-form.component';
import { PaxActionBarComponent } from '../../components/pax-action-bar/pax-action-bar.component';
import { IPassengerDto, IUpdatePassengerDto } from '@shared-core';

@Component({
  selector: 'aoms-passenger-master-index',
  standalone: true,
  imports: [
    CommonModule,
    PaxManifestTableComponent,
    PassengerDetailFormComponent,
    PaxActionBarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './passenger-master-index.component.html',
  styleUrl: './passenger-master-index.component.scss',
})
export class PassengerMasterIndexComponent implements OnInit, OnDestroy {
  protected readonly store = inject(BookingCenterStore);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  // ── Delete Confirmation Modal ──────────────────────────────────────────
  protected readonly showDeleteModal = signal<boolean>(false);
  protected readonly pendingDeleteId = signal<number | null>(null);
  protected readonly pendingDeleteName = signal<string>('');
  /** Two-step confirmation: user must type "DELETE" to enable the confirm button */
  protected readonly deleteConfirmText = signal<string>('');

  readonly deleteConfirmValid = signal<boolean>(false);

  // ── Search filter local copy (form state before submission) ───────────
  protected readonly searchDraft = signal<IPaxIndexFilters>({
    nameContains: '',
    passportNumber: '',
    userId: '',
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Trigger an initial search to populate the table on entry
    this.store.executePassengerSearch();
  }

  ngOnDestroy(): void {
    this.store.teardownPassengerIndex();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Search ─────────────────────────────────────────────────────────────
  protected onSearchSubmit(filters: IPaxIndexFilters): void {
    this.store.executePassengerSearch(filters);
  }

  protected onSearchReset(): void {
    this.store.resetPaxSearch();
    this.searchDraft.set({ nameContains: '', passportNumber: '', userId: '' });
    // Re-run default search after reset
    this.store.executePassengerSearch();
  }

  // ── Table row selection ────────────────────────────────────────────────
  protected onViewPassenger(passenger: IPassengerDto): void {
    // Ensure we have a valid passengerId before loading details
    const id = passenger.passengerId || (passenger as any).id;
    if (id) {
      this.store.loadPassengerDetails(id);
      this.store.clearPaxActionState();
    } else {
      console.error('[PassengerIndex] Invalid passenger ID:', passenger);
    }
  }

  protected onCloseDetail(): void {
    this.store.clearFocusedPassenger();
  }

  // ── Detail form save ───────────────────────────────────────────────────
  protected onPassengerUpdate(payload: { id: number; data: IUpdatePassengerDto }): void {
    this.store.commitPassengerUpdate(payload.id, payload.data);
  }

  // ── Pagination ─────────────────────────────────────────────────────────
  protected onNextPage(): void { this.store.paxNextPage(); }
  protected onPrevPage(): void { this.store.paxPrevPage(); }
  protected onPageChanged(page: number): void { this.store.paxGoToPage(page); }

  // ── Delete flow ────────────────────────────────────────────────────────
  protected onDeleteRequested(passenger: IPassengerDto): void {
    this.pendingDeleteId.set(passenger.passengerId);
    this.pendingDeleteName.set(`${passenger.firstName} ${passenger.lastName}`.trim());
    this.deleteConfirmText.set('');
    this.deleteConfirmValid.set(false);
    this.store.clearPaxActionState();
    this.showDeleteModal.set(true);
  }

  protected onDeleteConfirmTextChanged(val: string): void {
    this.deleteConfirmText.set(val);
    this.deleteConfirmValid.set(val.trim().toUpperCase() === 'DELETE');
  }

  protected async onDeleteConfirmed(): Promise<void> {
    const id = this.pendingDeleteId();
    if (!id || !this.deleteConfirmValid()) return;
    const success = await this.store.commitPassengerDeletion(id);
    if (success) {
      this.showDeleteModal.set(false);
      this.pendingDeleteId.set(null);
    }
  }

  protected onDeleteDismissed(): void {
    this.showDeleteModal.set(false);
    this.pendingDeleteId.set(null);
    this.deleteConfirmText.set('');
    this.deleteConfirmValid.set(false);
    this.store.clearPaxActionState();
  }

  // ── Action bar events ──────────────────────────────────────────────────
  protected onExportRequested(): void {
    // Export hook — wire to export service when available
    console.info('[PassengerIndex] Export triggered');
  }
}