
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

import { BookingCenterStore } from '../../store/booking-center.store';
import { PnrBookingStatusCardComponent } from '../../components/pnr-booking-status-card/pnr-booking-status-card.component';
import { BookingActionBarComponent } from '../../components/booking-action-bar/booking-action-bar.component';
import { PassengerManifestTableComponent } from '../../components/passenger-manifest-table/passenger-manifest-table.component';
import { PnrTimelineStepperComponent } from '../../components/pnr-timeline-stepper/pnr-timeline-stepper.component';

@Component({
  selector: 'aoms-pnr-deep-explorer',
  standalone: true,
  imports: [
    CommonModule,
    PnrBookingStatusCardComponent,
    BookingActionBarComponent,
    PassengerManifestTableComponent,
    PnrTimelineStepperComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pnr-deep-explorer.component.html',
  styleUrl: './pnr-deep-explorer.component.scss',
})
export class PnrDeepExplorerComponent implements OnInit, OnDestroy {
  protected readonly store = inject(BookingCenterStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  /** Controls the Cancel Confirmation Modal */
  protected readonly showCancelModal = signal<boolean>(false);
  /** Controls the Update Status Modal */
  protected readonly showStatusModal = signal<boolean>(false);
  /** Local state for the new status selection inside the modal */
  protected readonly pendingStatus = signal<string>('');
  /** Local cancel reason text */
  protected readonly cancelReason = signal<string>('');

  private bookingId!: number;

  // ── Status options for the patch modal ───────────────────────────────
  protected readonly statusOptions = [
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Waitlisted', value: 'Waitlisted' },
    { label: 'Refunded', value: 'Refunded' },
  ];

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    // The route param is named 'pnr' in booking-center.routes.ts
    const idParam = this.route.snapshot.paramMap.get('pnr');
    this.bookingId = idParam ? parseInt(idParam, 10) : 0;
    if (this.bookingId) {
      this.store.loadFullPnrData(this.bookingId);
    }
  }

  ngOnDestroy(): void {
    this.store.teardownExplorer();
  }

  // ── Dark Mode ──────────────────────────────────────────────────────────
  protected toggleDarkMode(): void {
    const next = !this.isDarkMode();
    document.documentElement.classList.toggle('aoms-dark', next);
    this.isDarkMode.set(next);
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  protected goBack(): void {
    this.store.navigateToSearchTerminal();
  }

  protected onRetry(): void {
    if (this.bookingId) this.store.loadFullPnrData(this.bookingId);
  }

  // ── Cancel Booking Flow ────────────────────────────────────────────────
  protected onCancelRequested(): void {
    this.cancelReason.set('');
    this.store.clearExplorerActionState();
    this.showCancelModal.set(true);
  }

  protected onCancelConfirmed(): void {
    this.store.triggerCancelBooking(this.bookingId, this.cancelReason() || undefined);
    this.showCancelModal.set(false);
  }

  protected onCancelDismissed(): void {
    this.showCancelModal.set(false);
    this.cancelReason.set('');
    this.store.clearExplorerActionState();
  }

  protected onCancelReasonChanged(reason: string): void {
    this.cancelReason.set(reason);
  }

  // ── Update Status Flow ─────────────────────────────────────────────────
  protected onUpdateStatusRequested(): void {
    const currentStatus = this.store.activeBooking()?.paymentStatus ?? '';
    this.pendingStatus.set(currentStatus);
    this.store.clearExplorerActionState();
    this.showStatusModal.set(true);
  }

  protected onStatusUpdateConfirmed(): void {
    const status = this.pendingStatus();
    if (!status) return;
    this.store.patchBookingStatus(this.bookingId, status);
    this.showStatusModal.set(false);
  }

  protected onStatusUpdateDismissed(): void {
    this.showStatusModal.set(false);
    this.store.clearExplorerActionState();
  }

  protected onPendingStatusChanged(status: string): void {
    this.pendingStatus.set(status);
  }

  // ── Issue Tickets Navigation ───────────────────────────────────────────
  protected onIssueTicketsRequested(): void {
    // Navigate to Ticket Issuance Console
    this.router.navigate(['/aoms/reservation-ground/ticketing-hub/issuance', this.bookingId]);
  }
}