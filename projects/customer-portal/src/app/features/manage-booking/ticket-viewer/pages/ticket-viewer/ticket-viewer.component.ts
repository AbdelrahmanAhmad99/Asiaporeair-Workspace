// ============================================================================
// ticket-viewer.component.ts
// Asiaporeair | "E-Ticket" — Ticket Viewer Smart Page
// ============================================================================

import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, inject, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger, keyframes
} from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { ManageBookingStore } from '../../../store/manage-booking.store';
import { TicketService, ITicketDetailDto } from '@shared-core';

import { ETicketHeaderComponent } from '../../components/e-ticket-header/e-ticket-header.component';
import { TicketQrCodeComponent } from '../../components/ticket-qr-code/ticket-qr-code.component';
import { ItinerarySummaryRowComponent } from '../../components/itinerary-summary-row/itinerary-summary-row.component';
import { PassengerTicketCardComponent } from '../../components/passenger-ticket-card/passenger-ticket-card.component';
import { TicketSecurityInfoComponent } from '../../components/ticket-security-info/ticket-security-info.component';

// ── Animations ────────────────────────────────────────────────────────────────
const TICKET_ANIMATIONS = [
  trigger('ticketUnfold', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-30px) scaleY(0.96)' }),
      animate('600ms cubic-bezier(0.22,1,0.36,1)',
        style({ opacity: 1, transform: 'translateY(0) scaleY(1)' }))
    ])
  ]),
  trigger('sectionsReveal', [
    transition(':enter', [
      query('.ticket-section', [
        style({ opacity: 0, transform: 'translateY(18px)' }),
        stagger(80, [
          animate('440ms cubic-bezier(0.22,1,0.36,1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('fadeIn', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('300ms ease-out', style({ opacity: 1 }))
    ])
  ]),
  trigger('goldGlow', [
    transition(':enter', [
      animate('800ms ease-out', keyframes([
        style({ opacity: 0, boxShadow: '0 0 0px rgba(182,143,36,0)', offset: 0 }),
        style({ opacity: 1, boxShadow: '0 0 28px rgba(182,143,36,0.4)', offset: 0.5 }),
        style({ opacity: 1, boxShadow: '0 0 12px rgba(182,143,36,0.15)', offset: 1 })
      ]))
    ])
  ])
];

@Component({
  selector: 'app-ticket-viewer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ETicketHeaderComponent,
    TicketQrCodeComponent,
    ItinerarySummaryRowComponent,
    PassengerTicketCardComponent,
    TicketSecurityInfoComponent
  ],
  animations: TICKET_ANIMATIONS,
  templateUrl: './ticket-viewer.component.html',
  styleUrls: ['./ticket-viewer.component.scss']
})
export class TicketViewerComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────────
  private readonly store = inject(ManageBookingStore);
  private readonly ticketService = inject(TicketService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  // ── Store aliases ─────────────────────────────────────────────────────────
  readonly ticket = this.store.activeTicket;
  readonly isLoading = this.store.ticketLoading;
  readonly ticketError = this.store.ticketError;
  readonly isPrinting = this.store.isPrinting;
  readonly isValid = this.store.activeTicketIsValid;
  readonly paxName = this.store.activeTicketPassengerName;

  // ── Local state ───────────────────────────────────────────────────────────
  private ticketCode = '';
  readonly isSecurityExpanded = signal(false);

  // ── Computed helpers ──────────────────────────────────────────────────────

  readonly statusBadge = computed(() => {
    const status = this.ticket()?.status?.toLowerCase() ?? '';
    if (status === 'valid' || status === 'confirmed' || status === 'issued')
      return { label: 'Valid E-Ticket', cls: 'badge--valid' };
    if (status === 'voided' || status === 'cancelled')
      return { label: 'Voided', cls: 'badge--void' };
    if (status === 'checkedin')
      return { label: 'Checked In', cls: 'badge--checkin' };
    if (status === 'boarded')
      return { label: 'Boarded', cls: 'badge--boarded' };
    return { label: status || 'Unknown', cls: 'badge--default' };
  });

  readonly issueDateDisplay = computed(() => {
    const raw = this.ticket()?.issueDate;
    if (!raw) return '';
    return new Date(raw).toLocaleDateString('en-SG', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  });

  readonly skeletonRows = [1, 2, 3, 4];

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.ticketCode = this.route.snapshot.paramMap.get('code') ?? '';
    this.store.resetTicketState();
    this.loadTicket();
  }

  ngOnDestroy(): void {
    this.store.resetTicketState();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Private Loaders ───────────────────────────────────────────────────────

  private loadTicket(): void {
    if (!this.ticketCode) {
      this.store.setTicketError('No ticket code provided. Please return to your booking details.');
      return;
    }

    this.store.setTicketLoading(true);
    this.store.setTicketError(null);

    this.ticketService
      .getTicketDetailsByCode(this.ticketCode)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.store.setTicketLoading(false)),
        catchError(err => {
          this.store.setTicketError(this.resolveError(err));
          return of(null);
        })
      )
      .subscribe(ticket => {
        if (ticket) this.store.setActiveTicket(ticket);
      });
  }

  private resolveError(err: any): string {
    switch (err?.status) {
      case 401: return 'Please sign in to view this ticket.';
      case 403: return 'Access to this ticket is restricted.';
      case 404: return `Ticket code "${this.ticketCode}" was not found. Please check your booking confirmation.`;
      default: return 'Unable to load your e-ticket. Please try again.';
    }
  }

  // ── Public Actions ────────────────────────────────────────────────────────

  onBack(): void {
    const bookingId = this.ticket()?.bookingId;
    if (bookingId) {
      this.router.navigate(['/manage-booking/booking', bookingId]);
    } else {
      this.router.navigate(['/manage-booking/my-trips']);
    }
  }

  onPrintTicket(): void {
    this.store.triggerPrint();
  }

  onDownloadPdf(): void {
    // Placeholder — integrate with a PDF generation service in production
    console.log('[TicketViewer] Download PDF for:', this.ticketCode);
    window.print(); // fallback: browser's save-as-PDF
  }

  onAddToWallet(): void {
    // Placeholder — integrate with Apple Wallet / Google Wallet passkit API
    console.log('[TicketViewer] Add to Wallet:', this.ticketCode);
  }

  onViewBookingDetails(): void {
    const bookingId = this.ticket()?.bookingId ?? this.ticket()?.bookingReference;
    if (bookingId) {
      this.router.navigate(['/manage-booking/booking', bookingId]);
    }
  }


  // ── Template helpers ──────────────────────────────────────────────────────

  /** Array used by *ngFor to render the perforation tear-line dots. */
  readonly perforationDots = Array.from({ length: 48 });

  /** Expose Math to template for any inline calculations. */
  readonly Math = Math;
}