

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import {
  IContextualPricingAttributeDto,
} from '@shared-core';
import { IPricingSearchCriteria, IPricingPagination } from '../../store/dynamic-pricing.store';

const SKELETON_ROW_COUNT = 8;

// ── Attribute type options for filter dropdown ─────────────────────────────
export const ATTRIBUTE_TYPES: { label: string; value: string }[] = [
  { label: 'All Types', value: '' },
  { label: 'Booking Class', value: 'BookingClass' },
  { label: 'Loyalty Tier', value: 'FrequentFlyerTier' },
  { label: 'Days to Departure', value: 'DaysToDeparture' },
  { label: 'Seasonality', value: 'Seasonality' },
  { label: 'Route', value: 'Route' },
  { label: 'Aircraft Type', value: 'AircraftType' },
];

@Component({
  selector: 'aoms-attribute-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './attribute-grid.component.html',
  styleUrl: './attribute-grid.component.scss',
})
export class AttributeGridComponent implements OnInit, OnDestroy {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly rules = input.required<IContextualPricingAttributeDto[]>();
  readonly loading = input<boolean>(false);
  readonly pagination = input.required<IPricingPagination>();
  readonly processingId = input<number | null>(null);
  readonly currentCriteria = input.required<IPricingSearchCriteria>();

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly filtersChanged = output<Partial<IPricingSearchCriteria>>();
  readonly resetTriggered = output<void>();
  readonly editClicked = output<number>();
  readonly simulateClicked = output<IContextualPricingAttributeDto>();
  readonly deactivateClicked = output<IContextualPricingAttributeDto>();
  readonly nextPage = output<void>();
  readonly prevPage = output<void>();
  readonly pageChanged = output<number>();

  // ── Local filter state ───────────────────────────────────────────────────
  protected readonly filterType = signal<string>('');
  protected readonly filterValue = signal<string>('');
  protected readonly attributeTypes = ATTRIBUTE_TYPES;
  protected readonly skeletonRows = Array.from({ length: SKELETON_ROW_COUNT });

  private readonly _valueChange$ = new Subject<string>();
  private readonly _destroy$ = new Subject<void>();

  ngOnInit(): void {
    const c = this.currentCriteria();
    this.filterType.set(c.attributeType ?? '');
    this.filterValue.set(c.targetValue ?? '');

    this._valueChange$
      .pipe(debounceTime(380), distinctUntilChanged(), takeUntil(this._destroy$))
      .subscribe(val => {
        this.filtersChanged.emit({ targetValue: val, pageNumber: 1 });
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  protected onTypeChange(value: string): void {
    this.filterType.set(value);
    this.filtersChanged.emit({ attributeType: value, pageNumber: 1 });
  }

  protected onValueInput(value: string): void {
    this.filterValue.set(value);
    this._valueChange$.next(value);
  }

  protected onReset(): void {
    this.filterType.set('');
    this.filterValue.set('');
    this.resetTriggered.emit();
  }

  protected get hasActiveFilters(): boolean {
    return this.filterType().length > 0 || this.filterValue().trim().length > 0;
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

  protected trackById(_: number, rule: IContextualPricingAttributeDto): number {
    return rule.attributeId;
  }
}