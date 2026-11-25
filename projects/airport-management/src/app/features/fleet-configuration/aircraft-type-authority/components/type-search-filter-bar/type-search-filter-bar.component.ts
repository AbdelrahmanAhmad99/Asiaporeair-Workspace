
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
import { IAircraftTypeFilters } from '../../store/aircraft-types.store';

// ── Range preset options ──────────────────────────────────────────────────
export interface IRangePreset {
  label: string;
  min: number | null;
  max: number | null;
}

const RANGE_PRESETS: IRangePreset[] = [
  { label: 'All Ranges', min: null, max: null },
  { label: 'Short (<3,000 km)', min: null, max: 3000 },
  { label: 'Medium (3–8,000 km)', min: 3000, max: 8000 },
  { label: 'Long (>8,000 km)', min: 8000, max: null },
];

@Component({
  selector: 'aoms-type-search-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './type-search-filter-bar.component.html',
  styleUrl: './type-search-filter-bar.component.scss',
})
export class TypeSearchFilterBarComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly manufacturers = input<string[]>([]);
  readonly initialFilters = input<IAircraftTypeFilters>({
    searchQuery: '',
    manufacturer: '',
    minRangeKm: null,
    maxRangeKm: null,
    includeArchived: false,
  });

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly filtersChanged = output<Partial<IAircraftTypeFilters>>();
  readonly addType = output<void>();
  readonly resetFilters = output<void>();

  // ── Local State ─────────────────────────────────────────────────────────
  protected searchValue = '';
  protected manufacturerValue = '';
  protected activeRangePreset = signal<number>(0); // index into RANGE_PRESETS
  protected readonly rangePresets = RANGE_PRESETS;

  private readonly search$ = new Subject<string>();

  hasActiveFilters = (): boolean =>
    this.searchValue.trim() !== '' ||
    this.manufacturerValue !== '' ||
    this.activeRangePreset() !== 0;

  ngOnInit(): void {
    const init = this.initialFilters();
    this.searchValue = init.searchQuery;
    this.manufacturerValue = init.manufacturer;

    // Restore range preset selection
    if (init.minRangeKm != null || init.maxRangeKm != null) {
      const idx = RANGE_PRESETS.findIndex(
        p => p.min === init.minRangeKm && p.max === init.maxRangeKm
      );
      this.activeRangePreset.set(idx >= 0 ? idx : 0);
    }

    // Debounce free-text search
    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(query => this.filtersChanged.emit({ searchQuery: query }));
  }

  protected onSearchChange(value: string): void {
    this.search$.next(value);
  }

  protected onManufacturerChange(value: string): void {
    this.filtersChanged.emit({ manufacturer: value });
  }

  protected onRangePresetChange(index: number): void {
    this.activeRangePreset.set(index);
    const preset = RANGE_PRESETS[index];
    this.filtersChanged.emit({ minRangeKm: preset.min, maxRangeKm: preset.max });
  }

  protected onReset(): void {
    this.searchValue = '';
    this.manufacturerValue = '';
    this.activeRangePreset.set(0);
    this.search$.next('');
    this.resetFilters.emit();
  }
}