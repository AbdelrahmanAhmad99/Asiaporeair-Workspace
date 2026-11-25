// ============================================================================
// heritage.component.ts
// Asiaporeair | Smart Page — Our Heritage (Timeline + Vintage Photos)
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  TIMELINE_EVENTS, VINTAGE_PHOTOS,
  ITimelineEvent, IVintagePhoto
} from '../../../models/journey-with-us.models';
import { TimelineMilestoneComponent } from '../../components/timeline-milestone/timeline-milestone.component';
import { VintagePhotoFrameComponent } from '../../components/vintage-photo-frame/vintage-photo-frame.component';

@Component({
  selector: 'app-heritage',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, TimelineMilestoneComponent, VintagePhotoFrameComponent],
  templateUrl: './heritage.component.html',
  styleUrls: ['./heritage.component.scss']
})
export class HeritageComponent {

  readonly breadcrumbs = [
    { label: 'Home', route: '/' },
    { label: 'Journey With Us', route: '/journey-with-us/landing' },
    { label: 'Our Story', route: '/journey-with-us/our-story' },
    { label: 'Our Heritage' }
  ];

  readonly timelineEvents = signal<ITimelineEvent[]>(TIMELINE_EVENTS);
  readonly vintagePhotos = signal<IVintagePhoto[]>(VINTAGE_PHOTOS);

  /** Returns 'left' or 'right' to alternate timeline panel sides */
  sideFor(index: number): 'left' | 'right' {
    return index % 2 === 0 ? 'right' : 'left';
  }

  trackById(_: number, item: { id: string }): string { return item.id; }
}