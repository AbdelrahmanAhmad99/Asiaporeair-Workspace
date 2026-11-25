import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IContextualPricingAttributeDto } from '@shared-core';

@Component({
  selector: 'aoms-matching-result-panel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './matching-result-panel.component.html',
  styleUrl: './matching-result-panel.component.scss',
})
export class MatchingResultPanelComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly results = input.required<IContextualPricingAttributeDto[]>();
  readonly topRule = input<IContextualPricingAttributeDto | null>(null);
  readonly totalModifier = input<number>(0);
  readonly isSimulating = input<boolean>(false);
  readonly simulationRan = input<boolean>(false);
  readonly selectedRuleId = input<number | null>(null);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly ruleSelected = output<IContextualPricingAttributeDto>();

  // ── Skeleton rows ─────────────────────────────────────────────────────
  protected readonly skeletonRows = [1, 2, 3];

  // ── Computed ──────────────────────────────────────────────────────────
  readonly hasResults = computed(() => this.results().length > 0);

  // ── Helpers ───────────────────────────────────────────────────────────

  /** True if this rule is the top-priority (winning) rule. */
  protected isTopRule(rule: IContextualPricingAttributeDto): boolean {
    return this.topRule()?.attributeId === rule.attributeId;
  }

  /** True if this rule is currently selected in the visualizer. */
  protected isSelected(rule: IContextualPricingAttributeDto): boolean {
    return this.selectedRuleId() === rule.attributeId;
  }

  /** Formatted modifier string, e.g. "+15%" or "–8%". */
  protected formatModifier(pct: number): string {
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  }

  /** Revenue impact class for color coding. */
  protected getImpactClass(pct: number): string {
    if (pct > 0) return 'mrp-impact--positive';
    if (pct < 0) return 'mrp-impact--negative';
    return 'mrp-impact--neutral';
  }

  /** Total modifier display label (now represents total Willingness to Pay). */
  protected get totalModifierLabel(): string {
    const t = this.totalModifier();
    return `SGD ${t.toFixed(0)}`;
  }

  /** Total modifier CSS class. */
  protected get totalModifierClass(): string {
    const t = this.totalModifier();
    if (t > 0) return 'mrp-total--positive';
    if (t < 0) return 'mrp-total--negative';
    return 'mrp-total--neutral';
  }

  protected trackById(_: number, rule: IContextualPricingAttributeDto): number {
    return rule.attributeId;
  }
}