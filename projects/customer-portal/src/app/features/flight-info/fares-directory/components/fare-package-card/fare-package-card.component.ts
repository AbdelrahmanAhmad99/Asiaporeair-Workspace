// ============================================================================
// fare-package-card.component.ts
// Asiaporeair | Fare Package Card — Dumb Component
// Displays one IFareBasisCodeDto as a premium card with:
//   · Code badge + cabin class inferred from code prefix
//   · Description headline
//   · Benefits list (collapsed, 4 items)
//   · Expandable: full benefits + rules accordion
//   · CTA: "Explore This Fare" → emits code upward
// ============================================================================

import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IFareBasisCodeDto } from '@shared-core';
import { FareBenefitsListComponent } from '../fare-benefits-list/fare-benefits-list.component';
import { FareRulesAccordionComponent } from '../fare-rules-accordion/fare-rules-accordion.component';

// ── Cabin tier derived from IATA fare basis code prefix ──────────────────────
function deriveCabinTier(code: string): { label: string; tier: 'first' | 'business' | 'premium' | 'economy' } {
  const prefix = code.charAt(0).toUpperCase();
  const codeLower = code.toLowerCase();
  if (prefix === 'F' || codeLower.includes('first'))
    return { label: 'First Class', tier: 'first' };
  if (prefix === 'J' || prefix === 'C' || codeLower.includes('biz') || codeLower.includes('business'))
    return { label: 'Business Suite', tier: 'business' };
  if (prefix === 'W' || codeLower.includes('prem'))
    return { label: 'Premium Economy', tier: 'premium' };
  return { label: 'Economy Class', tier: 'economy' };
}

// ── Indicative price derived from tier (display only) ────────────────────────
const INDICATIVE_PRICES: Record<string, number> = {
  first: 8200, business: 3800, premium: 1400, economy: 620
};

@Component({
  selector: 'app-fare-package-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FareBenefitsListComponent,
    FareRulesAccordionComponent
  ],
  templateUrl: './fare-package-card.component.html',
  styleUrls: ['./fare-package-card.component.scss']
})
export class FarePackageCardComponent {

  @Input({ required: true }) fare!: IFareBasisCodeDto;

  /** Card index — used for CSS animation stagger delay */
  @Input() index: number = 0;

  /** Emits when user clicks "Explore This Fare" CTA */
  @Output() fareSelected = new EventEmitter<IFareBasisCodeDto>();

  // ── Expanded state ────────────────────────────────────────────────────────
  readonly isExpanded = signal<boolean>(false);

  toggleExpanded(): void {
    this.isExpanded.update(v => !v);
  }

  // ── Derived display values ────────────────────────────────────────────────
  get cabinInfo() {
    return deriveCabinTier(this.fare.code);
  }

  get indicativePrice(): number {
    return INDICATIVE_PRICES[this.cabinInfo.tier] ?? 620;
  }

  /** Limits the description to a single readable sentence in compact mode. */
  get shortDescription(): string {
    const desc = this.fare.description;
    const dot = desc.indexOf('.');
    return dot > -1 ? desc.slice(0, dot + 1) : desc.slice(0, 100);
  }
}