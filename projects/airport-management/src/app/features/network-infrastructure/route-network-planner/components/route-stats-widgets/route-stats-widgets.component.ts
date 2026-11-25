
import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IRouteStatistics } from '../../store/routes.store';

interface IWidget {
  id: string;
  label: string;
  sublabel: string;
  getValue: (s: IRouteStatistics) => string | number;
  iconPath: string;
  accentClass: string;
}

@Component({
  selector: 'aoms-route-stats-widgets',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './route-stats-widgets.component.html',
  styleUrl: './route-stats-widgets.component.scss',
})
export class RouteStatsWidgetsComponent {
  readonly statistics = input.required<IRouteStatistics>();
  readonly loading = input<boolean>(false);

  protected readonly widgets: IWidget[] = [
    {
      id: 'corridors',
      label: 'Active Air Corridors',
      sublabel: 'Operational route pairs',
      getValue: s => s.activeRoutes.toLocaleString(),
      accentClass: 'widget--gold',
      iconPath: 'M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12zm0 0h7.5',
    },
    {
      id: 'hubs',
      label: 'Strategic Hub Nodes',
      sublabel: 'Unique airports in network',
      getValue: s => s.uniqueHubs,
      accentClass: 'widget--emerald',
      iconPath: 'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z',
    },
    {
      id: 'distance',
      label: 'Network Growth',
      sublabel: 'Total corridor distance',
      getValue: s => s.totalKm > 0 ? s.totalKm.toLocaleString() + ' km' : '—',
      accentClass: 'widget--amber',
      iconPath: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
    },
  ];

  protected readonly shimmerWidgets = Array(3).fill(null);
}