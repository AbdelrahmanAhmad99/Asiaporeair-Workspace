
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoyaltyTier } from '../../store/loyalty-intelligence.store';

@Component({
  selector: 'aoms-krisflyer-tier-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './krisflyer-tier-badge.component.html',
  styleUrl: './krisflyer-tier-badge.component.scss',
})
export class KrisflyerTierBadgeComponent {
  readonly tier = input.required<string>();
  readonly compact = input<boolean>(false);

  readonly tierKey = computed<string>(() => {
    const t = (this.tier() ?? '').toLowerCase();
    if (t === 'gold' || t === 'elite') return 'gold';
    if (t === 'silver') return 'silver';
    return 'classic';
  });
}