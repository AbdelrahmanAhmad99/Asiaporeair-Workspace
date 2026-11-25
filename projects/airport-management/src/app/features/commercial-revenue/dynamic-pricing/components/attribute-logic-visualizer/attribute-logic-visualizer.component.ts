import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { IContextualPricingAttributeDto } from '@shared-core';

// ── Node definitions ───────────────────────────────────────────────────────
export interface IFlowNode {
  id: string;
  type: 'trigger' | 'condition' | 'modifier' | 'output';
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IFlowEdge {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// ── SVG canvas dimensions ──────────────────────────────────────────────────
const SVG_WIDTH = 280;
const SVG_HEIGHT = 380;
const NODE_W = 200;
const NODE_H = 52;
const CENTER_X = SVG_WIDTH / 2;

@Component({
  selector: 'aoms-attribute-logic-visualizer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './attribute-logic-visualizer.component.html',
  styleUrl: './attribute-logic-visualizer.component.scss',
})
export class AttributeLogicVisualizerComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly selectedRule = input<IContextualPricingAttributeDto | null>(null);
  readonly isSimulating = input<boolean>(false);
  readonly simulationRan = input<boolean>(false);

  // ── SVG dimensions exposed to template ────────────────────────────────
  protected readonly svgWidth = SVG_WIDTH;
  protected readonly svgHeight = SVG_HEIGHT;

  // ── Computed flow nodes ────────────────────────────────────────────────
  readonly flowNodes = computed<IFlowNode[]>(() => {
    const rule = this.selectedRule();
    if (!rule) return [];

    return [
      {
        id: 'trigger',
        type: 'trigger',
        label: 'Pricing Request',
        sublabel: 'Booking context received',
        x: CENTER_X - NODE_W / 2,
        y: 24,
        width: NODE_W,
        height: NODE_H,
      },
      {
        id: 'condition',
        type: 'condition',
        label: `Contextual Pricing Rule`,
        sublabel: `Rule #${rule.attributeId}`,
        x: CENTER_X - NODE_W / 2,
        y: 130,
        width: NODE_W,
        height: NODE_H,
      },
      {
        id: 'modifier',
        type: 'modifier',
        label: 'Apply Willingness-to-Pay',
        sublabel: rule.willingnessToPay != null ? `SGD ${rule.willingnessToPay}` : 'Not set',
        x: CENTER_X - NODE_W / 2,
        y: 236,
        width: NODE_W,
        height: NODE_H,
      },
      {
        id: 'output',
        type: 'output',
        label: 'Adjusted Fare Price',
        sublabel: `Rule #${rule.attributeId}`,
        x: CENTER_X - NODE_W / 2,
        y: 306,
        width: NODE_W,
        height: NODE_H,
      },
    ];
  });

  // ── Computed flow edges ────────────────────────────────────────────────
  readonly flowEdges = computed<IFlowEdge[]>(() => {
    const nodes = this.flowNodes();
    if (nodes.length < 2) return [];

    const edges: IFlowEdge[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const from = nodes[i];
      const to = nodes[i + 1];
      edges.push({
        id: `${from.id}->${to.id}`,
        fromId: from.id,
        toId: to.id,
        label: i === 1 ? 'MATCH ✓' : undefined,
        x1: CENTER_X,
        y1: from.y + from.height,
        x2: CENTER_X,
        y2: to.y,
      });
    }
    return edges;
  });

  // ── Modifier sign helper ───────────────────────────────────────────────
  protected modifierSign(pct: number): string {
    return pct >= 0 ? `+${pct}%` : `${pct}%`;
  }

  // ── Node CSS class ─────────────────────────────────────────────────────
  protected nodeClass(node: IFlowNode): string {
    return `alv-node alv-node--${node.type}`;
  }

  // ── Track by ──────────────────────────────────────────────────────────
  protected trackById(_: number, item: { id: string }): string {
    return item.id;
  }
}