// ============================================================================
// chef-quote-card.component.ts
// Asiaporeair | Dumb Component — Chef Quote Card
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IChefProfile } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-chef-quote-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './chef-quote-card.component.html',
  styleUrls: ['./chef-quote-card.component.scss'],
})
export class ChefQuoteCardComponent {
  @Input({ required: true }) chef!: IChefProfile;
  /** Compact mode hides awards and reduces padding — for use in sidebars */
  @Input() compact: boolean = false;
}