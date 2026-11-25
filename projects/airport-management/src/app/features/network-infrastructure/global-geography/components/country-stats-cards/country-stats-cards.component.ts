
import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IGeographyStats } from '../../store/geography.store';

interface IStatCard {
  label: string;
  value: string | number;
  subtitle?: string;
  iconPath: string;
  /** CSS custom-property token for the icon colour, e.g. `var(--aoms-gold)` */
  accentColor: string;
}

@Component({
  selector: 'aoms-country-stats-cards',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './country-stats-cards.component.html',
  styleUrl: './country-stats-cards.component.scss',
})
export class CountryStatsCardsComponent {
  // Signal inputs — set by Smart Component
  readonly stats = input.required<IGeographyStats>();
  readonly loading = input<boolean>(false);

  /** Derives display cards from the incoming stats signal. */
  statCards = (): IStatCard[] => {
    const s = this.stats();
    const continentCount = Object.keys(s.perContinent).length;
    const topContinent = Object.entries(s.perContinent)
      .sort(([, a], [, b]) => b - a)[0];

    return [
      {
        label: 'Total Countries',
        value: s.total,
        subtitle: 'In the network',
        iconPath: 'M3.055 11H5a2 2 0 0 1 2 2v1a2 2 0 0 0 2 2 2 2 0 0 1 2 2v2.945M8 3.935V5.5A2.5 2.5 0 0 0 10.5 8h.5a2 2 0 0 1 2 2 2 2 0 0 0 4 0 2 2 0 0 1 2-2h1.064M15 20.488V18a2 2 0 0 1 2-2h3.064',
        accentColor: 'var(--aoms-gold)',
      },
      {
        label: 'Continents Covered',
        value: continentCount,
        subtitle: 'Geographic regions',
        iconPath: 'M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-1.447-.894L15 9m0 8V9m0 0L9 7',
        accentColor: 'var(--aoms-champagne)',
      },
      {
        label: 'Largest Region',
        value: topContinent ? topContinent[0] : '—',
        subtitle: topContinent ? `${topContinent[1]} countries` : undefined,
        iconPath: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
        accentColor: 'var(--aoms-gold)',
      },
      {
        label: 'Avg / Continent',
        value: continentCount ? Math.round(s.total / continentCount) : 0,
        subtitle: 'Countries per region',
        iconPath: 'M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z',
        accentColor: 'var(--aoms-champagne)',
      },
    ];
  };
}