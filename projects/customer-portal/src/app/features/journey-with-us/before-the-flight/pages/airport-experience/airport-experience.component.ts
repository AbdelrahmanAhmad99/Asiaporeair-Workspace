// ============================================================================
// airport-experience.component.ts
// Asiaporeair | Smart Page — Airport Experience
// ============================================================================

import {
  Component, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AIRPORT_FEATURES, IAirportFeature } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-airport-experience',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './airport-experience.component.html',
  styleUrl: './airport-experience.component.scss'
})
export class AirportExperienceComponent {
  readonly features = signal<IAirportFeature[]>(AIRPORT_FEATURES);
}