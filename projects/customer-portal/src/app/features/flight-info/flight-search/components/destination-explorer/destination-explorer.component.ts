// ============================================================================
// destination-explorer.component.ts
// Asiaporeair | Destination Discovery Grid — Dumb Component
// Card click emits upward; NO navigation inside this component.
// ============================================================================

import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IDestinationCard } from '../../../store/flights.store';

@Component({
  selector: 'app-destination-explorer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './destination-explorer.component.html',
  styleUrls: ['./destination-explorer.component.scss']
})
export class DestinationExplorerComponent {
  @Input() destinations: IDestinationCard[] = [];
  @Input() isLoading: boolean = false;

  /** Emits the destination card that was clicked so the smart page can patch the engine. */
  @Output() destinationSelected = new EventEmitter<IDestinationCard>();
}