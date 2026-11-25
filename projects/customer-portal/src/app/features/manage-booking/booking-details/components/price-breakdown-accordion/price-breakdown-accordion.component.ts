// price-breakdown-accordion.component.ts
import {
  Component, Input, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger, transition, style, animate
} from '@angular/animations';
import { IBookingDetailDto } from '@shared-core';

const TAX_LINES = [
  { code: 'YQ', label: 'Transportation Tax (International)', amount: 59.20 },
  { code: 'AY', label: 'Passenger Civil Aviation Security Fee', amount: 14.20 },
  { code: 'XA', label: 'APHIS User Fee', amount: 4.90 },
  { code: 'RA', label: 'Passenger Service Charge — Intl', amount: 30.30 },
  { code: 'L7', label: 'Airport Development Levy', amount: 10.80 },
  { code: 'YC', label: 'Customs User Fee', amount: 9.40 },
  { code: 'XY', label: 'Immigration User Fee', amount: 8.90 },
  { code: 'OP', label: 'Aviation Levy', amount: 8.00 }
];

type PanelKey = 'fare' | 'taxes' | 'addons';

@Component({
  selector: 'app-price-breakdown-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  animations: [
    trigger('expand', [
      transition(':enter', [
        style({ height: 0, opacity: 0, overflow: 'hidden' }),
        animate('280ms cubic-bezier(0.4,0,0.2,1)', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1, overflow: 'hidden' }),
        animate('200ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ],
  templateUrl: './price-breakdown-accordion.component.html',
  styleUrls: ['./price-breakdown-accordion.component.scss']
})
export class PriceBreakdownAccordionComponent {

  @Input({ required: true }) detail!: IBookingDetailDto;
  @Input() currency = 'SGD';

  readonly openPanel = signal<PanelKey | null>('fare');

  readonly taxLines = TAX_LINES;

  get taxTotal(): number { return TAX_LINES.reduce((s, t) => s + t.amount, 0); }
  get ancillaryTotal(): number { return this.detail.ancillarySales?.reduce((s, a) => s + a.pricePaid * a.quantity, 0) ?? 0; }
  get airFare(): number { return Math.max(0, this.detail.totalPrice - this.taxTotal - this.ancillaryTotal); }
  get hasAddons(): boolean { return this.ancillaryTotal > 0; }

  toggle(panel: PanelKey): void {
    this.openPanel.update(p => p === panel ? null : panel);
  }

  isOpen(panel: PanelKey): boolean { return this.openPanel() === panel; }

  formatPrice(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
  }
}