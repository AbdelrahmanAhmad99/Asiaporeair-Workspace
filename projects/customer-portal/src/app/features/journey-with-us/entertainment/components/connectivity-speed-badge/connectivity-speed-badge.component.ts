// ============================================================================
// connectivity-speed-badge.component.ts
// Asiaporeair | Dumb Component — Connectivity Plan Speed Badge Card
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IConnectivityPlan } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-connectivity-speed-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './connectivity-speed-badge.component.html',
  styleUrl: './connectivity-speed-badge.component.scss'
})
export class ConnectivitySpeedBadgeComponent {
  @Input({ required: true }) plan!: IConnectivityPlan;
  @Input() animDelay: number = 0;
}