
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { TicketingStore, IVaultFilters } from '../../store/ticketing.store';
import { TicketFilterPanelComponent } from '../../components/ticket-filter-panel/ticket-filter-panel.component';
import { TicketAuditGridComponent } from '../../components/ticket-audit-grid/ticket-audit-grid.component';
import { ITicketDetailDto } from '@shared-core';

@Component({
  selector: 'aoms-audit-ticket-vault',
  standalone: true,
  imports: [
    CommonModule,
    TicketFilterPanelComponent,
    TicketAuditGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './audit-ticket-vault.component.html',
  styleUrl: './audit-ticket-vault.component.scss',
})
export class AuditTicketVaultComponent implements OnInit, OnDestroy {
  protected readonly store = inject(TicketingStore);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  /** Filter sidebar collapsed state */
  protected readonly filtersCollapsed = signal<boolean>(false);

  /** Void confirmation modal */
  protected readonly showVoidModal = signal<boolean>(false);
  protected readonly pendingVoidId = signal<number | null>(null);
  protected readonly pendingVoidCode = signal<string>('');
  protected readonly voidReason = signal<string>('');

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Run a default open search on entry so the vault shows recent records
    this.store.searchVaultTickets();
  }

  ngOnDestroy(): void {
    this.store.teardownVault();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Sidebar ────────────────────────────────────────────────────────────
  protected toggleFilters(): void {
    this.filtersCollapsed.update(v => !v);
  }

  // ── Search / Filter bridge ─────────────────────────────────────────────
  protected onFiltersSubmitted(filters: IVaultFilters): void {
    this.store.searchVaultTickets(filters);
  }

  protected onFiltersCleared(): void {
    this.store.clearVault();
    this.store.searchVaultTickets();
  }

  protected onQuickCodeLookup(code: string): void {
    this.store.fetchTicketByReference(code);
  }

  // ── Grid events ────────────────────────────────────────────────────────
  protected onStatusUpdateRequested(payload: { ticketId: number; newStatus: string }): void {
    this.store.updateVaultTicketStatus(payload.ticketId, payload.newStatus);
  }

  protected onVoidRequested(ticket: ITicketDetailDto): void {
    this.pendingVoidId.set(ticket.ticketId);
    this.pendingVoidCode.set(ticket.ticketCode);
    this.voidReason.set('');
    this.store.clearVaultActionState();
    this.showVoidModal.set(true);
  }

  // ── Void modal flow ────────────────────────────────────────────────────
  protected onVoidConfirmed(): void {
    const id = this.pendingVoidId();
    if (!id || !this.voidReason().trim()) return;
    this.store.voidVaultTicket(id, this.voidReason());
    this.showVoidModal.set(false);
    this.pendingVoidId.set(null);
  }

  protected onVoidDismissed(): void {
    this.showVoidModal.set(false);
    this.pendingVoidId.set(null);
    this.store.clearVaultActionState();
  }

  protected onVoidReasonChanged(reason: string): void {
    this.voidReason.set(reason);
  }

  // ── Pagination ─────────────────────────────────────────────────────────
  protected onNextPage(): void { this.store.vaultNextPage(); }
  protected onPrevPage(): void { this.store.vaultPrevPage(); }
  protected onPageChanged(page: number): void { this.store.vaultGoToPage(page); }

  // ── Export ─────────────────────────────────────────────────────────────
  protected onExportCsv(): void {
    const tickets = this.store.vaultTickets();
    if (!tickets.length) return;

    const headers = ['Ticket Code', 'Status', 'Issue Date', 'Booking Ref', 'Passenger', 'Flight', 'Origin', 'Destination', 'Seat', 'Cabin'];
    const rows = tickets.map(t => [
      t.ticketCode,
      t.status,
      t.issueDate?.toString() ?? '',
      (t as ITicketDetailDto).bookingReference ?? '',
      `${(t as ITicketDetailDto).passengerFirstName ?? ''} ${(t as ITicketDetailDto).passengerLastName ?? ''}`.trim(),
      (t as ITicketDetailDto).flightNumber ?? '',
      (t as ITicketDetailDto).originAirportCode ?? '',
      (t as ITicketDetailDto).destinationAirportCode ?? '',
      (t as ITicketDetailDto).seatNumber ?? '',
      (t as ITicketDetailDto).cabinClass ?? '',
    ]);

    const csv = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-vault-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ── Reconnect (on vault error) ─────────────────────────────────────────
  protected onReconnect(): void {
    this.store.searchVaultTickets();
  }

  // ── Track fn ──────────────────────────────────────────────────────────
  protected trackByTicketId(_: number, t: ITicketDetailDto): number {
    return t.ticketId;
  }
}