// ============================================================================
// award-medal-badge.component.ts
// Asiaporeair | Dumb Component — Award Medal Badge
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAwardItem } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-award-medal-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './award-medal-badge.component.html',
  styleUrl: './award-medal-badge.component.scss',
})
export class AwardMedalBadgeComponent {
  @Input({ required: true }) award!: IAwardItem;
  @Input() animDelay: number = 0;
}