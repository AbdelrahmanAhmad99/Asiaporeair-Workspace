
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IFlightInstanceDto, IFlightInstanceFilterDto } from '@shared-core';
import { ITrcPagination } from '../../store/tactical-trc.store';

export const FLIGHT_STATUS_CONFIG: Record<string, { label: string; cssClass: string }> = {
  Scheduled: { label: 'Scheduled', cssClass: 'status--sched' },
  Boarding: { label: 'Boarding', cssClass: 'status--boarding' },
  Departed: { label: 'Departed', cssClass: 'status--dep' },
  Arrived: { label: 'Arrived', cssClass: 'status--arr' },
  Delayed: { label: 'Delayed', cssClass: 'status--delayed' },
  Cancelled: { label: 'Cancelled', cssClass: 'status--cancel' },
  Diverted: { label: 'Diverted', cssClass: 'status--diverted' },
  OnGround: { label: 'On Ground', cssClass: 'status--ground' },
};

@Component({
  selector: 'aoms-flight-selection-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './flight-selection-bar.component.html',
  styleUrl: './flight-selection-bar.component.scss',
})
export class FlightSelectionBarComponent {
  readonly flights = input.required<IFlightInstanceDto[]>();
  readonly pagination = input<ITrcPagination | null>(null);
  readonly selectedFlightId = input<number | null>(null);
  readonly loading = input<boolean>(false);
  readonly error = input<string | null>(null);

  readonly flightSelected = output<IFlightInstanceDto>();
  readonly filterChanged = output<Partial<IFlightInstanceFilterDto>>();
  readonly resetFilter = output<void>();
  readonly nextPage = output<void>();
  readonly prevPage = output<void>();
  readonly refresh = output<void>();

  protected readonly statusConfig = FLIGHT_STATUS_CONFIG;
  protected readonly shimmerRows = Array(6).fill(null);

  // Filter fields
  protected flightNoSearch = signal('');
  protected originSearch = signal('');
  protected destSearch = signal('');
  protected statusFilter = signal('');
  protected startDate = signal('');
  protected endDate = signal('');

  private _searchTimer?: ReturnType<typeof setTimeout>;

  protected readonly isFiltered = computed(() =>
    !!(this.flightNoSearch() || this.originSearch() || this.destSearch() ||
      this.statusFilter() || this.startDate() || this.endDate())
  );

  protected statusMeta(status: string) {
    return FLIGHT_STATUS_CONFIG[status] ?? { label: status, cssClass: 'status--sched' };
  }

  protected formatDep(dt: string | Date): string {
    if (!dt) return '—';
    const d = new Date(dt);
    return d.toLocaleString('en-SG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  protected onFlightNoInput(val: string): void {
    this.flightNoSearch.set(val);
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => this.filterChanged.emit({ flightNo: val || undefined }), 300);
  }

  protected onOriginInput(val: string): void {
    this.originSearch.set(val.toUpperCase());
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => this.filterChanged.emit({ originIata: val.toUpperCase() || undefined }), 300);
  }

  protected onDestInput(val: string): void {
    this.destSearch.set(val.toUpperCase());
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => this.filterChanged.emit({ destinationIata: val.toUpperCase() || undefined }), 300);
  }

  protected onStatusChange(val: string): void {
    this.statusFilter.set(val);
    this.filterChanged.emit({ status: val || undefined });
  }

  protected onStartDate(val: string): void {
    this.startDate.set(val);
    this.filterChanged.emit({ startDate: val || undefined });
  }

  protected onEndDate(val: string): void {
    this.endDate.set(val);
    this.filterChanged.emit({ endDate: val || undefined });
  }

  protected onClearFilters(): void {
    this.flightNoSearch.set('');
    this.originSearch.set('');
    this.destSearch.set('');
    this.statusFilter.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.resetFilter.emit();
  }

  protected readonly pageNumbers = computed<number[]>(() => {
    const p = this.pagination();
    if (!p) return [];
    const total = p.totalPages;
    const curr = p.page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: number[] = [1];
    if (curr > 3) pages.push(-1);
    for (let i = Math.max(2, curr - 1); i <= Math.min(total - 1, curr + 1); i++) pages.push(i);
    if (curr < total - 2) pages.push(-2);
    pages.push(total);
    return pages;
  });
}