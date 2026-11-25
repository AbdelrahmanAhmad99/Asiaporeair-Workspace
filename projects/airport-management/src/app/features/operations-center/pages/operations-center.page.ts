import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Signal,
  computed,
  inject,
} from '@angular/core';

import { AuthStateService } from '../../../core/auth/auth-state.service';
import { UserRole as CoreUserRole } from '../../../core/auth/roles.model';
import { OperatorProfile, UserRole } from '../models/command-bar.models';
import { GatewayAccessRequestEvent } from '../models/core-domains.models';
import { OperationsCenterStore } from '../store/operations-center.store';
import { HeaderCommandBarComponent } from './header-command-bar/header-command-bar.component';
import { ExecutiveKpiBannerComponent } from './executive-kpi-banner/executive-kpi-banner.component';
import { CoreModulesGridComponent } from './core-domains-grid/core-domains-grid.component';

function toUserRole(role: CoreUserRole | null): UserRole {
  if (!role) return UserRole.ADMIN;
  return role as unknown as UserRole;
}

@Component({
  selector: 'aoms-operations-center',
  standalone: true,
  imports: [
    HeaderCommandBarComponent,
    ExecutiveKpiBannerComponent,
    CoreModulesGridComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` 
    <aoms-header-command-bar
      [operator]="operator()"
      (profileMenuRequested)="openAccountMenu()"
    />
 
    <aoms-executive-kpi-banner />
 
    <aoms-core-domains-grid
      [role]="operator().role"
      (accessRequested)="requestAccess($event)"
    />
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100%;
      margin: -24px;
      gap: 0;
      background: var(--aoms-midnight, #051937);
    }

    @media (max-width: 1024px) {
      :host {
        margin: -16px;
      }
    }

    @media (max-width: 768px) {
      :host {
        margin: -12px;
      }
    }
  `],
})
export class OperationsCenterPage implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly store = inject(OperationsCenterStore);

  // ── Operator profile ──────────────────────────────────────────────────────  
  readonly operator: Signal<OperatorProfile> = computed<OperatorProfile>(() => {
    const user = this.authState.currentUser() as Record<string, unknown> | null;
    const role = toUserRole(this.authState.userRole());

    if (!user) {
      return { employeeId: '\u2014', fullName: 'Operator', role, avatarUrl: null };
    }

    const firstName = String(user['firstName'] ?? '');
    const lastName = String(user['lastName'] ?? '');
    const fullName = [firstName, lastName].filter(Boolean).join(' ')
      || String(user['email'] ?? 'Operator');
    const employeeId = String(user['employeeCode'] ?? user['id'] ?? '\u2014');
    const avatarUrl = (user['avatarUrl'] as string | null | undefined) ?? null;

    return { employeeId, fullName, role, avatarUrl };
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.initializeOperationsFeed();
  }

  openAccountMenu(): void {
  }

  requestAccess(event: GatewayAccessRequestEvent): void {
    console.info('[OperationsCenterPage] Access requested for domain:', event.domainId);
  }
}
