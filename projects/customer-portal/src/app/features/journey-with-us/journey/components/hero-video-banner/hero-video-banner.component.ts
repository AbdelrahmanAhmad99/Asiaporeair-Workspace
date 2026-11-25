// ============================================================================
// hero-video-banner.component.ts
// Asiaporeair | Dumb Component — Hero Video Banner
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-video-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './hero-video-banner.component.html',
  styleUrls: ['./hero-video-banner.component.scss']
})
export class HeroVideoBannerComponent {
  /** Path to the mp4 / webm video. Falls back to posterImage if undefined. */
  @Input() videoSrc: string = 'assets/videos/journey-with-us-hero.mp4';
  /** Fallback image shown before the video loads */
  @Input() posterImage: string = 'assets/images/journey-with-us/hero-poster.png';
  @Input() headline: string = 'The Journey Is the Destination';
  @Input() subheadline: string = 'Every flight is a curated experience of service, space, and refined luxury.';
  @Input() breadcrumbs: { label: string; route?: string }[] = [];
}