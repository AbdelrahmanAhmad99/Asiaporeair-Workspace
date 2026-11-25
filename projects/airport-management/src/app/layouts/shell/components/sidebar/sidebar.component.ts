// AOMS Sidebar — Role-Based, Collapsible Navigation with Luxury Midnight Styling

import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutStore, NavItem } from '../../store/layout.store';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  protected readonly store = inject(LayoutStore);

  /** Track which child items are visible for RBAC */
  protected readonly filteredNavItems = computed(() => {
    const role = this.store.userRole();
    return this.store.visibleNavItems().map(item => ({
      ...item,
      children: item.children?.filter(child => child.roles.includes(role)) ?? [],
    }));
  });

  protected toggleSidebar(): void {
    this.store.toggleSidebar();
  }

  protected toggleGroup(id: string): void {
    if (!this.store.isSidebarCollapsed()) {
      this.store.toggleNavGroup(id);
    }
  }

  protected isGroupExpanded(id: string): boolean {
    return this.store.isNavExpanded()(id);
  }

  protected isActiveRoute(routeId: string): boolean {
    return this.store.activeRouteId() === routeId;
  }

  protected onNavClick(item: NavItem): void {
    if (item.children && item.children.length > 0) {
      this.toggleGroup(item.id);
    } else {
      this.store.setActiveRoute(item.id, item.label);
    }
  }

  protected onChildClick(child: NavItem, parent: NavItem): void {
    this.store.setActiveRoute(child.id, child.label);
    this.store.setBreadcrumbs([
      { label: 'AOMS', route: '/aoms' },
      { label: parent.label, route: parent.route },
      { label: child.label },
    ]);
  }
}
