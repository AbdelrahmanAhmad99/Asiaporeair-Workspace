// ============================================================================
// awards.component.ts
// Asiaporeair | Smart Page — Awards & Recognition
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AwardMedalBadgeComponent } from '../../components/award-medal-badge/award-medal-badge.component';
import { AWARD_ITEMS, IAwardItem } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-awards',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, AwardMedalBadgeComponent],
  templateUrl: './awards.component.html',
  styleUrl: './awards.component.scss'
})
export class AwardsComponent {
  readonly allAwards = signal<IAwardItem[]>(AWARD_ITEMS);
  readonly grandAwards = computed(() => this.allAwards().filter(a => a.isGrand));
  readonly standardAwards = computed(() => this.allAwards().filter(a => !a.isGrand));
  readonly currentYear = new Date().getFullYear();
}