
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAirportDto } from '@shared-core';

@Component({
  selector: 'aoms-airport-location-navigator',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airport-location-navigator.component.html',
  styleUrl: './airport-location-navigator.component.scss',
})
export class AirportLocationNavigatorComponent {
  // ── Signal Inputs ────────────────────────────────────────────────────
  readonly nearbyAirports = input.required<IAirportDto[]>();
  readonly activeIataCode = input<string>('');
  readonly activeCity = input<string>('');
  readonly activeCountry = input<string>('');
  readonly loading = input<boolean>(false);

  // ── Output ────────────────────────────────────────────────────────────
  readonly airportSelected = output<string>();

  // ── Shimmer placeholder ────────────────────────────────────────────────
  protected readonly shimmerCards = Array(4).fill(null);

  // ── Derived counts ─────────────────────────────────────────────────────
  readonly sameCityCount = computed<number>(
    () => this.nearbyAirports().filter(a => a.city === this.activeCity()).length
  );

  readonly sameCountryCount = computed<number>(
    () => this.nearbyAirports().length
  );

  // ── Helpers ────────────────────────────────────────────────────────────

  protected isSameCity(airport: IAirportDto): boolean {
    return airport.city === this.activeCity();
  }

  protected selectAirport(iataCode: string): void {
    this.airportSelected.emit(iataCode);
  }

  /** Format coordinate pair as a compact string for compact card view. */
  protected formatCoords(airport: IAirportDto): string {
    const lat = Math.abs(airport.latitude).toFixed(2);
    const latDir = airport.latitude >= 0 ? 'N' : 'S';
    const lon = Math.abs(airport.longitude).toFixed(2);
    const lonDir = airport.longitude >= 0 ? 'E' : 'W';
    return `${lat}°${latDir} ${lon}°${lonDir}`;
  }
}