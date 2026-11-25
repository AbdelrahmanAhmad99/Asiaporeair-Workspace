

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

export interface IReportDateRange {
  start: Date;
  end: Date;
}

interface IPreset {
  id: string;
  label: string;
  months: number;   // months back from today; 0 = custom
}

const PRESETS: IPreset[] = [
  { id: '3m', label: 'Last 3 Months', months: 3 },
  { id: '6m', label: 'Last 6 Months', months: 6 },
  { id: '12m', label: 'Last 12 Months', months: 12 },
  { id: '24m', label: 'Last 24 Months', months: 24 },
  { id: 'ytd', label: 'Year to Date', months: 0 },
  { id: 'cst', label: 'Custom Range', months: -1 },
];

function presetToRange(preset: IPreset): IReportDateRange | null {
  const end = new Date();
  if (preset.months > 0) {
    const start = new Date();
    start.setMonth(start.getMonth() - preset.months);
    start.setDate(1);
    return { start, end };
  }
  if (preset.id === 'ytd') {
    const start = new Date(end.getFullYear(), 0, 1);
    return { start, end };
  }
  return null; // custom — handled separately
}

@Component({
  selector: 'aoms-analytics-date-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './analytics-date-filter.component.html',
  styleUrl: './analytics-date-filter.component.scss',
})
export class AnalyticsDateFilterComponent {
  readonly currentRange = input<IReportDateRange | null>(null);
  readonly loading = input<boolean>(false);

  readonly rangeChanged = output<IReportDateRange>();

  protected readonly presets = PRESETS;
  protected activePresetId = signal<string>('6m');
  protected showCustom = signal<boolean>(false);

  protected customStart = signal<string>('');
  protected customEnd = signal<string>('');

  protected readonly customValid = computed(() => {
    if (!this.customStart() || !this.customEnd()) return false;
    return new Date(this.customStart()) <= new Date(this.customEnd());
  });

  protected onPresetClick(preset: IPreset): void {
    if (preset.id === 'cst') {
      this.activePresetId.set('cst');
      this.showCustom.set(true);
      return;
    }
    this.showCustom.set(false);
    this.activePresetId.set(preset.id);
    const range = presetToRange(preset);
    if (range) this.rangeChanged.emit(range);
  }

  protected onApplyCustom(): void {
    if (!this.customValid()) return;
    const range: IReportDateRange = {
      start: new Date(this.customStart()),
      end: new Date(this.customEnd()),
    };
    this.rangeChanged.emit(range);
  }

  protected readonly rangeLabel = computed(() => {
    const r = this.currentRange();
    if (!r) return '—';
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${fmt(r.start)} — ${fmt(r.end)}`;
  });
}