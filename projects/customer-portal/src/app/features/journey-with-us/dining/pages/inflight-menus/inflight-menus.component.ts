// ============================================================================
// inflight-menus.component.ts
// Asiaporeair | Smart Page — Inflight Menu Browser
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  INFLIGHT_MENU_GROUPS, SPECIAL_MEAL_TYPES,
  IInflightMenuGroup, ISpecialMealType
} from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-inflight-menus',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './inflight-menus.component.html',
  styleUrl: './inflight-menus.component.scss',
})
export class InflightMenusComponent {
  readonly menuGroups = signal<IInflightMenuGroup[]>(INFLIGHT_MENU_GROUPS);
  readonly specialMeals = signal<ISpecialMealType[]>(SPECIAL_MEAL_TYPES);
}