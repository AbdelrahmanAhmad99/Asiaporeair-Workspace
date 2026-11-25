// ============================================================================
// culinary-experts.component.ts
// Asiaporeair | Smart Page — International Culinary Panel
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChefQuoteCardComponent } from '../../components/chef-quote-card/chef-quote-card.component';
import { CHEF_PROFILES, IChefProfile } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-culinary-experts',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, ChefQuoteCardComponent],
  templateUrl: './culinary-experts.component.html',
  styleUrl: './culinary-experts.component.scss',
})
export class CulinaryExpertsComponent {
  readonly chefs = signal<IChefProfile[]>(CHEF_PROFILES);
}