
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IFareBasisCodeDto } from '@shared-core';
import { IFarePagination } from '../../store/fare-engine.store';

// Skeleton rows shown during load
const SKELETON_ROW_COUNT = 8;

@Component({
  selector: 'aoms-fare-inventory-grid',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fare-inventory-grid.component.html',
  styleUrl: './fare-inventory-grid.component.scss',
})
export class FareInventoryGridComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly fares = input.required<IFareBasisCodeDto[]>();
  readonly loading = input<boolean>(false);
  readonly pagination = input.required<IFarePagination>();
  readonly processingCode = input<string | null>(null);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly editClicked = output<string>();
  readonly deleteClicked = output<IFareBasisCodeDto>();
  readonly nextPage = output<void>();
  readonly prevPage = output<void>();
  readonly pageChanged = output<number>();

  // ── Skeleton helpers ─────────────────────────────────────────────────────
  protected readonly skeletonRows = Array.from({ length: SKELETON_ROW_COUNT });

  // ── Cabin class badge color mapping ──────────────────────────────────────
  protected getCabinBadgeClass(cabinClass: string): string {
    const map: Record<string, string> = {
      Suites: 'fig-badge--suites',
      First: 'fig-badge--first',
      Business: 'fig-badge--business',
      PremiumEconomy: 'fig-badge--premium',
      Economy: 'fig-badge--economy',
    };
    return map[cabinClass] ?? 'fig-badge--default';
  }

  // ── Multiplier visual helpers ─────────────────────────────────────────────
  protected getMultiplierClass(multiplier: number): string {
    if (multiplier >= 2) return 'fig-multiplier--high';
    if (multiplier >= 1.5) return 'fig-multiplier--mid';
    return 'fig-multiplier--low';
  }

  // ── Pagination helpers ────────────────────────────────────────────────────
  protected get canPrevPage(): boolean {
    return this.pagination().currentPage > 1;
  }

  protected get canNextPage(): boolean {
    return this.pagination().currentPage < this.pagination().totalPages;
  }

  protected get pageNumbers(): number[] {
    const { currentPage, totalPages } = this.pagination();
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    return range;
  }

  // ── Track by ─────────────────────────────────────────────────────────────
  protected trackByCode(_: number, fare: IFareBasisCodeDto): string {
    return fare.code;
  }
}