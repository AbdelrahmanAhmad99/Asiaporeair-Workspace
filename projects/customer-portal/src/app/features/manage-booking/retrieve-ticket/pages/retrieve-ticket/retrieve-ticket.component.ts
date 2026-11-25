// ============================================================================
// retrieve-ticket.component.ts
// Asiaporeair | "Locate Your Electronic Ticket" — Smart Page
// ============================================================================

import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, inject
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';
import { Subject, takeUntil } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { ManageBookingStore } from '../../../store/manage-booking.store';
import { TicketService } from '@shared-core';

import { PnrLookupFormComponent } from '../../components/pnr-lookup-form/pnr-lookup-form.component';
import { RetrievalHelperCardComponent } from '../../components/retrieval-helper-card/retrieval-helper-card.component';
import { QuickLinksPanelComponent } from '../../components/quick-links-panel/quick-links-panel.component';

// ── Page Entry Animations ─────────────────────────────────────────────────────
const PAGE_ANIMATIONS = [
  trigger('pageReveal', [
    transition(':enter', [
      query('.rt-animate', [
        style({ opacity: 0, transform: 'translateY(28px)' }),
        stagger(90, [
          animate('500ms cubic-bezier(0.22,1,0.36,1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('fadeUp', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
      animate('480ms cubic-bezier(0.22,1,0.36,1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ])
];

// ── Form Value Contract ───────────────────────────────────────────────────────
export interface ITicketLookupFormValue {
  /** 6–13 alphanumeric ticket code (the only field sent to the API). */
  ticketCode: string;
  /** Passenger last name — validated client-side only, not sent to the API. */
  lastName: string;
}

@Component({
  selector: 'app-retrieve-ticket',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    PnrLookupFormComponent,
    RetrievalHelperCardComponent,
    QuickLinksPanelComponent
  ],
  animations: PAGE_ANIMATIONS,
  templateUrl: './retrieve-ticket.component.html',
  styleUrls: ['./retrieve-ticket.component.scss']
})
export class RetrieveTicketComponent implements OnInit, OnDestroy {

  // ── DI ──────────────────────────────────────────────────────────────────────
  private readonly store = inject(ManageBookingStore);
  private readonly ticketSvc = inject(TicketService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  // ── Store Aliases (exposed to template) ─────────────────────────────────────
  /** True while the ticket API call is in-flight. */
  readonly isRetrieving = this.store.isRetrieving;
  /** High-end error string from a failed ticket lookup. */
  readonly retrievalError = this.store.retrievalError;

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Reset any stale state from a prior lookup session.
    this.store.resetRetrievalState();
  }

  ngOnDestroy(): void {
    this.store.resetRetrievalState();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Event Handlers ───────────────────────────────────────────────────────────

  /**
   * Called when the PnrLookupForm emits a valid `ITicketLookupFormValue`.
   *
   * Flow:
   *   1. Mark the store as loading → drives skeleton overlay in template.
   *   2. Call `ticketService.getTicketDetailsByCode()` with the ticket code only.
   *   3. On success → store the ticket in ManageBookingStore, then navigate to viewer.
   *   4. On error   → resolve a premium error message and surface it via store.
   */
  onTicketLookupSubmit(formValue: ITicketLookupFormValue): void {
    const { ticketCode, lastName } = formValue;

    // Client-side last-name validation (not sent to API — used as a gate here)
    if (!lastName?.trim()) {
      this.store.setRetrievalError(
        'Please provide your last name as it appears on your travel document.'
      );
      return;
    }

    // Begin retrieval sequence
    this.store.setIsRetrieving(true);
    this.store.setRetrievalError(null);

    this.ticketSvc
      .getTicketDetailsByCode(ticketCode.trim().toUpperCase())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.store.setIsRetrieving(false)),
        catchError((err: HttpErrorResponse) => {
          this.store.setRetrievalError(this.resolveRetrievalError(err));
          return of(null);
        })
      )
      .subscribe(ticket => {
        if (!ticket) return;

        // Store the full ticket detail in the centralised store
        this.store.setActiveTicket(ticket);

        // Navigate to the ticket viewer — uses ticketCode as the route param
        this.router.navigate(
          ['/manage-booking/ticket', ticket.ticketCode]
        );
      });
  }

  /** Navigates to the flight-status page (public). */
  onCheckFlightStatus(): void {
    this.router.navigate(['/flights/status']);
  }

  /** Navigates to the login/access-your-suite page. */
  onAccessSuite(): void {
    this.router.navigate(['/auth/login']);
  }

  // ── Private Helpers ──────────────────────────────────────────────────────────

  /**
   * Maps HTTP error status codes to premium-grade, concierge-toned messages.
   */
  private resolveRetrievalError(err: HttpErrorResponse): string {
    switch (err?.status) {
      case 400: return 'The ticket reference you provided appears to be invalid. Please verify and try again.';
      case 404: return 'We were unable to locate an electronic ticket with that reference. Please check your booking confirmation email.';
      case 422: return 'Your journey credentials could not be verified. Please ensure details match your travel document exactly.';
      default: return 'We encountered a temporary issue while locating your e-ticket. Please try again in a moment.';
    }
  }
}
