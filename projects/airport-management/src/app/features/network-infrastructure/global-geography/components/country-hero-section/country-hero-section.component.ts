
import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICountryWithAirportsDto } from '@shared-core';

@Component({
  selector: 'aoms-country-hero-section',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './country-hero-section.component.html',
  styleUrl: './country-hero-section.component.scss',
})
export class CountryHeroSectionComponent {
  // ── Signal Input ──────────────────────────────────────────────────────────
  readonly country = input.required<ICountryWithAirportsDto>();

  // ── Derived Computeds ─────────────────────────────────────────────────────

  /** Total number of airports registered for this country. */
  readonly airportCount = computed(() => this.country().airports?.length ?? 0);

  /**
   * Derives an abbreviated initials string from the country name.
   * Used as a decorative typographic backdrop behind the hero text.
   * E.g. "United Kingdom" → "UK"
   */
  readonly decorativeInitials = computed<string>(() => {
    const words = this.country().name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return words
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  });

  /** Display-friendly phone code with '+' prefix. */
  readonly formattedPhoneCode = computed<string>(() => {
    const code = this.country().phoneCode;
    return code ? `+${code}` : '—';
  });
}