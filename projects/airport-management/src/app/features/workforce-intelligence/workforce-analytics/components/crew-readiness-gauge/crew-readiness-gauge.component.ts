

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICrewIntelligenceKpis } from '../../store/workforce-wad.store';

// Tick marks for the gauge — major every 10%, minor every 5%
interface ITick {
  x1: number; y1: number;
  x2: number; y2: number;
  major: boolean;
}

function buildTicks(cx: number, cy: number, innerR: number, outerR: number, count: number): ITick[] {
  const ticks: ITick[] = [];
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (i / count) * 2 * Math.PI;
    const major = i % 2 === 0;
    const r1 = major ? outerR : innerR + (outerR - innerR) * 0.4;
    const r2 = outerR;
    ticks.push({
      x1: cx + r1 * Math.cos(angle), y1: cy + r1 * Math.sin(angle),
      x2: cx + r2 * Math.cos(angle), y2: cy + r2 * Math.sin(angle),
      major,
    });
  }
  return ticks;
}

const TICKS = buildTicks(60, 60, 61, 68, 20);

@Component({
  selector: 'aoms-crew-readiness-gauge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './crew-readiness-gauge.component.html',
  styleUrl: './crew-readiness-gauge.component.scss',
})
export class CrewReadinessGaugeComponent {
  readonly kpis = input.required<ICrewIntelligenceKpis>();
  readonly loading = input<boolean>(false);

  protected readonly ticks = TICKS;

  protected readonly statusColour = computed(() => {
    switch (this.kpis().readinessStatus) {
      case 'optimal': return '#B68F24';   // Royal Gold
      case 'nominal': return '#059669';   // Emerald
      case 'strained': return '#B45309';   // Amber
      case 'critical': return '#710D06';   // Ruby
    }
  });

  protected readonly glowId = computed(() =>
    `cg-glow-${this.kpis().readinessStatus}`
  );

  protected readonly readoutLabel = computed(() => {
    const pct = this.kpis().readinessPct;
    return `${pct}%`;
  });
}