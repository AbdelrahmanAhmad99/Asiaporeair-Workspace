import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import {
  OperatorProfile,
  ROLE_BADGE_CONFIG,
  RoleBadgeConfig,
} from '../../models/command-bar.models';

/** Dumb component: receives the operator via `input()`, emits intent via `output()`. */
@Component({
  selector: 'aoms-user-profile-role-badge',
  templateUrl: './user-profile-role-badge.component.html',
  styleUrl: './user-profile-role-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileRoleBadgeComponent {
  readonly operator = input.required<OperatorProfile>();
  readonly activated = output<void>();

  protected readonly roleConfig = computed<RoleBadgeConfig>(() => ROLE_BADGE_CONFIG[this.operator().role]);

  /** First letter of the first and last name; one letter for single names. */
  protected readonly initials = computed(() => {
    const parts = this.operator().fullName.trim().split(/\s+/).filter((p) => p.length > 0);
    if (parts.length === 0) return '?';
    const first = parts[0].charAt(0);
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  });

  protected readonly accessibleName = computed(
    () => `Account: ${this.operator().fullName}, role ${this.roleConfig().label}`,
  );
}