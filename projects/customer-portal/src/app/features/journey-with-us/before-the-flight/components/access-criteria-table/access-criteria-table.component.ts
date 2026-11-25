// ============================================================================
// access-criteria-table.component.ts
// Asiaporeair | Dumb Component — Lounge Access Criteria Table
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ILoungeAccessTier } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-access-criteria-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './access-criteria-table.component.html',
  styleUrl: './access-criteria-table.component.scss',
})
export class AccessCriteriaTableComponent {
  @Input({ required: true }) tiers!: ILoungeAccessTier[];
}