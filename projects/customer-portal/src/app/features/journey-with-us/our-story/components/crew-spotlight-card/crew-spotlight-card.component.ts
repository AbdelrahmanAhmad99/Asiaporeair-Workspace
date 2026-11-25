// ============================================================================
// crew-spotlight-card.component.ts
// Asiaporeair | Dumb Component — Crew Spotlight Card
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICrewSpotlight } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-crew-spotlight-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './crew-spotlight-card.component.html',
  styleUrl: './crew-spotlight-card.component.scss'
})
export class CrewSpotlightCardComponent {
  @Input({ required: true }) crew!: ICrewSpotlight;
  @Input() animDelay: number = 0;
}