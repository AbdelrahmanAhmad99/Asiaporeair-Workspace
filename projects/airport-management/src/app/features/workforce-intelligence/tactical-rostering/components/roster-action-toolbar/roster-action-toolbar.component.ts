

import {
  ChangeDetectionStrategy, Component, input, output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IFlightInstanceDto } from '@shared-core';

@Component({
  selector: 'aoms-roster-action-toolbar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './roster-action-toolbar.component.html',
  styleUrl: './roster-action-toolbar.component.scss',

})
export class RosterActionToolbarComponent {
  readonly flight = input<IFlightInstanceDto | null>(null);
  readonly rosterCount = input<number>(0);
  readonly isProcessing = input<boolean>(false);

  readonly assignPilot = output<void>();
  readonly assignCrew = output<void>();
}

