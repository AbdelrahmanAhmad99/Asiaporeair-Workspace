
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICrewIntelligenceKpis } from '../../store/workforce-wad.store';

@Component({
  selector: 'aoms-operational-stats-panel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './operational-stats-panel.component.html',
  styleUrl: './operational-stats-panel.component.scss',
})
export class OperationalStatsPanelComponent {
  readonly kpis = input.required<ICrewIntelligenceKpis>();
  readonly loading = input<boolean>(false);

  protected readonly shimmerRows = Array(9).fill(null);

  protected readonly coverageClass = computed(() => {
    const p = this.kpis().flightCoveragePct;
    return p >= 90 ? 'stat--emerald' : p >= 70 ? 'stat--gold' : 'stat--amber';
  });

  protected readonly restClass = computed(() => {
    const p = this.kpis().restCompliancePct;
    return p >= 95 ? 'stat--emerald' : p >= 80 ? 'stat--gold' : 'stat--amber';
  });

  protected readonly topBases = computed(() =>
    this.kpis().baseBreakdown.slice(0, 6)
  );
}