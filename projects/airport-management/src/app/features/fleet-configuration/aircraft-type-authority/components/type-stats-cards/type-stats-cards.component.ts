
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAircraftTypeStats } from '../../store/aircraft-types.store';

// ── Card Definition ───────────────────────────────────────────────────────
interface IStatCard {
  id: string;
  label: string;
  value: string;
  unit: string;
  iconPath: string;
  trend?: string;
  trendPositive?: boolean;
}

@Component({
  selector: 'aoms-type-stats-cards',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './type-stats-cards.component.html',
  styleUrl: './type-stats-cards.component.scss',
})
export class TypeStatsCardsComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly stats = input.required<IAircraftTypeStats>();
  readonly loading = input<boolean>(false);

  // ── Shimmer placeholders ──────────────────────────────────────────────
  protected readonly shimmerCards = Array(4).fill(null);

  // ── Derived card data ─────────────────────────────────────────────────
  protected readonly cards = computed<IStatCard[]>(() => {
    const s = this.stats();
    const topManufacturer = Object.entries(s.manufacturerDistribution).sort(
      ([, a], [, b]) => b - a
    )[0];

    return [
      {
        id: 'total-types',
        label: 'Active Aircraft Models',
        value: s.totalActiveTypes.toString(),
        unit: 'types',
        iconPath:
          'M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5',
        trend: 'Fleet Certified',
        trendPositive: true,
      },
      {
        id: 'avg-range',
        label: 'Average Fleet Range',
        value: s.averageRangeKm > 0 ? s.averageRangeKm.toLocaleString() : '—',
        unit: 'km',
        iconPath:
          'M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z',
        trend: 'Intercontinental Ready',
        trendPositive: true,
      },
      {
        id: 'manufacturers',
        label: 'Active Manufacturers',
        value: s.manufacturerCount.toString(),
        unit: 'OEMs',
        iconPath:
          'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z',
        trend: topManufacturer ? `${topManufacturer[0]} leads` : 'Multi-OEM',
        trendPositive: true,
      },
      {
        id: 'avg-seats',
        label: 'Avg. Seating Capacity',
        value: s.avgSeatingCapacity > 0 ? s.avgSeatingCapacity.toString() : '—',
        unit: 'seats',
        iconPath:
          'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z',
        trend: 'Per Aircraft Average',
        trendPositive: true,
      },
    ];
  });
}