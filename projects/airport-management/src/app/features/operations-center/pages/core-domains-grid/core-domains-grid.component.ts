import { ChangeDetectionStrategy, Component, Signal, computed, inject, input, output } from '@angular/core';

import { GATEWAY_DOMAINS, isRoleAllowed } from '../../config/core-domains.config';
import { ROLE_BADGE_CONFIG, UserRole } from '../../models/command-bar.models';
import {
  GatewayAccessRequestEvent,
  GatewayCardViewModel,
  GatewayNavigationEvent,
  LockedPresentation,
} from '../../models/core-domains.models';
import { OperationsCenterStore } from '../../store/operations-center.store';
import { KpiBuildContext } from '../../models/executive-kpi.mapper';
import { buildGatewayCard, gatewayCardEquals } from '../../models/core-domains.mapper';
import { GatewayCardComponent } from '../../components/gateway-card/gateway-card.component';


@Component({
  selector: 'aoms-core-domains-grid',
  imports: [GatewayCardComponent],
  templateUrl: './core-domains-grid.component.html',
  styleUrl: './core-domains-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoreModulesGridComponent {
  private readonly store = inject(OperationsCenterStore);

  readonly role = input.required<UserRole>();
  readonly lockedPresentation = input<LockedPresentation>('LOCK');

  readonly gatewayNavigated = output<GatewayNavigationEvent>();
  readonly accessRequested = output<GatewayAccessRequestEvent>();

  private readonly kpis = this.store.kpiMetrics;

  private readonly hasData = computed(() => this.store.lastSyncedAt() !== null);

  private readonly context = computed<KpiBuildContext>(() => ({
    hasData: this.hasData(),
    connection: this.store.connectionStatus(),
    isStale: this.store.isTelemetryStale(),
  }));


  private readonly cardSignals: readonly Signal<GatewayCardViewModel | null>[] = GATEWAY_DOMAINS.map((domain) =>
    computed(
      () =>
        buildGatewayCard(
          domain,
          this.role(),
          this.lockedPresentation(),
          () => this.kpis(),
          () => this.context(),
        ),
      { equal: gatewayCardEquals },
    ),
  );

  protected readonly cards: Signal<readonly GatewayCardViewModel[]> = computed(() =>
    this.cardSignals.map((s) => s()).filter((c): c is GatewayCardViewModel => c !== null),
  );

  protected readonly totalCount = GATEWAY_DOMAINS.length;

  protected readonly accessibleCount = computed(
    () => GATEWAY_DOMAINS.filter((d) => isRoleAllowed(d.allowedRoles, this.role())).length,
  );

  protected readonly roleLabel = computed(() => ROLE_BADGE_CONFIG[this.role()].label);
}