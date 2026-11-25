

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

const CX = 130;
const CY = 130;
const R = 96;
const STROKE = 16;

@Component({
  selector: 'aoms-financial-health-meter',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './financial-health-meter.component.html',
  styleUrl: './financial-health-meter.component.scss',
})
export class FinancialHealthMeterComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  /** Net profit margin percentage (0–100+), e.g. from store.netProfitMargin(). */
  readonly value = input.required<number>();
  /** Target margin percentage the company aims for. */
  readonly target = input<number>(20);
  /** Upper bound of the gauge's visual scale — margins rarely exceed this. */
  readonly maxScale = input<number>(35);
  readonly loading = input<boolean>(false);
  readonly label = input<string>('Net Profit Margin');

  protected readonly cx = CX;
  protected readonly cy = CY;
  protected readonly r = R;
  protected readonly strokeWidth = STROKE;

  // ── Computed ──────────────────────────────────────────────────────────

  readonly clampedFraction = computed<number>(() => {
    const max = this.maxScale() || 1;
    return Math.min(1, Math.max(0, this.value() / max));
  });

  readonly targetFraction = computed<number>(() => {
    const max = this.maxScale() || 1;
    return Math.min(1, Math.max(0, this.target() / max));
  });

  readonly isOnTarget = computed<boolean>(() => this.value() >= this.target());

  /** Background full-semicircle track (180° → 0°). */
  readonly trackPath = computed<string>(() => this._describeArc(180, 0));

  /** Progress arc from 180° down to the value's mapped angle. */
  readonly progressPath = computed<string>(() => {
    const sweepDeg = this.clampedFraction() * 180;
    return this._describeArc(180, 180 - sweepDeg);
  });

  /** Position + rotation for the small target tick mark on the track. */
  readonly targetTick = computed<{ x1: number; y1: number; x2: number; y2: number }>(() => {
    const angle = 180 - this.targetFraction() * 180;
    const rad = (angle * Math.PI) / 180;
    const rOuter = R + STROKE / 2 + 6;
    const rInner = R - STROKE / 2 - 6;
    return {
      x1: CX + rInner * Math.cos(rad),
      y1: CY - rInner * Math.sin(rad),
      x2: CX + rOuter * Math.cos(rad),
      y2: CY - rOuter * Math.sin(rad),
    };
  });

  readonly gaugeGradientId = computed<string>(() => this.isOnTarget() ? 'fhmGaugeOnTarget' : 'fhmGaugeBelowTarget');

  protected readonly statusLabel = computed<string>(() =>
    this.isOnTarget() ? 'On Target' : 'Below Target'
  );

  protected readonly statusIconPath = computed<string>(() =>
    this.isOnTarget()
      ? 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'
      : 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008Z'
  );

  // ── Private: arc geometry ────────────────────────────────────────────
  private _polarToCartesian(angleDeg: number): { x: number; y: number } {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: CX + R * Math.cos(rad), y: CY - R * Math.sin(rad) };
  }

  private _describeArc(startAngle: number, endAngle: number): string {
    const start = this._polarToCartesian(startAngle);
    const end = this._polarToCartesian(endAngle);
    const largeArcFlag = Math.abs(startAngle - endAngle) > 180 ? 1 : 0;
    // sweepFlag=1 traces the arc clockwise on-screen given our y-flipped polar mapping
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${R} ${R} 0 ${largeArcFlag} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  }
}