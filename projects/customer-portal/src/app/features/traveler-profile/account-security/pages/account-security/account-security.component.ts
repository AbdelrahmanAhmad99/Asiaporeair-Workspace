// ============================================================================
// account-security.component.ts
// Asiaporeair | Smart Page — "Account Security Hub"
// ============================================================================

import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  trigger, transition, style, animate, query, stagger
} from '@angular/animations';

import { ProfileStore } from '../../../store/profile.store';

// ── Dumb Components ──────────────────────────────────────────────────────────
import { ChangePasswordFormComponent, IChangePasswordPayload } from '../../components/change-password-form/change-password-form.component';
import { TwoFactorToggleComponent } from '../../components/two-factor-toggle/two-factor-toggle.component';
import { LoginHistoryListComponent } from '../../components/login-history-list/login-history-list.component';

// ── Quick-nav links ───────────────────────────────────────────────────────────
interface ISecNavLink {
  label: string;
  route: string;
  icon: string;
  external?: boolean;
}

// ── Animations ─────────────────────────────────────────────────────────────────
const PAGE_ANIMATIONS = [
  trigger('pageEnter', [
    transition(':enter', [
      query('.sec-animate', [
        style({ opacity: 0, transform: 'translateY(18px)' }),
        stagger(70, [
          animate('500ms cubic-bezier(0.22, 1, 0.36, 1)',
            style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ], { optional: true })
    ])
  ]),
  trigger('fadeUp', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(14px)' }),
      animate('420ms cubic-bezier(0.22, 1, 0.36, 1)',
        style({ opacity: 1, transform: 'translateY(0)' }))
    ])
  ])
];

@Component({
  selector: 'app-account-security',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    // ChangePasswordFormComponent,
    TwoFactorToggleComponent,
    LoginHistoryListComponent
  ],
  animations: PAGE_ANIMATIONS,
  templateUrl: './account-security.component.html',
  styleUrls: ['./account-security.component.scss']
})
export class AccountSecurityComponent implements OnInit, OnDestroy {

  // ── DI ────────────────────────────────────────────────────────────────
  readonly store = inject(ProfileStore);
  private router = inject(Router);

  // ── Quick nav ─────────────────────────────────────────────────────────
  readonly quickNavLinks: ISecNavLink[] = [
    {
      label: 'Personal Information',
      route: '/profile/personal-info',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
    },
    {
      label: 'Travel Companions',
      route: '/profile/saved-passengers',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
    },
    {
      label: 'My Trips',
      route: '/manage-booking/my-trips',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M16.95 16.95l1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>`
    },
    {
      label: 'Loyalty Dashboard',
      route: '/loyalty/loyalty-dashboard',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`
    }
  ];

  // ── Lifecycle ─────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.store.loadSecurityData();
  }

  ngOnDestroy(): void {
    this.store.clearSecurityError();
  }

  // ── Handlers ──────────────────────────────────────────────────────────

  onChangePassword(payload: IChangePasswordPayload): void {
    this.store.changePassword(
      { oldPassword: payload.oldPassword, newPassword: payload.newPassword },
      () => { /* success toast could fire here */ },
      (err) => {
        this.store.setError(err?.error?.message ?? 'Password update failed. Please try again.');
      }
    );
  }

  onToggle2FA(): void {
    this.store.toggle2FA(
      (enabled) => {
        // Optionally trigger a toast: `2FA ${enabled ? 'enabled' : 'disabled'}`
      },
      (err) => {
        this.store.setError('Could not update 2FA setting. Please try again.');
      }
    );
  }

  onRevokeSession(sessionId: string): void {
    this.store.revokeSession(sessionId);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  navigateToResetPassword(): void {
    this.router.navigate(['/auth/reset-password']);
  }

  trackByNavRoute(_: number, link: ISecNavLink): string {
    return link.route;
  }
}