

import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IVaultFilters } from '../../store/ticketing.store';

export const TICKET_STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Issued', value: 'Issued' },
  { label: 'Active', value: 'Active' },
  { label: 'Used', value: 'Used' },
  { label: 'Voided', value: 'Voided' },
  { label: 'Suspended', value: 'Suspended' },
  { label: 'Refunded', value: 'Refunded' },
  { label: 'Expired', value: 'Expired' },
];

@Component({
  selector: 'aoms-ticket-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-filter-panel.component.html',
  styleUrl: './ticket-filter-panel.component.scss',
})
export class TicketFilterPanelComponent implements OnChanges {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly currentFilters = input.required<IVaultFilters>();
  readonly loading = input<boolean>(false);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly filtersSubmitted = output<IVaultFilters>();
  readonly filtersCleared = output<void>();
  readonly quickLookup = output<string>();

  // ── Local draft (isolated from store until submit) ─────────────────────
  protected readonly draft = signal<IVaultFilters>({
    ticketCode: '',
    bookingReference: '',
    passengerNameContains: '',
    passengerPassport: '',
    status: '',
    issueDateFrom: '',
    issueDateTo: '',
    includeDeleted: false,
  });

  /** Quick-lookup input — separate from the main filter draft */
  protected readonly quickCode = signal<string>('');

  protected readonly statusOptions = TICKET_STATUS_OPTIONS;

  // ── Sync from parent ───────────────────────────────────────────────────
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentFilters']) {
      this.draft.set({ ...this.currentFilters() });
    }
  }

  // ── Field helpers ──────────────────────────────────────────────────────
  protected onFieldChange(field: keyof IVaultFilters, value: string | boolean): void {
    this.draft.update(f => ({ ...f, [field]: value }));
  }

  protected onSubmit(): void {
    if (this.loading()) return;
    this.filtersSubmitted.emit({ ...this.draft() });
  }

  protected onClear(): void {
    this.draft.set({
      ticketCode: '', bookingReference: '', passengerNameContains: '',
      passengerPassport: '', status: '', issueDateFrom: '', issueDateTo: '',
      includeDeleted: false,
    });
    this.filtersCleared.emit();
  }

  protected hasActiveFilters(): boolean {
    const f = this.draft();
    return !!(f.ticketCode || f.bookingReference || f.passengerNameContains ||
      f.passengerPassport || f.status || f.issueDateFrom ||
      f.issueDateTo || f.includeDeleted);
  }

  // ── Quick lookup ───────────────────────────────────────────────────────
  protected onQuickCodeChange(val: string): void {
    this.quickCode.set(val);
  }

  protected onQuickLookup(): void {
    const code = this.quickCode().trim();
    if (code) this.quickLookup.emit(code);
  }

  protected onQuickKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.onQuickLookup();
  }

  protected onFieldKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.onSubmit();
  }
}