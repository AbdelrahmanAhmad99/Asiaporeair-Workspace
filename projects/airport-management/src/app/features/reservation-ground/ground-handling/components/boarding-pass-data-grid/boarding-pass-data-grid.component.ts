
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IBoardingPassDto } from '@shared-core';

@Component({
  selector: 'aoms-boarding-pass-data-grid',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './boarding-pass-data-grid.component.html',
  styleUrl: './boarding-pass-data-grid.component.scss',
})
export class BoardingPassDataGridComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly passes = input.required<IBoardingPassDto[]>();
  readonly loading = input<boolean>(false);
  readonly hasSearched = input<boolean>(false);
  readonly selectedPassId = input<number | null>(null);
  readonly voidLoading = input<boolean>(false);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly passSelected = output<IBoardingPassDto>();
  readonly voidRequested = output<IBoardingPassDto>();

  // ── Computed ───────────────────────────────────────────────────────────
  readonly isEmpty = computed<boolean>(
    () => this.hasSearched() && !this.loading() && this.passes().length === 0
  );

  // ── Helpers ────────────────────────────────────────────────────────────
  protected isSelected(passId: number): boolean {
    return this.selectedPassId() === passId;
  }

  protected onRowClick(pass: IBoardingPassDto): void {
    this.passSelected.emit(pass);
  }

  protected onRowKeydown(event: KeyboardEvent, pass: IBoardingPassDto): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.passSelected.emit(pass);
    }
  }

  protected onVoidClick(pass: IBoardingPassDto, event: Event): void {
    event.stopPropagation();
    this.voidRequested.emit(pass);
  }

  protected trackByPassId(_: number, p: IBoardingPassDto): number {
    return p.passId;
  }

  protected formatTime(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit',
    });
  }
}