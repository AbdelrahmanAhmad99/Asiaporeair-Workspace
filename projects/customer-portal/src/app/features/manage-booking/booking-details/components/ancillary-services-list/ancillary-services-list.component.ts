// ancillary-services-list.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAncillarySaleDto } from '@shared-core';

const CATEGORY_ICONS: Record<string, string> = {
  meal: 'meal', food: 'meal', dining: 'meal',
  baggage: 'baggage', luggage: 'baggage',
  oxygen: 'medical', medical: 'medical', health: 'medical',
  lounge: 'lounge',
  wifi: 'wifi',
  insurance: 'insurance',
  seat: 'seat', upgrade: 'seat'
};

@Component({
  selector: 'app-ancillary-services-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './ancillary-services-list.component.html',
  styleUrls: ['./ancillary-services-list.component.scss']
})
export class AncillaryServicesListComponent {
  @Input({ required: true }) sales!: IAncillarySaleDto[];
  @Input() currency = 'SGD';

  get total(): number {
    return this.sales.reduce((s, a) => s + a.pricePaid * a.quantity, 0);
  }

  getIconKey(name: string): string {
    const lower = name.toLowerCase();
    for (const [kw, icon] of Object.entries(CATEGORY_ICONS)) {
      if (lower.includes(kw)) return icon;
    }
    return 'default';
  }

  formatPrice(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  trackBySale(_: number, s: IAncillarySaleDto): number { return s.saleId; }
}