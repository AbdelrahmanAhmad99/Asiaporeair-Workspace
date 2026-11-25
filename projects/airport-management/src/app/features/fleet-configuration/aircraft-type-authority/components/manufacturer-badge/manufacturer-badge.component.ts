
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAircraftTypeDto } from '@shared-core';

export type OemCategory = 'airbus' | 'boeing' | 'embraer' | 'bombardier' | 'other';

@Component({
  selector: 'aoms-manufacturer-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './manufacturer-badge.component.html',
  styleUrl: './manufacturer-badge.component.scss',
})
export class ManufacturerBadgeComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly aircraftType = input<IAircraftTypeDto | null>(null);
  readonly loading = input<boolean>(false);

  // ── Derived computed signals ──────────────────────────────────────────
  /** Normalised OEM category — drives accent color and monogram. */
  readonly oem = computed<OemCategory>(() => {
    const mfr = (this.aircraftType()?.manufacturer ?? '').toLowerCase();
    if (mfr.includes('airbus')) return 'airbus';
    if (mfr.includes('boeing')) return 'boeing';
    if (mfr.includes('embraer')) return 'embraer';
    if (mfr.includes('bombardier')) return 'bombardier';
    return 'other';
  });

  /** First two letters of the manufacturer for the monogram badge. */
  readonly monogram = computed<string>(() => {
    const mfr = this.aircraftType()?.manufacturer ?? '';
    const words = mfr.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return mfr.slice(0, 2).toUpperCase();
  });

  /** Friendly OEM label. */
  readonly oemLabel = computed<string>(() => {
    const map: Record<OemCategory, string> = {
      airbus: 'Airbus S.A.S',
      boeing: 'The Boeing Company',
      embraer: 'Embraer S.A.',
      bombardier: 'Bombardier Inc.',
      other: this.aircraftType()?.manufacturer ?? 'Unknown OEM',
    };
    return map[this.oem()];
  });
}