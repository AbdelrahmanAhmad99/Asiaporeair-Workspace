
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IFleetFilters, AIRCRAFT_STATUS } from '../../store/fleet-inventory.store';

interface IStatusOption { label: string; value: string; }

const STATUS_OPTIONS: IStatusOption[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Operational (Active)', value: AIRCRAFT_STATUS.ACTIVE },
  { label: 'Under Maintenance', value: AIRCRAFT_STATUS.MAINTENANCE },
  { label: 'Grounded', value: AIRCRAFT_STATUS.GROUNDED },
  { label: 'AOG — Critical', value: AIRCRAFT_STATUS.AOG },
  { label: 'Reserve', value: AIRCRAFT_STATUS.RESERVE },
];

@Component({
  selector: 'aoms-aircraft-advanced-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aircraft-advanced-search.component.html',
  styleUrl: './aircraft-advanced-search.component.scss',
})
export class AircraftAdvancedSearchComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly initialFilters = input<IFleetFilters>({
    tailNumber: '', status: '', typeId: '', airlineIataCode: '',
    minFlightHours: null, maxFlightHours: null,
  });
  /** Populated from the aircraft types store — e.g. [{ id: 1, label: 'A350-900' }] */
  readonly aircraftTypeOptions = input<{ id: number; label: string }[]>([]);
  readonly isLoading = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly filtersApplied = output<Partial<IFleetFilters>>();
  readonly filtersReset = output<void>();

  // ── Local State ──────────────────────────────────────────────────────────
  protected tailValue = '';
  protected statusValue = '';
  protected typeValue = '';
  protected minHoursValue = '';
  protected maxHoursValue = '';
  protected readonly statusOptions = STATUS_OPTIONS;

  /** Is any filter currently active? */
  protected hasActiveFilters = (): boolean =>
    this.tailValue.trim() !== '' ||
    this.statusValue !== '' ||
    this.typeValue !== '' ||
    this.minHoursValue !== '' ||
    this.maxHoursValue !== '';

  // Tail-number debounce stream
  private readonly tail$ = new Subject<string>();

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    const init = this.initialFilters();
    this.tailValue = init.tailNumber;
    this.statusValue = init.status;
    this.typeValue = init.typeId;
    this.minHoursValue = init.minFlightHours?.toString() ?? '';
    this.maxHoursValue = init.maxFlightHours?.toString() ?? '';

    // Debounce tail-number for real-time search feel
    this.tail$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(v => this.filtersApplied.emit({ tailNumber: v }));
  }

  protected onTailChange(v: string): void { this.tail$.next(v); }

  protected onApplyFilters(): void {
    this.filtersApplied.emit({
      tailNumber: this.tailValue.trim(),
      status: this.statusValue,
      typeId: this.typeValue,
      minFlightHours: this.minHoursValue !== '' ? +this.minHoursValue : null,
      maxFlightHours: this.maxHoursValue !== '' ? +this.maxHoursValue : null,
    });
  }

  protected onReset(): void {
    this.tailValue = '';
    this.statusValue = '';
    this.typeValue = '';
    this.minHoursValue = '';
    this.maxHoursValue = '';
    this.tail$.next('');
    this.filtersReset.emit();
  }
}