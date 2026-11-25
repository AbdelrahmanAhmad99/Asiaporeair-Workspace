// ============================================================================
// hub-navigation-card.component.ts
// Asiaporeair | Dumb Component — Hub Navigation Card
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IJourneyHubSection } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-hub-navigation-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './hub-navigation-card.component.html',
  styleUrls: ['./hub-navigation-card.component.scss']
})
export class HubNavigationCardComponent {
  @Input({ required: true }) section!: IJourneyHubSection;
  @Input() index: number = 0;
}