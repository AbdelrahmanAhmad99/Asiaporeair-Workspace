

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IDashboardKpis, IRoleChartSlice } from '../../store/workforce-wad.store';

interface IDonutSegment {
  slice: IRoleChartSlice;
  startAngle: number;
  endAngle: number;
  arcPath: string;
  cx: number;  // midpoint for label placement
  cy: number;
}

const COLOUR_MAP: Record<string, { stroke: string; fill: string }> = {
  cobalt: { stroke: '#2563EB', fill: 'rgba(37,99,235,0.18)' },
  emerald: { stroke: '#059669', fill: 'rgba(5,150,105,0.18)' },
  gold: { stroke: '#B68F24', fill: 'rgba(182,143,36,0.18)' },
  violet: { stroke: '#7C3AED', fill: 'rgba(124,58,237,0.18)' },
  amber: { stroke: '#B45309', fill: 'rgba(180,83,9,0.18)' },
  slate: { stroke: '#64748B', fill: 'rgba(100,116,139,0.18)' },
};

function buildArc(cx: number, cy: number, r: number, startRad: number, endRad: number): string {
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const large = endRad - startRad > Math.PI ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

const SVG_CX = 80; const SVG_CY = 80; const R = 58;

@Component({
  selector: 'aoms-workforce-ratio-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workforce-ratio-chart.component.html',
  styleUrl: './workforce-ratio-chart.component.scss',
})
export class WorkforceRatioChartComponent {
  readonly kpis = input.required<IDashboardKpis>();
  readonly loading = input<boolean>(false);

  protected readonly colourMap = COLOUR_MAP;

  protected readonly segments = computed<IDonutSegment[]>(() => {
    const slices = this.kpis().roleSlices;
    if (!slices.length) return [];

    const total = slices.reduce((s, r) => s + r.count, 0);
    if (!total) return [];

    let angle = -Math.PI / 2; // start at 12 o'clock
    return slices.map(slice => {
      const span = (slice.count / total) * 2 * Math.PI;
      const start = angle;
      const end = angle + span;
      const midAngle = start + span / 2;
      angle = end;
      return {
        slice,
        startAngle: start,
        endAngle: end,
        arcPath: buildArc(SVG_CX, SVG_CY, R, start, end),
        cx: SVG_CX + (R + 16) * Math.cos(midAngle),
        cy: SVG_CY + (R + 16) * Math.sin(midAngle),
      };
    });
  });

  protected readonly topDeptSlices = computed(() =>
    this.kpis().deptSlices.slice(0, 8)
  );

  protected colourFor(colorKey: string) {
    return COLOUR_MAP[colorKey] ?? COLOUR_MAP['slate'];
  }

  protected trackByRole(_: number, s: IDonutSegment): string { return s.slice.role; }
}