
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IScheduleFilters } from '../../store/network-planning.store';

@Component({
  selector: 'aoms-schedule-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedule-filter-panel.component.html',
  styleUrl: './schedule-filter-panel.component.scss',
})
export class ScheduleFilterPanelComponent {
  readonly loading = input<boolean>(false);
  readonly hasActiveFilter = input<boolean>(false);

  readonly onFilterChange = output<Partial<IScheduleFilters>>();
  readonly onReset = output<void>();

  protected readonly flightNoVal = signal<string>('');
  protected readonly seasonVal = signal<'SUMMER' | 'WINTER' | ''>('');
  protected readonly statusVal = signal<'true' | 'false' | ''>('');
  protected readonly routeIdVal = signal<string>('');

  private _searchTimer: ReturnType<typeof setTimeout> | null = null;

  protected onFlightNoInput(v: string): void {
    this.flightNoVal.set(v.toUpperCase());
    this._debounceEmit({ flightNo: v.toUpperCase() || undefined });
  }

  protected onSeasonChange(v: string): void {
    this.seasonVal.set(v as 'SUMMER' | 'WINTER' | '');
    this.onFilterChange.emit({
      season: v ? (v as 'SUMMER' | 'WINTER') : null,
    });
  }

  protected onStatusChange(v: string): void {
    this.statusVal.set(v as 'true' | 'false' | '');
    this.onFilterChange.emit({
      isActive: v === '' ? null : v === 'true',
    });
  }

  protected onRouteIdInput(v: string): void {
    this.routeIdVal.set(v);
    const num = v ? Number(v) : null;
    this._debounceEmit({ routeId: num });
  }

  protected reset(): void {
    this.flightNoVal.set('');
    this.seasonVal.set('');
    this.statusVal.set('');
    this.routeIdVal.set('');
    this.onReset.emit();
  }

  private _debounceEmit(partial: Partial<IScheduleFilters>): void {
    if (this._searchTimer) clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      this.onFilterChange.emit(partial);
    }, 280);
  }
}