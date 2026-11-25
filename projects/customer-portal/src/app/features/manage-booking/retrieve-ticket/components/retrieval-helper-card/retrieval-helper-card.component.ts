// ============================================================================
// retrieval-helper-card.component.ts
// Asiaporeair | Informational helper card — Dumb/UI Component
// ============================================================================

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-retrieval-helper-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('accordionExpand', [
      transition(':enter', [
        style({ opacity: 0, maxHeight: '0px', overflow: 'hidden' }),
        animate('300ms ease-out', style({ opacity: 1, maxHeight: '300px' }))
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ opacity: 0, maxHeight: '0px' }))
      ])
    ])
  ],
  templateUrl: './retrieval-helper-card.component.html',
  styleUrls: ['./retrieval-helper-card.component.scss']
})
export class RetrievalHelperCardComponent {
  /** Drives the accordion expand/collapse of the detailed explanation section. */
  isExpanded = false;

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }
}
