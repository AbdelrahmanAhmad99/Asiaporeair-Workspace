
import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAirportMetrics } from '../../store/airports.store';

// ── Widget definition shape ───────────────────────────────────────────────
interface IMetricWidget {
  id: string;
  label: string;
  sublabel: string;
  /** Accessor fn called with the metrics object */
  getValue: (m: IAirportMetrics) => string | number;
  iconPath: string;
  accentClass: string;
}

@Component({
  selector: 'aoms-airport-metrics-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airport-metrics-bar.component.html',
  styleUrl: './airport-metrics-bar.component.scss',
})
export class AirportMetricsBarComponent {
  // ── Inputs ────────────────────────────────────────────────────────────
  readonly metrics = input.required<IAirportMetrics>();
  readonly loading = input<boolean>(false);

  // ── Static widget definitions ─────────────────────────────────────────
  protected readonly widgets: IMetricWidget[] = [
    {
      id: 'total-active',
      label: 'Active Airports',
      sublabel: 'Global nodes',
      getValue: m => m.totalActive.toLocaleString(),
      accentClass: 'widget--gold',
      iconPath:
        'M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5',
    },
    {
      id: 'countries',
      label: 'Countries Covered',
      sublabel: 'Sovereign territories',
      getValue: m => m.totalCountries.toLocaleString(),
      accentClass: 'widget--emerald',
      iconPath:
        'M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418',
    },
    {
      id: 'continents',
      label: 'Continents',
      sublabel: 'Operational regions',
      getValue: m => m.totalContinents,
      accentClass: 'widget--amber',
      iconPath:
        'M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z',
    },
    {
      id: 'avg-altitude',
      label: 'Avg. Elevation',
      sublabel: 'Metres above sea level',
      getValue: m => (m.averageAltitude > 0 ? `${m.averageAltitude.toLocaleString()} m` : '—'),
      accentClass: 'widget--sapphire',
      iconPath:
        'M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941',
    },
  ];

  /** Shimmer row count for loading state. */
  protected readonly shimmerWidgets = Array(4).fill(null);
}