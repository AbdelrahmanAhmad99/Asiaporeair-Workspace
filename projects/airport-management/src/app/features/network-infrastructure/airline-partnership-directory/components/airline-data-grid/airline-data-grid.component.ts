
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
import { IAirlineDto } from '@shared-core';

export const gridRowAnimation = trigger('gridAnim', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(6px)' }),
      stagger(28, [
        animate('220ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ], { optional: true }),
  ]),
]);

interface IGridColumn {
  key: string;
  label: string;
  shimmerWidth: string;
  hideOnMd?: boolean;
  hideOnLg?: boolean;
}

@Component({
  selector: 'aoms-airline-data-grid',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [gridRowAnimation],
  templateUrl: './airline-data-grid.component.html',
  styleUrl: './airline-data-grid.component.scss',
})
export class AirlineDataGridComponent {
  // ── Inputs ────────────────────────────────────────────────────────────
  readonly airlines = input.required<IAirlineDto[]>();
  readonly loading = input<boolean>(false);
  readonly recordLabel = input<string>('');

  // ── Outputs ───────────────────────────────────────────────────────────
  readonly viewDetail = output<string>();
  readonly editAirline = output<string>();
  readonly deactivate = output<string>();

  // ── Column definitions ─────────────────────────────────────────────────
  protected readonly columns: IGridColumn[] = [
    { key: 'logo', label: '', shimmerWidth: '36px' },
    { key: 'iataCode', label: 'IATA', shimmerWidth: '48px' },
    { key: 'name', label: 'Airline', shimmerWidth: '55%' },
    { key: 'callsign', label: 'Callsign', shimmerWidth: '40%', hideOnMd: true },
    { key: 'baseAirport', label: 'Base Hub', shimmerWidth: '48px' },
    { key: 'region', label: 'Region', shimmerWidth: '45%', hideOnLg: true },
    { key: 'actions', label: 'Actions', shimmerWidth: '80px' },
  ];

  protected readonly shimmerRows = Array(8).fill(null);

  /** Derive logo initials from the airline name. */
  protected logoInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  /** Map a region string to a colour class for the region pill. */
  protected regionClass(region: string): string {
    const map: Record<string, string> = {
      'Southeast Asia': 'region--emerald',
      'Northeast Asia': 'region--emerald',
      'South Asia': 'region--emerald',
      'Middle East': 'region--amber',
      'Europe': 'region--sapphire',
      'North America': 'region--sapphire',
      'South America': 'region--amber',
      'Africa': 'region--amber',
      'Oceania': 'region--sapphire',
    };
    return map[region] ?? 'region--default';
  }
}