
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ICountryDto } from '@shared-core';

// ── Animation Definition ─────────────────────────────────────────────────
export const tableRowAnimation = trigger('tableAnimation', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        stagger(35, [
          animate(
            '240ms cubic-bezier(0.4, 0, 0.2, 1)',
            style({ opacity: 1, transform: 'translateY(0)' })
          ),
        ]),
      ],
      { optional: true }
    ),
  ]),
]);

// ── Action Event Types ───────────────────────────────────────────────────
export type TableAction = 'view' | 'edit' | 'delete' | 'reactivate';

export interface ITableActionEvent {
  action: TableAction;
  isoCode: string;
}

@Component({
  selector: 'aoms-country-data-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [tableRowAnimation],
  templateUrl: './country-data-table.component.html',
  styleUrl: './country-data-table.component.scss',
})
export class CountryDataTableComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly countries = input.required<ICountryDto[]>();
  readonly loading = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly actionTriggered = output<ITableActionEvent>();

  // ── Column Definitions ───────────────────────────────────────────────────
  /** Each entry drives both <th> and shimmer <td> cells in the template. */
  protected readonly columns: {
    key: string;
    label: string;
    shimmerWidth: string;
    hideOnMd?: boolean;
    hideOnLg?: boolean;
  }[] = [
      { key: 'isoCode', label: 'ISO', shimmerWidth: '60px' },
      { key: 'name', label: 'Country', shimmerWidth: '70%' },
      { key: 'continent', label: 'Continent', shimmerWidth: '50%' },
      { key: 'currencyCode', label: 'Currency', shimmerWidth: '50px', hideOnMd: true },
      { key: 'phoneCode', label: 'Phone Code', shimmerWidth: '50px', hideOnLg: true },
      { key: 'actions', label: 'Actions', shimmerWidth: '80px' },
    ];

  protected readonly shimmerRows = Array(8).fill(null);

  protected onAction(action: TableAction, isoCode: string): void {
    this.actionTriggered.emit({ action, isoCode });
  }
}