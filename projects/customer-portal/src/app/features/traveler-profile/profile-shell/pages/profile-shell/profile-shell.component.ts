// ============================================================================
// profile-shell.component.ts
// Asiaporeair | Profile Shell — Persistent Sidebar Layout Wrapper
// ============================================================================

import {
  Component, ChangeDetectionStrategy, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProfileStore } from '../../../store/profile.store';

interface IShellNavLink {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-profile-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './profile-shell.component.html',
  styleUrls: ['./profile-shell.component.scss']
})
export class ProfileShellComponent {

  readonly store = inject(ProfileStore);
  private router = inject(Router);

  readonly isMobileMenuOpen = signal<boolean>(false);
  readonly activeRoute = signal<string>('');

  readonly navLinks: IShellNavLink[] = [
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
      label: 'Travel Preferences',
      route: '/profile/travel-preferences',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M16.95 16.95l1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>`
    },
    {
      label: 'Payment Methods',
      route: '/profile/payment-methods',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`
    },
    {
      label: 'Account Security',
      route: '/profile/account-security',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
    }
  ];

  constructor() {
    // Track active route for sidebar highlighting
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((e: any) => {
        this.activeRoute.set(e.urlAfterRedirects ?? e.url);
        this.isMobileMenuOpen.set(false); // close mobile menu on navigation
      });

    // Set initial active route
    this.activeRoute.set(this.router.url);
  }

  isActive(route: string): boolean {
    return this.activeRoute().startsWith(route);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}