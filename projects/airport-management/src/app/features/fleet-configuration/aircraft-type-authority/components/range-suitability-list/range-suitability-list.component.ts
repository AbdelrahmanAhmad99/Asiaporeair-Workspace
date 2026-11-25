
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ISuitabilityResult, EfficiencyTier } from '../../store/aircraft-types.store';

// ── Staggered scale-in animation ─────────────────────────────────────────
export const resultsAnimation = trigger('resultsList', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'scale(0.96) translateY(6px)' }),
      stagger(45, [
        animate(
          '260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' })
        ),
      ]),
    ], { optional: true }),
  ]),
]);

// ── Badge configuration ───────────────────────────────────────────────────
interface IEfficiencyBadge {
  label: string;
  cssClass: string;
  iconPath: string;
}

const EFFICIENCY_BADGES: Record<EfficiencyTier, IEfficiencyBadge> = {
  optimal: {
    label: 'Optimal Range',
    cssClass: 'badge--optimal',
    iconPath: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  },
  capable: {
    label: 'Within Limits',
    cssClass: 'badge--capable',
    iconPath: 'M9 12.75 11.25 15 15 9.75m-10.5.75a8.25 8.25 0 1 1 16.5 0 8.25 8.25 0 0 1-16.5 0z',
  },
  'near-limit': {
    label: 'Near Limit',
    cssClass: 'badge--near-limit',
    iconPath: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  },
  inefficient: {
    label: 'Over-Specified',
    cssClass: 'badge--inefficient',
    iconPath: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z',
  },
};

@Component({
  selector: 'aoms-range-suitability-list',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [resultsAnimation],
  templateUrl: './range-suitability-list.component.html',
  styleUrl: './range-suitability-list.component.scss',
})
export class RangeSuitabilityListComponent {
  // ── Inputs ──────────────────────────────────────────────────────────────
  readonly results = input.required<ISuitabilityResult[]>();
  readonly targetDistanceKm = input<number>(0);
  readonly isAnalyzing = input<boolean>(false);
  readonly suitableCount = input<number>(0);

  // ── Outputs ─────────────────────────────────────────────────────────────
  readonly viewSpecs = output<number>();  // typeId

  // ── Constants ─────────────────────────────────────────────────────────
  protected readonly badges = EFFICIENCY_BADGES;
  protected readonly shimmerRows = Array(5).fill(null);

  // ── Computed ──────────────────────────────────────────────────────────
  readonly suitableResults = computed(() => this.results().filter(r => r.isSuitable));
  readonly unsuitableResults = computed(() => this.results().filter(r => !r.isSuitable));

  protected badgeFor(tier: EfficiencyTier): IEfficiencyBadge {
    return EFFICIENCY_BADGES[tier];
  }

  protected formatMargin(marginKm: number): string {
    if (marginKm >= 0) return `+${marginKm.toLocaleString()} km margin`;
    return `${Math.abs(marginKm).toLocaleString()} km short`;
  }

  protected formatRange(km: number | undefined): string {
    if (km == null) return '—';
    return km >= 1000 ? `${(km / 1000).toFixed(1)}k km` : `${km} km`;
  }
}