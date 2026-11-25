// ============================================================================
// check-in-stepper.component.ts
// Asiaporeair | Luxury Progress Indicator — Check-in Flow
// ============================================================================

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IStepperStep {
  stepNumber: number;
  label: string;
  sublabel: string;
}

@Component({
  selector: 'app-check-in-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './check-in-stepper.component.html',
  styleUrl: './check-in-stepper.component.scss',
})
export class CheckInStepperComponent {
  @Input() activeStep: number = 1;

  readonly steps: IStepperStep[] = [
    { stepNumber: 1, label: 'Identify', sublabel: 'Retrieve Itinerary' },
    { stepNumber: 2, label: 'Passengers', sublabel: 'Verify Travellers' },
    { stepNumber: 3, label: 'Confirmation', sublabel: 'Boarding Issued' }
  ];
}