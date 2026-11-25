
import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { IAirportDto } from '@shared-core';
import { RestoreActionButtonComponent } from '../restore-action-button/restore-action-button.component';

// ── Animation ─────────────────────────────────────────────────────────────
const auditRowAnimation = trigger('auditRows', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateX(-6px)' }),
        stagger(18, [
          animate(
            '200ms cubic-bezier(0.22, 1, 0.36, 1)',
            style({ opacity: 1, transform: 'translateX(0)' })
          ),
        ]),
      ],
      { optional: true }
    ),
  ]),
]);

// ── Column definition ─────────────────────────────────────────────────────
interface IAuditColumn {
  key: string;
  label: string;
  shimmerWidth: string;
  hideOnMd?: boolean;
  hideOnLg?: boolean;
  hideOnXl?: boolean;
}

@Component({
  selector: 'aoms-archived-airport-list',
  standalone: true,
  imports: [CommonModule, RestoreActionButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [auditRowAnimation],
  templateUrl: './archived-airport-list.component.html',
  styleUrl: './archived-airport-list.component.scss',
})
export class ArchivedAirportListComponent {
  // ── Signal Inputs ─────────────────────────────────────────────────────
  readonly records = input.required<IAirportDto[]>();
  readonly loading = input<boolean>(false);
  readonly restoringCode = input<string | null>(null);
  readonly activeSet = input<Set<string>>(new Set());

  // ── Output ────────────────────────────────────────────────────────────
  readonly restore = output<string>();

  // ── Column definitions ────────────────────────────────────────────────
  protected readonly columns: IAuditColumn[] = [
    { key: 'status', label: '', shimmerWidth: '20px' },
    { key: 'iataCode', label: 'IATA', shimmerWidth: '44px' },
    { key: 'icaoCode', label: 'ICAO', shimmerWidth: '52px' },
    { key: 'name', label: 'Airport', shimmerWidth: '60%' },
    { key: 'city', label: 'City', shimmerWidth: '42%', hideOnMd: true },
    { key: 'countryName', label: 'Country', shimmerWidth: '38%', hideOnLg: true },
    { key: 'iso', label: 'ISO', shimmerWidth: '28px', hideOnMd: true },
    { key: 'latitude', label: 'Lat', shimmerWidth: '52px', hideOnXl: true },
    { key: 'longitude', label: 'Lon', shimmerWidth: '52px', hideOnXl: true },
    { key: 'actions', label: 'Actions', shimmerWidth: '72px' },
  ];

  protected readonly shimmerRows = Array(12).fill(null);

  // ── Derived ────────────────────────────────────────────────────────────

  /** True if the given IATA is in the active set (operational). */
  protected isActive(iataCode: string): boolean {
    return this.activeSet().has(iataCode);
  }

  protected formatCoord(val: number | undefined): string {
    if (val === undefined || val === null) return '—';
    return val.toFixed(4);
  }

  // ── Action ────────────────────────────────────────────────────────────
  protected onRestore(iataCode: string): void {
    this.restore.emit(iataCode);
  }
}
