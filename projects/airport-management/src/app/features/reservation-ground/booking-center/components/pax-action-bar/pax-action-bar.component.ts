
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

import { IPaxIndexFilters } from '../../store/booking-center.store';

@Component({
  selector: 'aoms-pax-action-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pax-action-bar.component.html',
  styleUrl: './pax-action-bar.component.scss',
})
export class PaxActionBarComponent implements OnChanges {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly currentFilters = input.required<IPaxIndexFilters>();
  readonly loading = input<boolean>(false);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly filtersSubmitted = output<IPaxIndexFilters>();
  readonly filtersReset = output<void>();
  readonly exportRequested = output<void>();

  // ── Local draft form — isolated from store until submission ───────────
  protected readonly draft = signal<IPaxIndexFilters>({
    nameContains: '',
    passportNumber: '',
    userId: '',
  });

  // ── Sync from parent signal ────────────────────────────────────────────
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentFilters']) {
      this.draft.set({ ...this.currentFilters() });
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  protected onFieldChange(field: keyof IPaxIndexFilters, value: string): void {
    this.draft.update(f => ({ ...f, [field]: value }));
  }

  protected onSubmit(): void {
    if (this.loading()) return;
    this.filtersSubmitted.emit({ ...this.draft() });
  }

  protected onReset(): void {
    this.draft.set({ nameContains: '', passportNumber: '', userId: '' });
    this.filtersReset.emit();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.onSubmit();
  }

  protected hasActiveFilters(): boolean {
    const f = this.draft();
    return !!(f.nameContains || f.passportNumber || f.userId);
  }
}