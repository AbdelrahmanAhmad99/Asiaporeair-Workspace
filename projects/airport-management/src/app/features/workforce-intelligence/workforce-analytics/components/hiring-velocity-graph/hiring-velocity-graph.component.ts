

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// Co-located types (in production imported from the store)
export interface IHiringMonthPoint {
  monthKey: string;
  label: string;
  count: number;
  x: number;
  y: number;
}

export interface IRecruitmentReport {
  totalHired: number;
  monthPoints: IHiringMonthPoint[];
  peakMonth: IHiringMonthPoint | null;
  avgPerMonth: number;
  svgPolylinePath: string;
  svgAreaPath: string;
  hasData: boolean;
}

/** Build a smooth Catmull-Rom cubic bezier path from the month points */
function buildSmoothPath(pts: IHiringMonthPoint[]): string {
  if (pts.length < 2) return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  const path: string[] = [`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path.push(`C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`);
  }
  return path.join(' ');
}

const SVG_W = 100; const SVG_H = 60; const PAD = 5;

@Component({
  selector: 'aoms-hiring-velocity-graph',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './hiring-velocity-graph.component.html',
  styleUrl: './hiring-velocity-graph.component.scss',
})
export class HiringVelocityGraphComponent {
  readonly report = input.required<IRecruitmentReport>();
  readonly loading = input<boolean>(false);

  protected readonly SVG_W = SVG_W;
  protected readonly SVG_H = SVG_H;
  protected readonly PAD = PAD;

  protected readonly hoveredIndex = signal<number | null>(null);

  // Smooth cubic bezier path (computed from input)
  protected readonly smoothPath = computed(() =>
    buildSmoothPath(this.report().monthPoints)
  );

  // Closed area path using smooth curve + bottom closing
  protected readonly smoothAreaPath = computed(() => {
    const pts = this.report().monthPoints;
    if (!pts.length) return '';
    const smooth = this.smoothPath();
    const bottomY = SVG_H - PAD;
    const firstX = pts[0].x.toFixed(2);
    const lastX = pts.at(-1)!.x.toFixed(2);
    return `${smooth} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  });

  // Y-axis tick values
  protected readonly yTicks = computed(() => {
    const pts = this.report().monthPoints;
    if (!pts.length) return [];
    const maxCount = Math.max(...pts.map(p => p.count), 1);
    const step = Math.ceil(maxCount / 4);
    const ticks: Array<{ val: number; y: number }> = [];
    for (let v = 0; v <= maxCount; v += step) {
      const yNorm = SVG_H - PAD - (v / maxCount) * (SVG_H - PAD * 2);
      ticks.push({ val: v, y: yNorm });
    }
    return ticks;
  });

  // Which labels to show (avoid overlap when many months)
  protected readonly visibleLabels = computed<boolean[]>(() => {
    const pts = this.report().monthPoints;
    const total = pts.length;
    if (total <= 8) return pts.map(() => true);
    // Show every N-th label
    const step = Math.ceil(total / 8);
    return pts.map((_, i) => i === 0 || i === total - 1 || i % step === 0);
  });

  protected trackByKey(_: number, p: IHiringMonthPoint): string { return p.monthKey; }

  protected onPointHover(i: number): void { this.hoveredIndex.set(i); }
  protected onPointLeave(): void { this.hoveredIndex.set(null); }
}