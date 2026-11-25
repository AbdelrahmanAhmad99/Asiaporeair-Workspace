// ============================================================================
// timeline-milestone.component.ts
// Asiaporeair | Dumb Component — Heritage Timeline Node
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ITimelineEvent } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-timeline-milestone',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './timeline-milestone.component.html',
  styleUrls: ['./timeline-milestone.component.scss']
})
export class TimelineMilestoneComponent {
  @Input({ required: true }) event!: ITimelineEvent;
  /** Side the text panel sits — used to alternate left/right on wide screens */
  @Input() side: 'left' | 'right' = 'right';
  @Input() animDelay: number = 0;
}