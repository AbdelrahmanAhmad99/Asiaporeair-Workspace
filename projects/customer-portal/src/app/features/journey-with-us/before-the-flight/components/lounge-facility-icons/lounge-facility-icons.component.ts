// ============================================================================
// lounge-facility-icons.component.ts
// Asiaporeair | Dumb Component — Lounge Facility Icons Grid
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ILoungeFacility } from '../../../models/journey-with-us.models';

@Component({
  selector: 'app-lounge-facility-icons',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './lounge-facility-icons.component.html',
  styleUrl: './lounge-facility-icons.component.scss',
})
export class LoungeFacilityIconsComponent {
  @Input({ required: true }) facilities!: ILoungeFacility[];
}