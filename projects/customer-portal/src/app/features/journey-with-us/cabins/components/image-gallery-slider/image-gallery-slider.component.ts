// ============================================================================
// image-gallery-slider.component.ts
// Asiaporeair | Dumb Component — Swipeable Image Gallery Slider
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-gallery-slider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './image-gallery-slider.component.html',
  styleUrl: './image-gallery-slider.component.scss',

})
export class ImageGallerySliderComponent {
  @Input() images: string[] = [];

  readonly activeIndex = signal<number>(0);

  prev(): void {
    this.activeIndex.update(i => Math.max(0, i - 1));
  }

  next(): void {
    this.activeIndex.update(i => Math.min(this.images.length - 1, i + 1));
  }

  setActive(index: number): void {
    this.activeIndex.set(index);
  }
}