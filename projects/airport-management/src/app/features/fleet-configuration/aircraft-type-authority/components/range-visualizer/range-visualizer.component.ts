
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAircraftTypeDto } from '@shared-core';

// ── Range category thresholds (km) ───────────────────────────────────────
const SHORT_MAX = 3_000;
const MEDIUM_MAX = 8_000;
const LONG_MAX = 14_000;
const ABSOLUTE_MAX = 20_000; // theoretical ceiling for arc normalisation

// ── SVG arc geometry constants ────────────────────────────────────────────
const CX = 120;       // centre-x
const CY = 120;       // centre-y
const RADIUS = 88;    // arc radius
const START_ANGLE = -215; // degrees — bottom-left start
const SWEEP_ANGLE = 250;  // total sweep in degrees

type RangeCategory = 'short' | 'medium' | 'long' | 'ultra-long' | 'unknown';

@Component({
  selector: 'aoms-range-visualizer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './range-visualizer.component.html',
  styleUrl: './range-visualizer.component.scss',
})
export class RangeVisualizerComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly aircraftType = input<IAircraftTypeDto | null>(null);
  readonly loading = input<boolean>(false);

  // ── Helpers ───────────────────────────────────────────────────────────
  private _polarToCartesian(cx: number, cy: number, r: number, degrees: number) {
    const radians = ((degrees - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(radians),
      y: cy + r * Math.sin(radians),
    };
  }

  private _arcPath(pct: number): string {
    if (pct <= 0) return '';
    const clampedPct = Math.min(pct, 99.9); // avoid full-circle degenerate path
    const endDeg = START_ANGLE + (SWEEP_ANGLE * clampedPct) / 100;
    const start = this._polarToCartesian(CX, CY, RADIUS, START_ANGLE);
    const end = this._polarToCartesian(CX, CY, RADIUS, endDeg);
    const large = SWEEP_ANGLE * clampedPct / 100 > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${end.x} ${end.y}`;
  }

  private _bgArcPath(): string {
    const endDeg = START_ANGLE + SWEEP_ANGLE;
    const start = this._polarToCartesian(CX, CY, RADIUS, START_ANGLE);
    const end = this._polarToCartesian(CX, CY, RADIUS, endDeg - 0.01);
    return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 1 1 ${end.x} ${end.y}`;
  }

  // ── Computed Signals ─────────────────────────────────────────────────
  readonly percentage = computed<number>(() => {
    const km = this.aircraftType()?.rangeKm;
    if (km == null) return 0;
    return Math.round((Math.min(km, ABSOLUTE_MAX) / ABSOLUTE_MAX) * 100);
  });

  readonly arcPath = computed<string>(() => this._arcPath(this.percentage()));
  readonly bgArcPath = computed<string>(() => this._bgArcPath());

  readonly rangeCategory = computed<RangeCategory>(() => {
    const km = this.aircraftType()?.rangeKm;
    if (km == null) return 'unknown';
    if (km < SHORT_MAX) return 'short';
    if (km < MEDIUM_MAX) return 'medium';
    if (km < LONG_MAX) return 'long';
    return 'ultra-long';
  });

  readonly categoryLabel = computed<string>(() => {
    const map: Record<RangeCategory, string> = {
      'short': 'Short-Haul',
      'medium': 'Medium-Haul',
      'long': 'Long-Haul',
      'ultra-long': 'Ultra Long Range',
      'unknown': 'Not Specified',
    };
    return map[this.rangeCategory()];
  });

  readonly milesFormatted = computed<string>(() => {
    const km = this.aircraftType()?.rangeKm;
    if (km == null) return '—';
    return Math.round(km * 0.621371).toLocaleString();
  });

  readonly rangeKmFormatted = computed<string>(() => {
    const km = this.aircraftType()?.rangeKm;
    if (km == null) return '—';
    return km.toLocaleString();
  });

  // Exposed geometry constants for the template
  protected readonly svgCx = CX;
  protected readonly svgCy = CY;
}