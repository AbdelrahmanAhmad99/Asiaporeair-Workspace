
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

import { IFareSearchCriteria } from '../../store/fare-engine.store';

// ── Cabin class options ────────────────────────────────────────────────────
export const CABIN_CLASSES: { label: string; value: string }[] = [
  { label: 'All Classes', value: '' },
  { label: 'Suites', value: 'Suites' },
  { label: 'First Class', value: 'First' },
  { label: 'Business Class', value: 'Business' },
  { label: 'Premium Economy', value: 'PremiumEconomy' },
  { label: 'Economy', value: 'Economy' },
];

@Component({
  selector: 'aoms-fare-search-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fare-search-filter.component.html',
  styleUrl: './fare-search-filter.component.scss',
})
export class FareSearchFilterComponent implements OnInit, OnDestroy {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly currentFilters = input.required<IFareSearchCriteria>();
  readonly loading = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly filtersChanged = output<Partial<IFareSearchCriteria>>();
  readonly resetTriggered = output<void>();

  // ── Local state ─────────────────────────────────────────────────────────
  protected readonly descriptionValue = signal<string>('');
  protected readonly cabinClassValue = signal<string>('');
  protected readonly cabinClasses = CABIN_CLASSES;

  private readonly _descChange$ = new Subject<string>();
  private readonly _destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Sync from store filters on first render
    const f = this.currentFilters();
    this.descriptionValue.set(f.description ?? '');
    this.cabinClassValue.set(f.cabinClass ?? '');

    // Debounce description input (400ms)
    this._descChange$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this._destroy$))
      .subscribe(desc => {
        this.filtersChanged.emit({ description: desc, pageNumber: 1 });
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // ── Handlers ────────────────────────────────────────────────────────────
  protected onDescriptionInput(value: string): void {
    this.descriptionValue.set(value);
    this._descChange$.next(value);
  }

  protected onCabinClassChange(value: string): void {
    this.cabinClassValue.set(value);
    this.filtersChanged.emit({ cabinClass: value, pageNumber: 1 });
  }

  protected onReset(): void {
    this.descriptionValue.set('');
    this.cabinClassValue.set('');
    this.resetTriggered.emit();
  }

  protected get hasActiveFilters(): boolean {
    return (
      this.descriptionValue().trim().length > 0 ||
      this.cabinClassValue().trim().length > 0
    );
  }
}