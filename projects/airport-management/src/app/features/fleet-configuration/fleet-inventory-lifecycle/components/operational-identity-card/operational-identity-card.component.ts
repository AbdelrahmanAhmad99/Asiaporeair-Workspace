

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAircraftDetailDto } from '@shared-core';
import { AIRCRAFT_STATUS, AircraftStatus } from '../../store/fleet-inventory.store';

@Component({
  selector: 'aoms-operational-identity-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './operational-identity-card.component.html',
  styleUrl: './operational-identity-card.component.scss',
})
export class OperationalIdentityCardComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly aircraft = input<IAircraftDetailDto | null>(null);
  readonly loading = input<boolean>(false);

  // ── Computed helpers ──────────────────────────────────────────────────
  readonly statusConfig = computed(() => {
    const s = this.aircraft()?.status?.toUpperCase() ?? '';
    const map: Record<string, { label: string; cssClass: string; pulse: boolean }> = {
      [AIRCRAFT_STATUS.ACTIVE]: { label: 'Operational', cssClass: 'status--active', pulse: false },
      [AIRCRAFT_STATUS.MAINTENANCE]: { label: 'Maintenance', cssClass: 'status--maintenance', pulse: false },
      [AIRCRAFT_STATUS.GROUNDED]: { label: 'Grounded', cssClass: 'status--grounded', pulse: true },
      [AIRCRAFT_STATUS.AOG]: { label: 'AOG — Critical', cssClass: 'status--aog', pulse: true },
      [AIRCRAFT_STATUS.RESERVE]: { label: 'Reserve', cssClass: 'status--reserve', pulse: false },
    };
    return map[s] ?? { label: s || 'Unknown', cssClass: 'status--reserve', pulse: false };
  });

  protected formatHours(hours: number | undefined): string {
    if (hours == null) return '—';
    return hours >= 10000
      ? `${(hours / 1000).toFixed(1)}k`
      : hours.toLocaleString();
  }

  protected formatDate(d: string | Date | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }

  protected totalSeats = computed(() => {
    const configs = this.aircraft()?.configurations ?? [];
    return configs.reduce((sum, c) => sum + (c.totalSeatsCount ?? 0), 0);
  });
}