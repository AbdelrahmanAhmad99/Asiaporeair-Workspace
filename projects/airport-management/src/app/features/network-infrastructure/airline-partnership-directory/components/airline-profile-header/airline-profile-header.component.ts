
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAirlineDto } from '@shared-core';

export interface IFleetBreakdown {
  active: number;
  maintenance: number;
  retired: number;
}

@Component({
  selector: 'aoms-airline-profile-header',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airline-profile-header.component.html',
  styleUrl: './airline-profile-header.component.scss',
})
export class AirlineProfileHeaderComponent {
  // ── Signal Inputs ─────────────────────────────────────────────────────
  readonly airline = input.required<IAirlineDto>();
  readonly fleetSize = input<number>(0);
  readonly fleetBreakdown = input<IFleetBreakdown>({ active: 0, maintenance: 0, retired: 0 });

  // ── Derived display values ────────────────────────────────────────────

  /** 2-character initials for the Squircle logo avatar. */
  readonly logoInitials = computed<string>(() => {
    const words = this.airline().name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
  });

  /**
   * Ghost watermark text: first significant word of the airline name,
   * up to 6 characters, uppercase.
   */
  readonly watermarkText = computed<string>(() => {
    const first = this.airline().name.trim().split(/\s+/)[0];
    return first.slice(0, 6).toUpperCase();
  });

  /** Whether the airline is considered active in the network. */
  readonly isActive = computed<boolean>(() => true); // driven by API status in a real system
}