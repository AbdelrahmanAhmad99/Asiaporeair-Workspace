
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { TicketSecurityBadgeComponent } from '../ticket-security-badge/ticket-security-badge.component';
import { ITicketDetailDto } from '@shared-core';

export const VIRTUAL_ROW_HEIGHT = 40;

export const STATUS_UPDATE_OPTIONS = [
  { label: 'Issued', value: 'Issued' },
  { label: 'Active', value: 'Active' },
  { label: 'Used', value: 'Used' },
  { label: 'Suspended', value: 'Suspended' },
];

@Component({
  selector: 'aoms-ticket-audit-grid',
  standalone: true,
  imports: [
    CommonModule,
    ScrollingModule,
    TicketSecurityBadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-audit-grid.component.html',
  styleUrl: './ticket-audit-grid.component.scss',
})
export class TicketAuditGridComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly tickets = input.required<ITicketDetailDto[]>();
  readonly loading = input<boolean>(false);
  readonly hasSearched = input<boolean>(false);
  readonly actionLoading = input<boolean>(false);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly statusUpdateRequested = output<{ ticketId: number; newStatus: string }>();
  readonly voidRequested = output<ITicketDetailDto>();

  // ── Constants exposed to template ─────────────────────────────────────
  protected readonly rowHeight = VIRTUAL_ROW_HEIGHT;
  protected readonly statusOptions = STATUS_UPDATE_OPTIONS;

  // ── Computed ───────────────────────────────────────────────────────────
  readonly isEmpty = computed<boolean>(
    () => this.hasSearched() && this.tickets().length === 0 && !this.loading()
  );

  /** CDK virtual scroll needs a fixed container height; calc from viewport. */
  readonly gridHeight = computed<string>(() => {
    const count = this.tickets().length;
    if (count === 0) return '0px';
    // Cap at 600px or render all rows if fewer
    const maxRows = Math.min(count, 15);
    return `${maxRows * VIRTUAL_ROW_HEIGHT}px`;
  });

  // ── Helpers ────────────────────────────────────────────────────────────
  protected isVoided(ticket: ITicketDetailDto): boolean {
    const s = (ticket.status ?? '').toLowerCase();
    return s === 'voided' || s === 'cancelled';
  }

  protected isVoidable(ticket: ITicketDetailDto): boolean {
    const s = (ticket.status ?? '').toLowerCase();
    return !['voided', 'cancelled', 'used', 'expired'].includes(s);
  }

  protected formatDate(d: string | Date | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  protected onStatusChange(ticket: ITicketDetailDto, event: Event): void {
    const newStatus = (event.target as HTMLSelectElement).value;
    if (newStatus) {
      this.statusUpdateRequested.emit({ ticketId: ticket.ticketId, newStatus });
    }
  }

  protected onVoid(ticket: ITicketDetailDto, event: Event): void {
    event.stopPropagation();
    this.voidRequested.emit(ticket);
  }

  protected trackByTicketId(_: number, t: ITicketDetailDto): number {
    return t.ticketId;
  }
}