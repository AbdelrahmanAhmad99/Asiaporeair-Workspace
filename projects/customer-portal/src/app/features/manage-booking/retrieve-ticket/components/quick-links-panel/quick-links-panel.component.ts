// ============================================================================
// quick-links-panel.component.ts
// Asiaporeair | Quick Links Panel — Dumb/UI Component
// ============================================================================

import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-quick-links-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './quick-links-panel.component.html',
  styleUrls: ['./quick-links-panel.component.scss']
})
export class QuickLinksPanelComponent {
  /** Emitted when the user clicks "Check Flight Status". */
  @Output() checkFlightStatus = new EventEmitter<void>();

  /** Emitted when the user clicks "Access Your Suite" (Login). */
  @Output() accessSuite = new EventEmitter<void>();

  onCheckFlightStatus(): void { this.checkFlightStatus.emit(); }
  onAccessSuite(): void      { this.accessSuite.emit(); }
}
