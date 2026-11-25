// ============================================================================
// our-fleet.component.ts
// Asiaporeair | Smart Page — Our Fleet
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FleetSpecCardComponent } from '../../components/fleet-spec-card/fleet-spec-card.component';
import { FLEET_DATA, IFleetData } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-our-fleet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, FleetSpecCardComponent],
  templateUrl: './our-fleet.component.html',
  styleUrl: './our-fleet.component.scss'
})
export class OurFleetComponent {
  readonly fleet = signal<IFleetData[]>(FLEET_DATA);
}