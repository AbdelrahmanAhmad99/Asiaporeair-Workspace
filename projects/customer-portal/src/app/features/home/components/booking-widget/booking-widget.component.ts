
// Luxury shell wrapper around FlightSearchEngineComponent.
// Handles the `pendingPatch` → applyPatch() bridge between smart page and engine.

import {
  Component, Input, Output, EventEmitter, ViewChild,
  ChangeDetectionStrategy, OnChanges, SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ISearchEnginePatch } from '../../store/flights.store';
import { QuickTab } from '../../pages/home/home.component';

// ── Import the real FlightSearchEngineComponent ───────────────────────────────
// Adjust the relative path if your project structure differs.
// The canonical source is: src/app/features/flight-info/components/flight-search-engine/
import { FlightSearchEngineComponent } from '../../../flight-info/flight-search/components/flight-search-engine/flight-search-engine.component';

@Component({
  selector: 'app-booking-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, FlightSearchEngineComponent],
  templateUrl: './booking-widget.component.html',
  styleUrls: ['./booking-widget.component.scss'],
})
export class BookingWidgetComponent implements OnChanges {

  /** Which quick-action tab is currently selected. */
  @Input({ required: true }) activeTab!: QuickTab;

  /**
   * When the smart page sets this after a destination card click,
   * `ngOnChanges` forwards it to the search engine via `applyPatch()`.
   */
  @Input() pendingPatch: ISearchEnginePatch | null = null;

  /** Emits once after the patch has been forwarded so the parent can clear it. */
  @Output() patchApplied = new EventEmitter<void>();

  /**
   * Direct reference to the underlying FlightSearchEngineComponent.
   * Used to call `applyPatch()` imperatively without exposing engine internals
   * to the smart page (preserves component encapsulation).
   */
  @ViewChild(FlightSearchEngineComponent)
  private readonly searchEngine?: FlightSearchEngineComponent;

  ngOnChanges(changes: SimpleChanges): void {
    // Forward a patch the moment both the patch and the engine are available.
    if (changes['pendingPatch'] && this.pendingPatch && this.searchEngine) {
      this.searchEngine.patchSearchForm(this.pendingPatch);
      this.patchApplied.emit();
    }
  }
}