
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OPERATING_REGIONS } from '../../store/airlines.store';

@Component({
  selector: 'aoms-airline-search-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airline-search-filter.component.html',
  styleUrl: './airline-search-filter.component.scss',
})
export class AirlineSearchFilterComponent implements OnInit {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly loading = input<boolean>(false);
  readonly hasActiveFilter = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly onSearch = output<string>();
  readonly onRegion = output<string>();
  readonly onAddNew = output<void>();
  readonly onClear = output<void>();

  // ── Local form state ──────────────────────────────────────────────────
  protected readonly searchValue = signal<string>('');
  protected readonly regionValue = signal<string>('');
  protected readonly regions = OPERATING_REGIONS;

  ngOnInit(): void { }

  protected onSearchInput(value: string): void {
    this.searchValue.set(value);
    this.onSearch.emit(value);
  }

  protected onRegionChange(value: string): void {
    this.regionValue.set(value);
    this.onRegion.emit(value);
  }

  protected clear(): void {
    this.searchValue.set('');
    this.regionValue.set('');
    this.onClear.emit();
  }

  protected addNew(): void {
    this.onAddNew.emit();
  }
}