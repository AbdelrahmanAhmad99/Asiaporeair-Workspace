// AOMS Topbar — Glassmorphism, Breadcrumbs, Search, Notifications, Dark Mode Toggle

import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LayoutStore } from '../../store/layout.store';
import { AuthStateService } from '../../../../core/auth/auth-state.service';
import { AuthService } from '../../../../features/authentication/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  protected readonly store = inject(LayoutStore);

  /** Local search query state */
  protected readonly searchQuery = signal<string>('');

  protected readonly authState = inject(AuthStateService);
  protected readonly authService = inject(AuthService);

  /** User avatar initials fallback */
  protected readonly userInitials = computed(() => {
    const name = this.authState.displayName() || '';
    const parts = name.split(' ').filter(p => p.length > 0);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return '??';
  });

  protected readonly userName = this.authState.displayName;

  protected readonly userEmail = computed(() => {
    const profile = this.authState.currentUser();
    return profile?.email || 'Unknown';
  });

  protected logout(): void {
    this.authService.logout();
  }

  protected toggleSearch(): void {
    this.store.toggleSearch();
  }

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.store.toggleSearch();
      this.searchQuery.set('');
    }
  }

  protected toggleTheme(): void {
    this.store.toggleTheme();
  }

  protected onNotificationClick(): void {
    this.store.decrementNotifications();
  }
}
