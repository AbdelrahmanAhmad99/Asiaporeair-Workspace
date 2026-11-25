
import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAirlineSummaryMetrics } from '../../store/airlines.store';

interface IWidget {
  id: string;
  label: string;
  sublabel: string;
  getValue: (m: IAirlineSummaryMetrics) => string | number;
  iconPath: string;
  accentClass: string;
}

@Component({
  selector: 'aoms-airline-summary-widgets',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './airline-summary-widgets.component.html',
  styleUrl: './airline-summary-widgets.component.scss',
})
export class AirlineSummaryWidgetsComponent {
  readonly metrics = input.required<IAirlineSummaryMetrics>();
  readonly loading = input<boolean>(false);

  protected readonly widgets: IWidget[] = [
    {
      id: 'partners',
      label: 'Active Partners',
      sublabel: 'Globally registered',
      getValue: m => m.totalActivePartners.toLocaleString(),
      accentClass: 'widget--gold',
      iconPath: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
    },
    {
      id: 'regions',
      label: 'Regional Reach',
      sublabel: 'Operating regions',
      getValue: m => m.uniqueRegions,
      accentClass: 'widget--emerald',
      iconPath: 'M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582',
    },
    {
      id: 'airports',
      label: 'Hub Airports',
      sublabel: 'Partner base airports',
      getValue: m => m.uniqueBaseAirports,
      accentClass: 'widget--amber',
      iconPath: 'M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5',
    },
  ];

  protected readonly shimmerWidgets = Array(3).fill(null);
}