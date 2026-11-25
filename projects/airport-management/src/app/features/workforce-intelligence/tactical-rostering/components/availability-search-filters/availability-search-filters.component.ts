
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

// Imported from the store (co-located type)
export type CrewRank = 'captain' | 'first-officer' | 'lead-purser' | 'purser' | 'senior-attendant' | 'attendant' | '';

export interface IAvailabilitySearchCriteria {
  mode: 'flight' | 'freeform';
  flightInstanceId?: number;
  flightDepartureTime?: string;
  flightArrivalTime?: string;
  requiredPosition?: string;
  requiredBaseAirportIata?: string;
  requiredAircraftTypeId?: number;
  baseAirportIata?: string;
  rank?: CrewRank;
  date?: string;
  showInactiveOnly?: boolean;
}

interface IRankOption { value: CrewRank; label: string; iconPath: string; }

const RANK_OPTIONS: IRankOption[] = [
  {
    value: '',
    label: 'All Ranks',
    iconPath: 'M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0z',
  },
  {
    value: 'captain',
    label: 'Captain',
    iconPath: 'M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0',
  },
  {
    value: 'first-officer',
    label: 'First Officer',
    iconPath: 'M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5',
  },
  {
    value: 'lead-purser',
    label: 'Lead Purser',
    iconPath: 'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5z',
  },
  {
    value: 'purser',
    label: 'Purser',
    iconPath: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  },
  {
    value: 'senior-attendant',
    label: 'Senior Attendant',
    iconPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  },
  {
    value: 'attendant',
    label: 'Cabin Crew',
    iconPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  },
];

@Component({
  selector: 'aoms-availability-search-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './availability-search-filters.component.html',
  styleUrl: './availability-search-filters.component.scss',
})
export class AvailabilitySearchFiltersComponent {
  readonly isLoading = input<boolean>(false);

  readonly searchSubmitted = output<IAvailabilitySearchCriteria>();
  readonly resetTriggered = output<void>();

  protected readonly rankOptions = RANK_OPTIONS;

  // Form state
  protected mode = signal<'flight' | 'freeform'>('freeform');
  protected flightId = signal<string>('');
  protected flightDepartureTime = signal<string>('');
  protected flightArrivalTime = signal<string>('');
  protected requiredPosition = signal<string>('');
  protected requiredBaseAirportIata = signal<string>('');
  protected requiredAircraftTypeId = signal<string>('');

  protected baseAirport = signal<string>('');
  protected selectedRank = signal<CrewRank>('');
  protected searchDate = signal<string>('');
  protected showInactive = signal<boolean>(false);

  protected readonly isFlightMode = computed(() => this.mode() === 'flight');

  protected readonly isValid = computed(() => {
    if (this.isFlightMode()) {
      return !!this.flightDepartureTime() && !!this.flightArrivalTime();
    }
    return true; // free-form is always valid (optional filters)
  });

  protected readonly selectedRankLabel = computed(() =>
    RANK_OPTIONS.find(r => r.value === this.selectedRank())?.label ?? 'All Ranks'
  );

  protected onSubmit(): void {
    if (!this.isValid() || this.isLoading()) return;

    const criteria: IAvailabilitySearchCriteria = {
      mode: this.mode(),
      flightInstanceId: this.isFlightMode() && this.flightId() ? parseInt(this.flightId(), 10) : undefined,
      flightDepartureTime: this.isFlightMode() && this.flightDepartureTime() ? this.flightDepartureTime() : undefined,
      flightArrivalTime: this.isFlightMode() && this.flightArrivalTime() ? this.flightArrivalTime() : undefined,
      requiredPosition: this.isFlightMode() && this.requiredPosition() ? this.requiredPosition() : undefined,
      requiredBaseAirportIata: this.isFlightMode() && this.requiredBaseAirportIata() ? this.requiredBaseAirportIata().trim().toUpperCase() : undefined,
      requiredAircraftTypeId: this.isFlightMode() && this.requiredAircraftTypeId() ? parseInt(this.requiredAircraftTypeId(), 10) : undefined,

      baseAirportIata: this.baseAirport().trim().toUpperCase() || undefined,
      rank: this.selectedRank() || undefined,
      date: this.searchDate() || undefined,
      showInactiveOnly: this.showInactive(),
    };
    this.searchSubmitted.emit(criteria);
  }

  protected onReset(): void {
    this.mode.set('freeform');
    this.flightId.set('');
    this.flightDepartureTime.set('');
    this.flightArrivalTime.set('');
    this.requiredPosition.set('');
    this.requiredBaseAirportIata.set('');
    this.requiredAircraftTypeId.set('');
    this.baseAirport.set('');
    this.selectedRank.set('');
    this.searchDate.set('');
    this.showInactive.set(false);
    this.resetTriggered.emit();
  }
}