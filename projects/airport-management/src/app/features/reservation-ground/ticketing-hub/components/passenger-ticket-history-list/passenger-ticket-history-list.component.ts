
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { TicketSecurityBadgeComponent } from '../ticket-security-badge/ticket-security-badge.component';
import { ITicketDto } from '@shared-core';

/** Enriched ticket shape produced by the store's enrichedHistory computed. */
export interface IEnrichedHistoryTicket extends ITicketDto {
  issueDateFormatted: string;
  isCurrent: boolean;
}

@Component({
  selector: 'aoms-passenger-ticket-history-list',
  standalone: true,
  imports: [CommonModule, TicketSecurityBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './passenger-ticket-history-list.component.html',
  styleUrl: './passenger-ticket-history-list.component.scss',
})
export class PassengerTicketHistoryListComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly history = input.required<IEnrichedHistoryTicket[]>();
  readonly currentTicketId = input.required<number>();

  // ── Computed ───────────────────────────────────────────────────────────

  /** Total tickets in the history list (for header count badge). */
  readonly totalCount = computed<number>(() => this.history().length);

  /** Count of voided / cancelled tickets — key audit signal. */
  readonly voidedCount = computed<number>(() =>
    this.history().filter(t => {
      const s = (t.status ?? '').toLowerCase();
      return s === 'voided' || s === 'cancelled';
    }).length
  );

  /** Flags a suspicious pattern: >30% of tickets voided. */
  readonly hasHighVoidRate = computed<boolean>(() => {
    const total = this.totalCount();
    if (total < 3) return false;
    return this.voidedCount() / total > 0.3;
  });

  readonly hasHistory = computed<boolean>(() => this.history().length > 0);

  // ── Helpers ────────────────────────────────────────────────────────────
  protected isVoided(ticket: IEnrichedHistoryTicket): boolean {
    const s = (ticket.status ?? '').toLowerCase();
    return s === 'voided' || s === 'cancelled';
  }

  protected trackById(_: number, t: IEnrichedHistoryTicket): number {
    return t.ticketId;
  }
}