
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { TicketingStore } from '../../store/ticketing.store';
import { TicketIssuanceProgressComponent } from '../../components/ticket-issuance-progress/ticket-issuance-progress.component';
import { ElectronicTicketPreviewComponent } from '../../components/electronic-ticket-preview/electronic-ticket-preview.component';
import { ITicketDto } from '@shared-core';

@Component({
  selector: 'aoms-ticket-issuance-console',
  standalone: true,
  imports: [
    CommonModule,
    TicketIssuanceProgressComponent,
    ElectronicTicketPreviewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-issuance-console.component.html',
  styleUrl: './ticket-issuance-console.component.scss',
})
export class TicketIssuanceConsoleComponent implements OnInit, OnDestroy {
  protected readonly store = inject(TicketingStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly isDarkMode = signal<boolean>(
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('aoms-dark')
  );

  /** Controls the issuance confirmation modal */
  protected readonly showConfirmModal = signal<boolean>(false);

  private bookingId!: number;

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('bookingId');
    this.bookingId = param ? parseInt(param, 10) : 0;
    if (this.bookingId) {
      this.store.loadBookingContext(this.bookingId);
    }
  }

  ngOnDestroy(): void {
    this.store.teardown();
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

  protected viewPnrExplorer(): void {
    this.store.navigateToPnrExplorer();
  }

  protected onPrint(): void {
    window.print();
  }

  // ── Issuance Flow ──────────────────────────────────────────────────────
  protected onGenerateClicked(): void {
    if (!this.store.canIssue()) return;
    this.showConfirmModal.set(true);
  }

  protected onIssuanceConfirmed(): void {
    this.showConfirmModal.set(false);
    this.store.initiateIssuance(this.bookingId);
  }

  protected onIssuanceDismissed(): void {
    this.showConfirmModal.set(false);
  }

  protected onRetry(): void {
    this.store.resetForRetry();
  }

  // ── Ticket selection (for keyboard navigation in preview grid) ─────────
  protected trackByTicketId(_: number, t: ITicketDto): number {
    return t.ticketId;
  }
}