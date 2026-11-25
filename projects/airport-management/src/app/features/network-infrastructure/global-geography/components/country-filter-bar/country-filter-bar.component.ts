
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  input,
  output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IGeographyFilters } from '../../store/geography.store';

@Component({
  selector: 'aoms-country-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './country-filter-bar.component.html',
  styleUrl: './country-filter-bar.component.scss',
})
export class CountryFilterBarComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly continents = input<string[]>([]);
  readonly initialFilters = input<IGeographyFilters>({ searchQuery: '', continent: '' });

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly filtersChanged = output<Partial<IGeographyFilters>>();
  readonly addCountry = output<void>();
  readonly resetFilters = output<void>();

  // ── Local State ─────────────────────────────────────────────────────────
  protected searchValue = '';
  protected continentValue = '';

  private readonly search$ = new Subject<string>();

  hasActiveFilters = (): boolean =>
    this.searchValue.trim() !== '' || this.continentValue !== '';

  ngOnInit(): void {
    // Seed from parent's initial filter state
    const init = this.initialFilters();
    this.searchValue = init.searchQuery;
    this.continentValue = init.continent;

    // Debounce search-query emissions (300 ms)
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

  protected onContinentChange(value: string): void {
    this.filtersChanged.emit({ continent: value });
  }

  protected onReset(): void {
    this.searchValue = '';
    this.continentValue = '';
    this.search$.next('');
    this.resetFilters.emit();
  }
}