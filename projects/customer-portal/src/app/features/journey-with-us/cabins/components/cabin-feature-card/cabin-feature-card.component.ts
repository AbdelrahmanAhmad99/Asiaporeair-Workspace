// ============================================================================
// cabin-feature-card.component.ts
// Asiaporeair | Dumb Component — Cabin Feature Card (Cabins Landing)
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ICabinFeatureCard } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-cabin-feature-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './cabin-feature-card.component.html',
  styleUrls: ['./cabin-feature-card.component.scss']
})
export class CabinFeatureCardComponent {
  @Input({ required: true }) cabin!: ICabinFeatureCard;
  @Input() index: number = 0;
  /** Alternate layout: image on right */
  @Input() flipped: boolean = false;
}