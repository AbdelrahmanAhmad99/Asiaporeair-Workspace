

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAirportDto } from '@shared-core';

@Component({
  selector: 'aoms-airport-identity-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airport-identity-card.component.html',
  styleUrl: './airport-identity-card.component.scss',
})
export class AirportIdentityCardComponent {
  // ── Signal Input ──────────────────────────────────────────────────────
  readonly airport = input.required<IAirportDto>();

  // ── Derived display values ────────────────────────────────────────────

  /** Latitude formatted to 6 decimal places with N/S suffix. */
  readonly latDisplay = computed<string>(() => {
    const lat = this.airport().latitude;
    if (lat === undefined || lat === null) return '—';
    const abs = Math.abs(lat).toFixed(6);
    return `${abs}° ${lat >= 0 ? 'N' : 'S'}`;
  });

  /** Longitude formatted to 6 decimal places with E/W suffix. */
  readonly lonDisplay = computed<string>(() => {
    const lon = this.airport().longitude;
    if (lon === undefined || lon === null) return '—';
    const abs = Math.abs(lon).toFixed(6);
    return `${abs}° ${lon >= 0 ? 'E' : 'W'}`;
  });

  /** Altitude display with metres unit, or dash. */
  readonly altDisplay = computed<string>(() => {
    const alt = this.airport().altitude;
    return alt !== undefined && alt !== null ? `${alt.toLocaleString()} m` : '—';
  });

  /** Full location label: City, Country */
  readonly locationLabel = computed<string>(() => {
    const a = this.airport();
    return `${a.city}, ${a.countryName}`;
  });
}