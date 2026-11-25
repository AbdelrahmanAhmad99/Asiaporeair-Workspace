import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import {
  DEFAULT_HUB_TIME_ZONE,
  HubTimeZone,
  OperatorProfile,
} from '../../models/command-bar.models';
import { OperationsCenterStore } from '../../store/operations-center.store';
import { GlobalQuickSearchComponent } from '../../components/global-quick-search/global-quick-search.component';
import { LiveClockZuluComponent } from '../../components/live-clock-zulu/live-clock-zulu.component';
import { SystemHealthIndicatorComponent } from '../../components/system-health-indicator/system-health-indicator.component';
import { UserProfileRoleBadgeComponent } from '../../components/user-profile-role-badge/user-profile-role-badge.component';


@Component({
  selector: 'aoms-header-command-bar',
  imports: [
    GlobalQuickSearchComponent,
    LiveClockZuluComponent,
    SystemHealthIndicatorComponent,
    UserProfileRoleBadgeComponent,
  ],
  templateUrl: './header-command-bar.component.html',
  styleUrl: './header-command-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderCommandBarComponent {
  protected readonly store = inject(OperationsCenterStore);

  readonly operator = input.required<OperatorProfile>();
  readonly hubTimeZone = input<HubTimeZone>(DEFAULT_HUB_TIME_ZONE);
  readonly productName = input('Operations Center');

  readonly profileMenuRequested = output<void>();

  protected onSearchSubmitted(query: string): void {
    this.store.executeGlobalSearch(query);
  }

  protected onRefreshRequested(): void {
    this.store.refreshTelemetry();
  }
}
