// ============================================================================
// amenity-grid-item.component.ts
// Asiaporeair | Dumb Component — Amenity Detail Item (Grid block)
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAmenityItem } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-amenity-grid-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './amenity-grid-item.component.html',
  styleUrl: './amenity-grid-item.component.scss',

})
export class AmenityGridItemComponent {
  @Input({ required: true }) amenity!: IAmenityItem;
  /** If true, text is on the left and image on the right */
  @Input() imageLeft: boolean = false;
}