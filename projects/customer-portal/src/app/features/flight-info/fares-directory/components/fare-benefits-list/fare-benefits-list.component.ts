// ============================================================================
// fare-benefits-list.component.ts
// Asiaporeair | Fare Benefits Checklist — Dumb Component
// Renders a structured list of inclusions with 1px gold SVG checkmarks.
// Parses the rules string from IFareBasisCodeDto into benefit categories.
// ============================================================================

import {
  Component, Input, ChangeDetectionStrategy, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IFareBenefit {
  category: string;   // e.g. "Baggage", "Meals", "Flexibility"
  label: string;      // e.g. "30kg checked baggage allowance"
  included: boolean;  // true = gold check, false = red cross / grey dash
}

/** Infers a structured benefit list from the raw rules string. */
function parseBenefits(code: string, description: string, rules: string): IFareBenefit[] {
  const r = rules.toLowerCase();
  const c = code.toUpperCase();
  const d = description.toLowerCase();

  // Determine cabin tier from code prefix
  const isFirstOrBusiness = c.startsWith('F') || c.startsWith('J') || c.startsWith('C') ||
    d.includes('first') || d.includes('business');
  const isPremiumEcon = c.startsWith('W') || d.includes('premium');
  const isEcon = !isFirstOrBusiness && !isPremiumEcon;

  const baggageKg = isFirstOrBusiness ? 40 : isPremiumEcon ? 35 : 30;

  return [
    // Baggage
    {
      category: 'Baggage',
      label: `${baggageKg}kg checked baggage allowance`,
      included: true
    },
    {
      category: 'Baggage',
      label: isFirstOrBusiness ? '2 carry-on items (up to 16kg total)' : '1 carry-on item (up to 7kg)',
      included: true
    },
    // Meals
    {
      category: 'In-flight Services',
      label: isFirstOrBusiness ? 'À la carte dining with champagne service' :
        isPremiumEcon ? 'Full meal service with beverage selection' : 'Standard meal service',
      included: true
    },
    {
      category: 'In-flight Services',
      label: isFirstOrBusiness ? 'Noise-cancelling headphones (premium)' : 'In-flight entertainment',
      included: true
    },
    // Seat
    {
      category: 'Seat & Comfort',
      label: isFirstOrBusiness ? 'Complimentary seat selection at booking' :
        isPremiumEcon ? 'Advance seat selection (72h before)' :
          'Seat selection (check-in)',
      included: true
    },
    {
      category: 'Seat & Comfort',
      label: isFirstOrBusiness ? 'Lie-flat or premium ergonomic seat' :
        isPremiumEcon ? 'Extra-legroom recliner seat' : 'Standard ergonomic seat',
      included: true
    },
    // Flexibility
    {
      category: 'Flexibility',
      label: r.includes('no change') || r.includes('non-changeable') ?
        'Date changes not permitted' : 'Date changes permitted (fees may apply)',
      included: !r.includes('no change') && !r.includes('non-changeable')
    },
    {
      category: 'Flexibility',
      label: r.includes('non-refundable') || r.includes('no refund') ?
        'Non-refundable fare' : 'Refundable (conditions apply)',
      included: !r.includes('non-refundable') && !r.includes('no refund')
    },
    // Loyalty
    {
      category: 'Loyalty',
      label: isFirstOrBusiness ? 'Full Asiaporeair Loyalty miles accrual' :
        isPremiumEcon ? '50% Loyalty miles accrual' : '25% Loyalty miles accrual',
      included: true
    },
    {
      category: 'Loyalty',
      label: isFirstOrBusiness ? 'Priority check-in & boarding' : 'Standard check-in',
      included: isFirstOrBusiness
    }
  ];
}

@Component({
  selector: 'app-fare-benefits-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './fare-benefits-list.component.html',
  styleUrls: ['./fare-benefits-list.component.scss']
})
export class FareBenefitsListComponent {

  @Input({ required: true }) code: string = '';
  @Input({ required: true }) description: string = '';
  @Input({ required: true }) rules: string = '';

  /** Whether to show only the top 4 benefits (collapsed mode). */
  @Input() compact: boolean = false;

  readonly benefitGroups = computed(() => {
    const all = parseBenefits(this.code, this.description, this.rules);
    const items = this.compact ? all.slice(0, 4) : all;

    // Group by category
    const groups = new Map<string, IFareBenefit[]>();
    for (const b of items) {
      const g = groups.get(b.category) ?? [];
      g.push(b);
      groups.set(b.category, g);
    }
    return Array.from(groups.entries()).map(([cat, benefits]) => ({ cat, benefits }));
  });

  readonly includedCount = computed(() =>
    parseBenefits(this.code, this.description, this.rules).filter(b => b.included).length
  );
}