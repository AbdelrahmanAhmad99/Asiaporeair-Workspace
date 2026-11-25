

import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type FidsView = 'DEPARTURES' | 'ARRIVALS';

export interface IFidsFilterChange {
  gateFilter?: string;
  statusFilter?: string;
  airlineFilter?: string;
}

const FIDS_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'SCHEDULED', label: ' Scheduled' },
  { value: 'ON_TIME', label: ' On Time' },
  { value: 'BOARDING', label: ' Boarding' },
  { value: 'DELAYED', label: ' Delayed' },
  { value: 'DEPARTED', label: ' Departed' },
  { value: 'ARRIVED', label: ' Arrived' },
  { value: 'CANCELLED', label: ' Cancelled' },
  { value: 'DIVERTED', label: ' Diverted' },
];

// Common SIN terminals + generic options for other airports
const GATEWAY_OPTIONS = ['', 'T1', 'T2', 'T3', 'T4', 'A', 'B', 'C', 'D', 'E'];

@Component({
  selector: 'aoms-fids-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fids-filter-bar.component.html',
  styleUrl: './fids-filter-bar.component.scss',
})
export class FidsFilterBarComponent {
  // ── Inputs ─────────────────────────────────────────────────────────────
  readonly activeView = input.required<FidsView>();
  readonly hasFidsFilter = input<boolean>(false);
  readonly boardingCount = input<number>(0);
  readonly delayedCount = input<number>(0);
  readonly airportCode = input<string>('SIN');
  readonly lastRefresh = input<string>('Never');
  readonly isLoading = input<boolean>(false);

  // ── Outputs ────────────────────────────────────────────────────────────
  readonly onViewToggle = output<FidsView>();
  readonly onFilterChange = output<IFidsFilterChange>();
  readonly onClearFilters = output<void>();
  readonly onAirportChange = output<string>();
  readonly onRefresh = output<void>();

  // ── Local state ───────────────────────────────────────────────────────
  protected readonly gateInput = signal<string>('');
  protected readonly statusInput = signal<string>('');
  protected readonly airlineInput = signal<string>('');
  protected readonly airportInput = signal<string>('SIN');

  protected readonly statuses = FIDS_STATUSES;
  protected readonly gatewayOpts = GATEWAY_OPTIONS;

  protected onGateChange(v: string): void {
    this.gateInput.set(v.toUpperCase());
    this.onFilterChange.emit({ gateFilter: v.toUpperCase() });
  }

  protected onStatusChange(v: string): void {
    this.statusInput.set(v);
    this.onFilterChange.emit({ statusFilter: v });
  }

  protected onAirlineChange(v: string): void {
    this.airlineInput.set(v);
    this.onFilterChange.emit({ airlineFilter: v });
  }

  protected onAirportInputChange(v: string): void {
    this.airportInput.set(v.toUpperCase().slice(0, 4));
  }

  protected applyAirport(): void {
    const code = this.airportInput().trim();
    if (code && code !== this.airportCode()) {
      this.onAirportChange.emit(code);
    }
  }

  protected clearAll(): void {
    this.gateInput.set('');
    this.statusInput.set('');
    this.airlineInput.set('');
    this.onClearFilters.emit();
  }
}