import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { KpiCardViewModel } from '../../models/executive-kpi.models';


@Component({
  selector: 'aoms-kpi-metric-card',
  imports: [RouterLink],
  templateUrl: './kpi-metric-card.component.html',
  styleUrl: './kpi-metric-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiMetricCardComponent {
  readonly card = input.required<KpiCardViewModel>();
}