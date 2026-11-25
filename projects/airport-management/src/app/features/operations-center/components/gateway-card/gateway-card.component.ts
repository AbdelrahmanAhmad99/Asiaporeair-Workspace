import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  GatewayAccessRequestEvent,
  GatewayCardViewModel,
  GatewayNavigationEvent,
  GatewaySubLinkView,
} from '../../models/core-domains.models';


@Component({
  selector: 'aoms-gateway-card',
  imports: [RouterLink],
  templateUrl: './gateway-card.component.html',
  styleUrl: './gateway-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GatewayCardComponent {
  readonly gateway = input.required<GatewayCardViewModel>();

  /** Fired alongside native navigation (never replaces it). */
  readonly navigated = output<GatewayNavigationEvent>();
  readonly accessRequested = output<GatewayAccessRequestEvent>();

  protected readonly titleId = computed(() => `${this.gateway().id}-title`);

  protected onPrimaryNavigated(): void {
    const g = this.gateway();
    this.navigated.emit({ domainId: g.id, route: g.primaryRoute, target: 'PRIMARY', subLinkId: null });
  }

  protected onSubLinkNavigated(link: GatewaySubLinkView): void {
    this.navigated.emit({
      domainId: this.gateway().id,
      route: link.route,
      target: 'SUB_LINK',
      subLinkId: link.id,
    });
  }

  protected onRequestAccess(): void {
    const g = this.gateway();
    if (g.restriction === null) return;
    this.accessRequested.emit({ domainId: g.id, requiredRoles: g.restriction.requiredRoles });
  }
}