// ============================================================================
// popular-routes.component.ts
// Asiaporeair | Premium Route Cards — Dumb Component
// Card click emits upward; NO navigation or API call inside this component.
// ============================================================================

import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IPopularRoute } from '../../../store/flights.store';

@Component({
  selector: 'app-popular-routes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './popular-routes.component.html',
  styleUrls: ['./popular-routes.component.scss']
})
export class PopularRoutesComponent {
  @Input() routes: IPopularRoute[] = [];
  @Input() isLoading: boolean = false;

  /** Emits the route that was clicked so the smart page can patch the engine. */
  @Output() routeSelected = new EventEmitter<IPopularRoute>();
}