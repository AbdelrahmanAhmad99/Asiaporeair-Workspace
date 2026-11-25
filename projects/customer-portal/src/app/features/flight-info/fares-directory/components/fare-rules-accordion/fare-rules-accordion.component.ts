// ============================================================================
// fare-rules-accordion.component.ts
// Asiaporeair | Fare Rules Accordion — Dumb Component
// Parses the raw rules string from IFareBasisCodeDto.rules into
// categorised sections displayed in an animated accordion.
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger, transition, style, animate, state
} from '@angular/animations';

export interface IFareRuleSection {
  id: string;
  heading: string;
  icon: string;     // 'change' | 'refund' | 'baggage' | 'penalty' | 'validity' | 'general'
  content: string;  // Human-readable, pre-processed text
  isWarning: boolean;
}

/** Splits the raw rules string into structured sections. */
function parseRuleSections(rules: string, code: string): IFareRuleSection[] {
  const r = rules;
  const sections: IFareRuleSection[] = [];

  // ── Changes / Date modifications ──────────────────────────────────────────
  const changeText = extractOrDefault(r,
    ['change', 'modif', 'rebook', 'reschedul'],
    code.startsWith('F') || code.startsWith('J')
      ? 'Date modifications are permitted. A change fee may apply depending on availability. Changes must be requested at least 24 hours before the original departure.'
      : 'Date changes are not permitted on this fare. A new booking is required.'
  );
  sections.push({
    id: 'changes', heading: 'Date & Name Changes', icon: 'change',
    content: changeText,
    isWarning: changeText.toLowerCase().includes('not permitted') ||
      changeText.toLowerCase().includes('no change')
  });

  // ── Refund / Cancellation ─────────────────────────────────────────────────
  const refundText = extractOrDefault(r,
    ['refund', 'cancel', 'reimburse'],
    code.startsWith('F') || code.startsWith('J')
      ? 'Cancellations are accepted up to 48 hours before departure. A refund processing fee applies. Cancellations within 48 hours are non-refundable.'
      : 'This is a non-refundable fare. No refund is available upon cancellation. Unused taxes may be reclaimed.'
  );
  sections.push({
    id: 'refund', heading: 'Cancellation & Refund Policy', icon: 'refund',
    content: refundText,
    isWarning: refundText.toLowerCase().includes('non-refundable') ||
      refundText.toLowerCase().includes('no refund')
  });

  // ── No-show penalties ─────────────────────────────────────────────────────
  sections.push({
    id: 'penalty', heading: 'No-Show & Late Penalties', icon: 'penalty',
    content: r.toLowerCase().includes('no-show')
      ? extractOrDefault(r, ['no-show', 'noshow'], '')
      : 'Failure to board without prior cancellation will result in forfeiture of the full ticket value. Please contact our concierge team at least 2 hours before departure if your plans change.',
    isWarning: true
  });

  // ── Validity ──────────────────────────────────────────────────────────────
  sections.push({
    id: 'validity', heading: 'Ticket Validity', icon: 'validity',
    content: extractOrDefault(r,
      ['valid', 'expir', 'travel by', 'book by'],
      'Ticket is valid for travel within 12 months of the original purchase date. Open-jaw and stopovers are subject to availability.'
    ),
    isWarning: false
  });

  // ── General conditions ────────────────────────────────────────────────────
  sections.push({
    id: 'general', heading: 'General Conditions', icon: 'general',
    content: 'All fares are subject to availability at time of booking. Prices include applicable airport taxes and surcharges. Seat availability may change. Asiaporeair reserves the right to withdraw promotional fares without notice.',
    isWarning: false
  });

  return sections;
}

function extractOrDefault(
  text: string, keywords: string[], fallback: string
): string {
  const lower = text.toLowerCase();
  for (const kw of keywords) {
    const idx = lower.indexOf(kw);
    if (idx !== -1) {
      // Return the sentence containing the keyword
      const start = Math.max(0, text.lastIndexOf('.', idx) + 1);
      const end = text.indexOf('.', idx + kw.length);
      const slice = end > -1
        ? text.slice(start, end + 1).trim()
        : text.slice(start).trim();
      if (slice.length > 20) return slice;
    }
  }
  return fallback;
}

@Component({
  selector: 'app-fare-rules-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  animations: [
    trigger('accordionPanel', [
      state('collapsed', style({ height: '0', opacity: 0, overflow: 'hidden' })),
      state('expanded', style({ height: '*', opacity: 1, overflow: 'hidden' })),
      transition('collapsed <=> expanded', [
        animate('280ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ])
  ],
  templateUrl: './fare-rules-accordion.component.html',
  styleUrls: ['./fare-rules-accordion.component.scss']
})
export class FareRulesAccordionComponent {

  @Input({ required: true }) code: string = '';
  @Input({ required: true }) rules: string = '';

  readonly sections = computed(() =>
    parseRuleSections(this.rules, this.code)
  );

  readonly openSectionId = signal<string | null>(null);

  toggle(id: string): void {
    this.openSectionId.update(current => current === id ? null : id);
  }

  isOpen(id: string): boolean {
    return this.openSectionId() === id;
  }
}