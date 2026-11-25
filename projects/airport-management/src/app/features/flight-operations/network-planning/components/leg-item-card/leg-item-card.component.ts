
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IFlightLegDefDto } from '@shared-core';

@Component({
  selector: 'aoms-leg-item-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './leg-item-card.component.html',
  styleUrl: './leg-item-card.component.scss',
})
export class LegItemCardComponent {
  readonly leg = input.required<IFlightLegDefDto>();
  readonly isProcessing = input<boolean>(false);

  readonly onEdit = output<IFlightLegDefDto>();
  readonly onRemove = output<number>();

  /** True while leg hasn't been confirmed by the server (optimistic) */
  protected readonly isOptimistic = computed<boolean>(() => this.leg().legDefId < 0);

  /** Block time in "Xh XXm" format */
  protected readonly duration = computed<string>(() => {
    const l = this.leg();
    const depMins = l.departureOffsetDays * 1440 + _parseTime(l.departureTimeLocal);
    const arrMins = l.arrivalOffsetDays * 1440 + _parseTime(l.arrivalTimeLocal);
    const diff = arrMins - depMins;
    if (diff <= 0) return '—';
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  });

  /** Day-offset label shown next to time (e.g. "+1") */
  protected readonly arrivalOffsetLabel = computed<string>(() => {
    const o = this.leg().arrivalOffsetDays;
    return o > 0 ? `+${o}` : '';
  });
}

function _parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}