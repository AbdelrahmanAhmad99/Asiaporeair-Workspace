// refund-policy-panel.component.ts
import {
  Component, Input, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

interface IRefundTier {
  label: string;
  timeframe: string;
  refundRate: number;   // 0-100
  description: string;
}

const REFUND_TIERS: IRefundTier[] = [
  { label: 'Full Refund', timeframe: '72+ hours before departure', refundRate: 100, description: 'Cancel 72 hours or more before your scheduled departure to receive a full refund, less any booking service fees.' },
  { label: 'Partial Refund', timeframe: '24–72 hours before departure', refundRate: 70, description: 'Cancellations within 72 hours but more than 24 hours before departure are eligible for a 70% refund of the base fare.' },
  { label: 'Minimal Refund', timeframe: 'Under 24 hours before departure', refundRate: 30, description: 'Cancellations within 24 hours of departure receive a 30% refund of the base fare only. Taxes and fees are non-refundable.' },
  { label: 'No Refund', timeframe: 'After departure or no-show', refundRate: 0, description: 'No refund is available for no-shows or cancellations after the scheduled departure time.' }
];

type PanelKey = 0 | 1 | 2 | 3;

@Component({
  selector: 'app-refund-policy-panel',
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
  templateUrl: './refund-policy-panel.component.html',
  styleUrls: ['./refund-policy-panel.component.scss']
})
export class RefundPolicyPanelComponent {
  @Input() totalPrice: number = 0;
  @Input() currency: string = 'SGD';
  @Input() departureDateTime: string | Date = '';

  readonly tiers = REFUND_TIERS;
  readonly openIndex = signal<PanelKey | null>(0); // first tier open by default

  toggle(idx: number): void {
    this.openIndex.update(v => v === idx ? null : idx as PanelKey);
  }

  isOpen(idx: number): boolean { return this.openIndex() === idx; }

  getRefundAmount(rate: number): string {
    const amt = (this.totalPrice * rate) / 100;
    return amt.toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  get applicableTier(): IRefundTier | null {
    if (!this.departureDateTime) return null;
    const now = Date.now();
    const dep = new Date(this.departureDateTime).getTime();
    const hrs = (dep - now) / 3_600_000;
    if (hrs > 72) return REFUND_TIERS[0];
    if (hrs > 24) return REFUND_TIERS[1];
    if (hrs > 0) return REFUND_TIERS[2];
    return REFUND_TIERS[3];
  }

  getTierCls(rate: number): string {
    if (rate === 100) return 'tier--full';
    if (rate >= 70) return 'tier--partial';
    if (rate > 0) return 'tier--minimal';
    return 'tier--none';
  }
}