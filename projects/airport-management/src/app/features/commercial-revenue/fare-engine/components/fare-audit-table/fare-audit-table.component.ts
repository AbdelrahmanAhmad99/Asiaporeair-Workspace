

import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IFareBasisCodeDto } from '@shared-core';

const SKELETON_ROW_COUNT = 10;

@Component({
  selector: 'aoms-fare-audit-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fare-audit-table.component.html',
  styleUrl: './fare-audit-table.component.scss',
})
export class FareAuditTableComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly fares = input.required<IFareBasisCodeDto[]>();
  readonly loading = input<boolean>(false);
  readonly reactivatingCode = input<string | null>(null);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly reactivateRequested = output<IFareBasisCodeDto>();

  // ── Skeleton ─────────────────────────────────────────────────────────────
  protected readonly skeletonRows = Array.from({ length: SKELETON_ROW_COUNT });

  // ── Helpers ───────────────────────────────────────────────────────────────
  protected trackByCode(_: number, fare: IFareBasisCodeDto): string {
    return fare.code;
  }

  protected getCabinLabel(cabin?: string): string {
    if (!cabin) return '—';
    const map: Record<string, string> = {
      Suites: 'Suites',
      First: 'First',
      Business: 'Business',
      PremiumEconomy: 'Prem. Economy',
      Economy: 'Economy',
    };
    return map[cabin] ?? cabin;
  }
}