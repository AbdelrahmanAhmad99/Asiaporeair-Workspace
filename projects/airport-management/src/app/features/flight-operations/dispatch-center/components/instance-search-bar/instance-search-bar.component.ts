
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IDispatchSearchFilters,
  FlightInstanceStatus,
  DEFAULT_DISPATCH_FILTERS,
} from '../../store/flight-dispatch.store';

interface IStatusOption { value: FlightInstanceStatus | ''; label: string; }

@Component({
  selector: 'aoms-instance-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './instance-search-bar.component.html',
  styleUrl: './instance-search-bar.component.scss',
})
export class InstanceSearchBarComponent {
  readonly loading = input<boolean>(false);
  readonly hasActiveFilter = input<boolean>(false);

  readonly onFilterChange = output<Partial<IDispatchSearchFilters>>();
  readonly onReset = output<void>();

  // ── Local display state ─────────────────────────────────────────────────
  protected readonly dateFrom = signal<string>(DEFAULT_DISPATCH_FILTERS.dateFrom);
  protected readonly dateTo = signal<string>(DEFAULT_DISPATCH_FILTERS.dateTo);
  protected readonly flightNoVal = signal<string>('');
  protected readonly airportVal = signal<string>('');
  protected readonly statusVal = signal<string>('');

  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly statusOptions: IStatusOption[] = [
    { value: '', label: 'All Statuses' },
    { value: 'SCHEDULED', label: ' Scheduled' },
    { value: 'DELAYED', label: ' Delayed' },
    { value: 'BOARDING', label: ' Boarding' },
    { value: 'IN_FLIGHT', label: ' In Flight' },
    { value: 'ARRIVED', label: ' Arrived' },
    { value: 'CANCELLED', label: ' Cancelled' },
    { value: 'DIVERTED', label: ' Diverted' },
  ];

  protected onDateFromChange(v: string): void {
    this.dateFrom.set(v);
    this.onFilterChange.emit({ dateFrom: v });
  }

  protected onDateToChange(v: string): void {
    this.dateTo.set(v);
    this.onFilterChange.emit({ dateTo: v });
  }

  protected onFlightNoInput(v: string): void {
    const upper = v.toUpperCase();
    this.flightNoVal.set(upper);
    this._debounce({ flightNo: upper });
  }

  protected onAirportInput(v: string): void {
    const upper = v.toUpperCase().slice(0, 4);
    this.airportVal.set(upper);
    this._debounce({ airportCode: upper });
  }

  protected onStatusChange(v: string): void {
    this.statusVal.set(v);
    this.onFilterChange.emit({ status: v ? (v as FlightInstanceStatus) : null });
  }

  protected reset(): void {
    this.dateFrom.set(DEFAULT_DISPATCH_FILTERS.dateFrom);
    this.dateTo.set(DEFAULT_DISPATCH_FILTERS.dateTo);
    this.flightNoVal.set('');
    this.airportVal.set('');
    this.statusVal.set('');
    this.onReset.emit();
  }

  private _debounce(partial: Partial<IDispatchSearchFilters>): void {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => this.onFilterChange.emit(partial), 280);
  }
}
