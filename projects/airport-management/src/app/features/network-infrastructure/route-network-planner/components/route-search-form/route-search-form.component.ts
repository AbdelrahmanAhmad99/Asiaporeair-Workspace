
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IRouteSearchCriteria } from '../../store/routes.store';

type StatusOption = { label: string; value: boolean | null };

@Component({
  selector: 'aoms-route-search-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './route-search-form.component.html',
  styleUrl: './route-search-form.component.scss',
})
export class RouteSearchFormComponent {
  readonly loading = input<boolean>(false);
  readonly hasActiveFilter = input<boolean>(false);

  readonly onSearch = output<IRouteSearchCriteria>();
  readonly onReset = output<void>();

  protected readonly originVal = signal<string>('');
  protected readonly destinationVal = signal<string>('');
  protected readonly statusVal = signal<boolean | null>(null);

  protected readonly statusOptions: StatusOption[] = [
    { label: 'All Statuses', value: null },
    { label: 'Active Only', value: true },
    { label: 'Inactive Only', value: false },
  ];

  protected onOriginInput(v: string): void {
    this.originVal.set(v.toUpperCase().slice(0, 4));
  }

  protected onDestInput(v: string): void {
    this.destinationVal.set(v.toUpperCase().slice(0, 4));
  }

  protected onStatusChange(raw: string): void {
    this.statusVal.set(raw === '' ? null : raw === 'true');
  }

  protected search(): void {
    this.onSearch.emit({
      originIata: this.originVal(),
      destinationIata: this.destinationVal(),
      isActive: this.statusVal(),
    });
  }

  protected reset(): void {
    this.originVal.set('');
    this.destinationVal.set('');
    this.statusVal.set(null);
    this.onReset.emit();
  }
}