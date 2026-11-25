
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IRuleBuilderFormValue } from '../rule-builder-form/rule-builder-form.component';

// ── SVG canvas constants ──────────────────────────────────────────────────
const SVG_W = 280;
const SVG_H = 400;
const NODE_W = 220;
const NODE_H = 56;
const CX = SVG_W / 2;

// ── Node type definition ──────────────────────────────────────────────────
export interface IEditorFlowNode {
  id: string;
  type: 'trigger' | 'condition' | 'modifier' | 'output';
  title: string;
  subtitle: string;
  y: number;
  filled: boolean; // true when the user has supplied a meaningful value
}

@Component({
  selector: 'aoms-attribute-editor-visualizer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './attribute-editor-visualizer.component.html',
  styleUrl: './attribute-editor-visualizer.component.scss',
})
export class AttributeEditorVisualizerComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly liveValue = input<IRuleBuilderFormValue | null>(null);
  readonly isEditMode = input<boolean>(false);
  readonly ruleId = input<number | null>(null);

  // ── SVG dimensions exposed to template ────────────────────────────────
  protected readonly svgW = SVG_W;
  protected readonly svgH = SVG_H;
  protected readonly cx = CX;
  protected readonly nodeW = NODE_W;
  protected readonly nodeH = NODE_H;

  // ── Animation key — toggled on each new value to re-trigger pulse ──────
  // Incrementing a key on a group causes Angular to recreate the element,
  // which re-runs the CSS @keyframes pulse automatically.
  private readonly _pulseKey = signal<number>(0);
  protected readonly pulseKey = this._pulseKey.asReadonly();

  // ── Computed node list ──────────────────────────────────────────────────
  readonly nodes = computed<IEditorFlowNode[]>(() => {
    const v = this.liveValue();

    // Bump the pulse key whenever live value changes
    this._pulseKey.update(k => k + 1);

    const attrType = v?.attributeType?.trim() ?? '';
    const targetVal = v?.targetValue?.trim() ?? '';
    const modifier = v?.modifierPercentage ?? null;
    const priority = v?.priority ?? null;

    const modLabel = modifier != null
      ? `${modifier >= 0 ? '+' : ''}${modifier}% applied to base fare`
      : 'Modifier not yet defined';

    const prioLabel = priority != null ? `Priority ${priority}` : '';

    return [
      {
        id: 'trigger',
        type: 'trigger',
        title: 'Pricing Request',
        subtitle: 'Booking context received by engine',
        y: 20,
        filled: true,
      },
      {
        id: 'condition',
        type: 'condition',
        title: attrType ? `IF ${attrType}` : 'IF [Attribute not set]',
        subtitle: targetVal ? `equals "${targetVal}"` : 'Target value not defined',
        y: 136,
        filled: attrType.length > 0 && targetVal.length > 0,
      },
      {
        id: 'modifier',
        type: 'modifier',
        title: 'THEN Apply Modifier',
        subtitle: modLabel,
        y: 252,
        filled: modifier != null,
      },
      {
        id: 'output',
        type: 'output',
        title: 'Adjusted Fare Price',
        subtitle: prioLabel || 'Priority not set',
        y: 336,
        filled: priority != null && attrType.length > 0,
      },
    ];
  });

  // ── Computed edge list ──────────────────────────────────────────────────
  readonly edges = computed<{ id: string; x1: number; y1: number; x2: number; y2: number; label?: string; active: boolean }[]>(() => {
    const ns = this.nodes();
    return ns.slice(0, -1).map((n, i) => ({
      id: `${n.id}->${ns[i + 1].id}`,
      x1: CX,
      y1: n.y + NODE_H,
      x2: CX,
      y2: ns[i + 1].y,
      label: i === 1 ? 'MATCH' : undefined,
      active: n.filled && ns[i + 1].filled,
    }));
  });

  // ── Overall completion score ─────────────────────────────────────────────
  readonly completionPct = computed<number>(() => {
    const v = this.liveValue();
    if (!v) return 0;
    let score = 0;
    if (v.attributeType?.trim()) score += 25;
    if (v.targetValue?.trim()) score += 25;
    if (v.modifierPercentage != null) score += 25;
    if (v.priority != null && v.priority >= 1) score += 25;
    return score;
  });

  // ── Modifier display helpers ───────────────────────────────────────────
  protected get modifierDisplay(): string {
    const pct = this.liveValue()?.modifierPercentage;
    if (pct == null) return '–';
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  }

  protected get modifierClass(): string {
    const pct = this.liveValue()?.modifierPercentage;
    if (pct == null || pct === 0) return 'aev-modifier--neutral';
    return pct > 0 ? 'aev-modifier--positive' : 'aev-modifier--negative';
  }

  // ── TrackBy ──────────────────────────────────────────────────────────────
  protected trackById(_: number, item: { id: string }): string { return item.id; }
}