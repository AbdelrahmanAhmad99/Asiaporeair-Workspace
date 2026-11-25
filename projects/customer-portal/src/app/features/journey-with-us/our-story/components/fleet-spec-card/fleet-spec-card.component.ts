// ============================================================================
// fleet-spec-card.component.ts
// Asiaporeair | Dumb Component — Fleet Aircraft Spec Card
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IFleetData } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-fleet-spec-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './fleet-spec-card.component.html',
  styleUrl: './fleet-spec-card.component.scss'
})
export class FleetSpecCardComponent {
  @Input({ required: true }) fleet!: IFleetData;
  @Input() animDelay: number = 0;
}