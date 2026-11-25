import { ChangeDetectionStrategy, Component, Signal, computed, inject } from '@angular/core';

import { KpiCardViewModel } from '../../models/executive-kpi.models';
import { OperationsCenterStore } from '../../store/operations-center.store';
import {
  KpiBuildContext,
  buildActiveFlightsCard,
  buildCrewCard,
  buildFleetCard,
  buildNetworkCard,
  buildOtpCard,
  buildRevenueCard,
  kpiCardEquals,
} from '../../models/executive-kpi.mapper';
import { KpiMetricCardComponent } from '../../components/kpi-metric-card/kpi-metric-card.component';


@Component({
  selector: 'aoms-executive-kpi-banner',
  imports: [KpiMetricCardComponent],
  templateUrl: './executive-kpi-banner.component.html',
  styleUrl: './executive-kpi-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExecutiveKpiBannerComponent {
  private readonly store = inject(OperationsCenterStore);

  private readonly kpis = this.store.kpiMetrics;

  private readonly hasData = computed(() => this.store.lastSyncedAt() !== null);

  private readonly context = computed<KpiBuildContext>(() => ({
    hasData: this.hasData(),
    connection: this.store.connectionStatus(),
    isStale: this.store.isTelemetryStale(),
  }));

  private readonly activeFlightsCard = computed(
    () => buildActiveFlightsCard(this.kpis().activeFlights, this.context()),
    { equal: kpiCardEquals },
  );
  private readonly otpCard = computed(() => buildOtpCard(this.kpis().otpRate, this.context()), {
    equal: kpiCardEquals,
  });
  private readonly fleetCard = computed(() => buildFleetCard(this.kpis().fleetAvailability, this.context()), {
    equal: kpiCardEquals,
  });
  private readonly crewCard = computed(() => buildCrewCard(this.kpis().crew, this.context()), {
    equal: kpiCardEquals,
  });
  private readonly networkCard = computed(() => buildNetworkCard(this.kpis().network, this.context()), {
    equal: kpiCardEquals,
  });
  private readonly revenueCard = computed(() => buildRevenueCard(this.kpis().revenue, this.context()), {
    equal: kpiCardEquals,
  });

  protected readonly cards: Signal<readonly KpiCardViewModel[]> = computed(() => [
    this.activeFlightsCard(),
    this.otpCard(),
    this.fleetCard(),
    this.crewCard(),
    this.networkCard(),
    this.revenueCard(),
  ]);
}