

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  animate, query, stagger, style, transition, trigger,
} from '@angular/animations';
import { IDashboardKpis } from '../../store/workforce-wad.store';

const POWER_UP = trigger('powerUp', [
  transition(':enter', [
    query('.asw-tile', [
      style({ opacity: 0, transform: 'translateY(20px) scale(0.96)' }),
      stagger(90, [
        animate('380ms cubic-bezier(0.4,0,0.2,1)',
          style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ], { optional: true }),
  ]),
]);

@Component({
  selector: 'aoms-analytics-summary-widgets',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [POWER_UP],
  templateUrl: './analytics-summary-widgets.component.html',
  styleUrl: './analytics-summary-widgets.component.scss',
})
export class AnalyticsSummaryWidgetsComponent {
  readonly kpis = input.required<IDashboardKpis>();
  readonly loading = input<boolean>(false);

  protected readonly shimmerTiles = Array(5).fill(null);

  // SVG arc for the readiness ring (SVG arc path computation)
  protected readonly readinessArcPath = computed(() => {
    const pct = this.kpis().complianceScore;
    const r = 28;
    const cx = 36; const cy = 36;
    const start = -Math.PI / 2;
    const angle = (pct / 100) * 2 * Math.PI;
    const endA = start + angle;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(endA);
    const y2 = cy + r * Math.sin(endA);
    const large = angle > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  });
}