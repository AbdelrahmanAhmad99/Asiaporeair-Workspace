

import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ITimelineStep } from '../../store/booking-center.store';

@Component({
  selector: 'aoms-pnr-timeline-stepper',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pnr-timeline-stepper.component.html',
  styleUrl: './pnr-timeline-stepper.component.scss',
})
export class PnrTimelineStepperComponent {
  readonly steps = input.required<ITimelineStep[]>();
}