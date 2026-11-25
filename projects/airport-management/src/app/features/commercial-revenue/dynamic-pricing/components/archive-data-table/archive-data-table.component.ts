
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IContextualPricingAttributeDto } from '@shared-core';

const SKELETON_ROW_COUNT = 8;

@Component({
  selector: 'aoms-archive-data-table',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './archive-data-table.component.html',
  styleUrl: './archive-data-table.component.scss',
})
export class ArchiveDataTableComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly rules = input.required<IContextualPricingAttributeDto[]>();
  readonly loading = input<boolean>(false);
  readonly restoringId = input<number | null>(null);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly restoreRequested = output<IContextualPricingAttributeDto>();

  // ── Skeleton ─────────────────────────────────────────────────────────────
  protected readonly skeletonRows = Array.from({ length: SKELETON_ROW_COUNT });

  // ── Priority visual helper ────────────────────────────────────────────────
  protected getPriorityClass(priority: number): string {
    if (priority <= 3) return 'adt-priority--high';
    if (priority <= 7) return 'adt-priority--mid';
    return 'adt-priority--low';
  }

  // ── Modifier helper ───────────────────────────────────────────────────────
  protected getModifierLabel(pct: number): string {
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  }

  protected getModifierClass(pct: number): string {
    if (pct > 0) return 'adt-modifier--positive';
    if (pct < 0) return 'adt-modifier--negative';
    return 'adt-modifier--neutral';
  }

  // ── Track by ──────────────────────────────────────────────────────────────
  protected trackById(_: number, rule: IContextualPricingAttributeDto): number {
    return rule.attributeId;
  }
}