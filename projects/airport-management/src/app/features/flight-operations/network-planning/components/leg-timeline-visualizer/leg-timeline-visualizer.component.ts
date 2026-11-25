
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IFlightLegDefDto } from '@shared-core';

export interface ITimelineSegment {
  leg: IFlightLegDefDto;
  widthPercent: number;
  depMinutes: number;
  arrMinutes: number;
  isConflict: boolean;
}

function _toMins(time: string, offsetDays: number): number {
  const [h, m] = time.split(':').map(Number);
  return offsetDays * 1440 + (h ?? 0) * 60 + (m ?? 0);
}

@Component({
  selector: 'aoms-leg-timeline-visualizer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './leg-timeline-visualizer.component.html',
  styleUrl: './leg-timeline-visualizer.component.scss',
})
export class LegTimelineVisualizerComponent {
  readonly legs = input.required<IFlightLegDefDto[]>();
  readonly totalBlockMins = input<number>(0);
  readonly hasTimeConflict = input<boolean>(false);
  readonly loading = input<boolean>(false);

  readonly onLegClick = output<number>();

  protected readonly shimmerRows = Array(3).fill(null);

  /** Build proportional timeline segments from sorted legs. */
  protected readonly segments = computed<ITimelineSegment[]>(() => {
    const sorted = [...this.legs()]
      .sort((a, b) => a.segmentNumber - b.segmentNumber);

    if (sorted.length === 0) return [];

    // Total span = from first dep to last arr
    const firstDep = _toMins(sorted[0].departureTimeLocal, sorted[0].departureOffsetDays);
    const lastArr = _toMins(
      sorted[sorted.length - 1].arrivalTimeLocal,
      sorted[sorted.length - 1].arrivalOffsetDays
    );
    const span = Math.max(lastArr - firstDep, 1);

    return sorted.map((leg, i) => {
      const depMins = _toMins(leg.departureTimeLocal, leg.departureOffsetDays);
      const arrMins = _toMins(leg.arrivalTimeLocal, leg.arrivalOffsetDays);
      const duration = Math.max(arrMins - depMins, 1);
      const widthPercent = (duration / span) * 100;

      // Conflict: this leg departs before previous leg arrived
      let isConflict = false;
      if (i > 0) {
        const prevArr = _toMins(
          sorted[i - 1].arrivalTimeLocal,
          sorted[i - 1].arrivalOffsetDays
        );
        isConflict = depMins < prevArr;
      }

      return { leg, widthPercent, depMinutes: depMins, arrMinutes: arrMins, isConflict };
    });
  });

  /** All distinct airport nodes (no duplicates) in corridor order. */
  protected readonly nodes = computed<IFlightLegDefDto[]>(() => this.legs());

  protected formatDuration(seg: ITimelineSegment): string {
    const diff = seg.arrMinutes - seg.depMinutes;
    if (diff <= 0) return '?h';
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  protected trackByLeg(_: number, seg: ITimelineSegment): number {
    return seg.leg.legDefId;
  }
}