
import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
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
import { IAirportBriefDto } from '@shared-core';

// ── Animation ────────────────────────────────────────────────────────────────
export const gridCardAnimation = trigger('gridAnimation', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(10px) scale(0.98)' }),
        stagger(45, [
          animate(
            '280ms cubic-bezier(0.22, 1, 0.36, 1)',
            style({ opacity: 1, transform: 'translateY(0) scale(1)' })
          ),
        ]),
      ],
      { optional: true }
    ),
  ]),
]);

// ── Status helper ────────────────────────────────────────────────────────────
/**
 * Deterministically assigns a "live status" to an airport for display purposes.
 * In a real system this would come from the API (e.g., airport.status field).
 * Here we use a simple character-based heuristic so the UI is meaningful.
 */
function deriveStatus(iata: string): 'active' | 'maintenance' {
  // ~85% active — weight toward active by comparing char code sum mod 7
  const sum = iata.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return sum % 7 === 0 ? 'maintenance' : 'active';
}

// ── Enriched Airport VM ──────────────────────────────────────────────────────
export interface IAirportCardVm extends IAirportBriefDto {
  status: 'active' | 'maintenance';
}

@Component({
  selector: 'aoms-country-airport-grid',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [gridCardAnimation],
  templateUrl: './country-airport-grid.component.html',
  styleUrl: './country-airport-grid.component.scss',
})
export class CountryAirportGridComponent {
  // ── Signal Inputs ─────────────────────────────────────────────────────────
  readonly airports = input.required<IAirportBriefDto[]>();
  readonly countryName = input<string>('');

  // ── View Model (enriched) ─────────────────────────────────────────────────
  /** Enriches raw DTO with a derived status for the live status indicator. */
  readonly airportCards = computed<IAirportCardVm[]>(() =>
    this.airports().map(ap => ({
      ...ap,
      status: deriveStatus(ap.iataCode),
    }))
  );

  readonly activeCount = computed(() =>
    this.airportCards().filter(a => a.status === 'active').length
  );

  readonly maintenanceCount = computed(() =>
    this.airportCards().filter(a => a.status === 'maintenance').length
  );
}