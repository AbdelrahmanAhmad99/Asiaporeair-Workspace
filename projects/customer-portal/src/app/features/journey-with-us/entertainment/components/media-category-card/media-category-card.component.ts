// ============================================================================
// media-category-card.component.ts
// Asiaporeair | Dumb Component — Entertainment Media Category Card
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IMediaCategory } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-media-category-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './media-category-card.component.html',
  styleUrl: './media-category-card.component.scss'
})
export class MediaCategoryCardComponent {
  @Input({ required: true }) category!: IMediaCategory;
  @Input() animDelay: number = 0;
}