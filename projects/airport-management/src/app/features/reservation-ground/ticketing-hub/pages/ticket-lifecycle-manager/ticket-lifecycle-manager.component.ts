
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { TicketingStore } from '../../store/ticketing.store';
import { ElectronicTicketPreviewComponent } from '../../components/electronic-ticket-preview/electronic-ticket-preview.component';
import { PassengerTicketHistoryListComponent } from '../../components/passenger-ticket-history-list/passenger-ticket-history-list.component';
import { VoidConfirmationDialogComponent } from '../../components/void-confirmation-dialog/void-confirmation-dialog.component';
import { TicketSecurityBadgeComponent } from '../../components/ticket-security-badge/ticket-security-badge.component';

// Available status options for the inline patch control
export const LIFECYCLE_STATUS_OPTIONS = [
  { label: 'Issued', value: 'Issued' },
  { label: 'Active', value: 'Active' },
  { label: 'Used', value: 'Used' },
  { label: 'Suspended', value: 'Suspended' },
];

@Component({
  selector: 'aoms-ticket-lifecycle-manager',
  standalone: true,
  imports: [
    CommonModule,
    ElectronicTicketPreviewComponent,
    PassengerTicketHistoryListComponent,
    VoidConfirmationDialogComponent,
    TicketSecurityBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-lifecycle-manager.component.html',
  styleUrl: './ticket-lifecycle-manager.component.scss',
})
export class TicketLifecycleManagerComponent implements OnInit, OnDestroy {
  protected readonly store = inject(TicketingStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  /** Void dialog visibility */
  protected readonly showVoidDialog = signal<boolean>(false);

  /** Status update dropdown selection */
  protected readonly pendingStatus = signal<string>('');

  /** Expose status options to template */
  protected readonly statusOptions = LIFECYCLE_STATUS_OPTIONS;

  private ticketId!: number;

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    this.ticketId = param ? parseInt(param, 10) : 0;
    if (this.ticketId) {
      this.store.loadTicketLifecycle(this.ticketId);
    }
  }

  ngOnDestroy(): void {
    this.store.teardownLifecycle();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected goToAuditVault(): void {
    this.store.navigateToAuditVault();
  }

  protected goToIssuanceConsole(): void {
    const bookingId = this.store.selectedTicket()?.bookingId;
    if (bookingId) {
      this.router.navigate([
        '/aoms/reservation-ground/ticketing-hub/issuance',
        bookingId,
      ]);
    }
  }

  // ── Status Update ─────────────────────────────────────────────────────
  protected onStatusSelectChange(event: Event): void {
    this.pendingStatus.set((event.target as HTMLSelectElement).value);
  }

  protected onApplyStatus(): void {
    const status = this.pendingStatus();
    if (!status) return;
    this.store.changeTicketStatus(this.ticketId, status);
  }

  // ── Void Flow ──────────────────────────────────────────────────────────
  protected onVoidRequested(): void {
    this.store.clearLifecycleActionState();
    this.showVoidDialog.set(true);
  }

  protected onVoidConfirmed(reason: string): void {
    this.store.executeVoiding(this.ticketId, reason);
    this.showVoidDialog.set(false);
  }

  protected onVoidCancelled(): void {
    this.showVoidDialog.set(false);
    this.store.clearLifecycleActionState();
  }

  // ── Refresh ────────────────────────────────────────────────────────────
  protected onRetry(): void {
    if (this.ticketId) this.store.loadTicketLifecycle(this.ticketId);
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  protected isCurrentlyVoided(): boolean {
    const s = (this.store.selectedTicket()?.status ?? '').toLowerCase();
    return s === 'voided' || s === 'cancelled';
  }
}