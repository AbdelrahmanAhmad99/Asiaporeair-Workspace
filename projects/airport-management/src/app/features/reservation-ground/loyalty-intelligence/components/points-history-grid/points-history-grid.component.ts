

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { ITransactionRecord } from '../../store/loyalty-intelligence.store';

export const HISTORY_ROW_HEIGHT = 44;
export const HISTORY_VIRTUAL_THRESHOLD = 40;

@Component({
  selector: 'aoms-points-history-grid',
  standalone: true,
  imports: [CommonModule, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './points-history-grid.component.html',
  styleUrl: './points-history-grid.component.scss',
})
export class PointsHistoryGridComponent {
  readonly history = input.required<ITransactionRecord[]>();
  readonly hasHistory = input<boolean>(false);

  protected readonly rowHeight = HISTORY_ROW_HEIGHT;

  readonly useVirtual = computed<boolean>(
    () => this.history().length > HISTORY_VIRTUAL_THRESHOLD
  );

  readonly viewportHeight = computed<string>(() => {
    const count = this.history().length;
    const maxRows = Math.min(count, 12);
    return `${maxRows * HISTORY_ROW_HEIGHT}px`;
  });

  protected formatDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  protected formatAmount(record: ITransactionRecord): string {
    const sign = record.type === 'add' ? '+' : '−';
    return `${sign}${record.amount.toLocaleString('en-US')}`;
  }

  protected trackById(_: number, r: ITransactionRecord): number {
    return r.id;
  }
}