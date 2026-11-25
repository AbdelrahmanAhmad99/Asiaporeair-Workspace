// AOMS Layout Store — Signal-First State Management
// Manages sidebar, theme, page context, and RBAC-aware navigation

import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthStateService } from '../../../core/auth/auth-state.service';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export type AomsTheme = 'light' | 'dark';

export type AomsUserRole =
    | 'SuperAdmin'
    | 'Admin'
    | 'Supervisor'
    | 'Pilot'
    | 'Attendant';

export interface AuthenticatedUser {
    id: string;
    fullName: string;
    email: string;
    role: AomsUserRole;
    avatarUrl?: string;
    employeeCode: string;
    homeBase: string; // IATA airport code
}

export interface NavItem {
    id: string;
    label: string;
    icon: string; // SVG path data (lucide-style 1px stroke)
    route: string;
    roles: AomsUserRole[];           // RBAC: which roles can see this item
    badge?: number;                  // Optional notification count
    children?: NavItem[];
}

export interface BreadcrumbSegment {
    label: string;
    route?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation Master Configuration (Role-Filtered at Runtime)
// ─────────────────────────────────────────────────────────────────────────────

export const AOMS_NAV_ITEMS: NavItem[] = [
    {
        id: 'operations-center',
        label: 'Operations Center',
        icon: `M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6`,
        route: '/aoms/operations-center',
        roles: ['SuperAdmin', 'Admin', 'Supervisor', 'Pilot', 'Attendant'],
    },
    {
        id: 'flight-ops',
        label: 'Flight Operations',
        icon: `M12 19l9 2-9-18-9 18 9-2zm0 0v-8`,
        route: '/aoms/flight-operations',
        roles: ['SuperAdmin', 'Admin', 'Supervisor', 'Pilot'],
        children: [
            { id: 'network-planning', label: 'Scheduling Network Planning (SNP)', icon: '', route: '/aoms/flight-operations/network-planning', roles: ['SuperAdmin', 'Admin', 'Supervisor'] },
            { id: 'dispatch-center', label: 'Dynamic Flight Dispatch (DFD)', icon: '', route: '/aoms/flight-operations/dispatch-center', roles: ['SuperAdmin', 'Admin', 'Supervisor', 'Pilot'] },
            { id: 'ops-surveillance', label: 'Real-time Ops Surveillance (ROS)', icon: '', route: '/aoms/flight-operations/ops-surveillance', roles: ['SuperAdmin', 'Admin', 'Supervisor'] },
            { id: 'schedules', label: 'Executive Ops Intelligence (EOI)', icon: '', route: '/aoms/flight-operations/schedules', roles: ['SuperAdmin', 'Admin', 'Supervisor'] },

        ],
    },
    {
        id: 'fleet',
        label: 'Fleet & Assets',
        icon: `M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z`,
        route: '/aoms/fleet-configuration',
        roles: ['SuperAdmin', 'Admin', 'Supervisor'],
        children: [
            { id: 'aircraft', label: 'Fleet Inventory & Lifecycle (FIL)', icon: '', route: '/aoms/fleet-configuration/fleet-inventory-lifecycle', roles: ['SuperAdmin', 'Admin', 'Supervisor'] },
            { id: 'cabin-configuration', label: 'LOPA & Cabin Configuration Designer', icon: '', route: '/aoms/fleet-configuration/cabin-configuration-designer', roles: ['SuperAdmin', 'Admin', 'Supervisor'] },
            { id: 'aircraft-types', label: 'Aircraft Type Authority (ATA)', icon: '', route: '/aoms/fleet-configuration/aircraft-type-authority', roles: ['SuperAdmin', 'Admin'] },
        ],
    },
    {
        id: 'crew',
        label: 'Crew Intelligence',
        icon: `M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z`,
        route: '/aoms/workforce-intelligence',
        roles: ['SuperAdmin', 'Admin', 'Supervisor'],
        children: [
            { id: 'workforce-directory', label: 'Workforce Directory & HR Operations (WDO)', icon: '', route: '/aoms/workforce-intelligence/workforce-directory', roles: ['SuperAdmin', 'Admin', 'Supervisor'] },
            { id: 'crew-compliance', label: 'Crew Identity & Compliance Intelligence (CIC)', icon: '', route: '/aoms/workforce-intelligence/crew-compliance', roles: ['SuperAdmin', 'Admin', 'Supervisor'] },
            { id: 'tactical-rostering', label: 'Tactical Rostering & Schedule Center (TRC)', icon: '', route: '/aoms/workforce-intelligence/tactical-rostering', roles: ['SuperAdmin', 'Admin', 'Supervisor'] },
            { id: 'workforce-analytics', label: ' Workforce Analytics & Dashboard (WAD)', icon: '', route: '/aoms/workforce-intelligence/workforce-analytics', roles: ['SuperAdmin', 'Admin', 'Supervisor'] },
            // { id: 'certifications', label: 'Certifications', icon: '', route: '/aoms/crew/certifications', roles: ['SuperAdmin', 'Admin'] },
        ],
    },
    {
        id: 'network',
        label: 'Network & Infra',
        icon: `M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z`,
        route: '/aoms/network-infrastructure',
        roles: ['SuperAdmin', 'Admin'],
        children: [
            { id: 'airports', label: 'Airport Hub Operations', icon: '', route: '/aoms/network-infrastructure/airport-hub-operations', roles: ['SuperAdmin', 'Admin'] },
            { id: 'countries', label: 'Global Geography', icon: '', route: '/aoms/network-infrastructure/global-geography', roles: ['SuperAdmin', 'Admin'] },
            { id: 'routes', label: 'Route Explorer Planning', icon: '', route: '/aoms/network-infrastructure/route-network-planner', roles: ['SuperAdmin', 'Admin'] },
            { id: 'airlines', label: 'Airline & Partnership Directory', icon: '', route: '/aoms/network-infrastructure/airline-partnership-directory', roles: ['SuperAdmin', 'Admin'] },
        ],
    },
    {
        id: 'revenue',
        label: 'Commercial & Revenue',
        icon: `M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z`,
        route: '/aoms/commercial-revenue',
        roles: ['SuperAdmin', 'Admin'],
        children: [
            { id: 'fare-engine', label: 'Fare Engine & Policy Manager (FEP)', icon: '', route: '/aoms/commercial-revenue/fare-engine', roles: ['SuperAdmin', 'Admin', 'Supervisor'] },
            { id: 'dynamic-pricing', label: 'Dynamic Pricing & Logic Rules (DPR)', icon: '', route: '/aoms/commercial-revenue/dynamic-pricing', roles: ['SuperAdmin', 'Admin', 'Supervisor'] },
            { id: 'ancillary-catalog', label: 'Ancillary Product Catalog (APC)', icon: '', route: '/aoms/commercial-revenue/ancillary-catalog', roles: ['SuperAdmin', 'Admin'] },
            { id: 'financial-hub', label: 'Financial Audit & Revenue Hub (FAR)', icon: '', route: '/aoms/commercial-revenue/financial-hub', roles: ['SuperAdmin', 'Admin'] },
        ],
    },
    {
        id: 'reservations',
        label: 'Reservations & Ground',
        icon: `M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01`,
        route: '/aoms/reservation-ground',
        roles: ['SuperAdmin', 'Admin', 'Supervisor', 'Attendant'],
        badge: 3,
        children: [
            { id: 'booking-center', label: 'Global PNR & Booking Center', icon: '', route: '/aoms/reservation-ground/booking-center', roles: ['SuperAdmin', 'Admin', 'Supervisor'] },
            { id: 'ticketing-hub', label: 'E-Ticketing & Document Suite', icon: '', route: '/aoms/reservation-ground/ticketing-hub', roles: ['SuperAdmin', 'Admin', 'Supervisor'] },
            { id: 'ground-handling', label: 'Ground Handling & Gate Ops', icon: '', route: '/aoms/reservation-ground/ground-handling', roles: ['SuperAdmin', 'Admin', 'Supervisor', 'Attendant'] },
            { id: 'loyalty-intelligence', label: 'Loyalty Intelligence', icon: '', route: '/aoms/reservation-ground/loyalty-intelligence', roles: ['SuperAdmin', 'Admin'] },
        ],
    },
    {
        id: 'reports',
        label: 'Analytics & Reports',
        icon: `M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z`,
        route: '/aoms/reports',
        roles: ['SuperAdmin', 'Admin', 'Supervisor'],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Layout Store
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class LayoutStore {

    // ── Private writable signals ─────────────────────────────────────────────
    private readonly _isSidebarCollapsed = signal<boolean>(false);
    private readonly _currentTheme = signal<AomsTheme>('light');
    private readonly _activePageTitle = signal<string>('Operations Center');

    // Services
    private readonly authState = inject(AuthStateService);

    private readonly _activeRouteId = signal<string>('operations-center');
    private readonly _expandedNavIds = signal<Set<string>>(new Set());
    private readonly _notificationCount = signal<number>(7);
    private readonly _isSearchOpen = signal<boolean>(false);
    private readonly _breadcrumbs = signal<BreadcrumbSegment[]>([
        { label: 'AOMS', route: '/aoms' },
        { label: 'Operations Center' },
    ]);

    // ── Public read-only signals (exposed to components) ────────────────────
    readonly isSidebarCollapsed = this._isSidebarCollapsed.asReadonly();
    readonly currentTheme = this._currentTheme.asReadonly();
    readonly activePageTitle = this._activePageTitle.asReadonly();
    readonly userRole = computed(() => (this.authState.userRole() as AomsUserRole) || 'Admin');
    readonly activeRouteId = this._activeRouteId.asReadonly();
    readonly expandedNavIds = this._expandedNavIds.asReadonly();
    readonly notificationCount = this._notificationCount.asReadonly();
    readonly isSearchOpen = this._isSearchOpen.asReadonly();
    readonly breadcrumbs = this._breadcrumbs.asReadonly();

    // ── Computed signals ──────────────────────────────────────────────────────

    /** Navigation items filtered for the current user role */
    readonly visibleNavItems = computed<NavItem[]>(() => {
        const role = this.userRole();
        return AOMS_NAV_ITEMS.filter(item => item.roles.includes(role));
    });

    /** CSS class string for theme application on root element */
    readonly themeClass = computed<string>(() =>
        this._currentTheme() === 'dark' ? 'aoms-dark' : 'aoms-light'
    );

    /** Whether a sidebar item with children is expanded */
    readonly isNavExpanded = computed(() => (id: string) =>
        this._expandedNavIds().has(id)
    );

    // ── Effects ───────────────────────────────────────────────────────────────

    constructor() {
        // Persist theme preference to localStorage
        effect(() => {
            const theme = this._currentTheme();
            try {
                localStorage.setItem('aoms-theme', theme);
                document.documentElement.classList.toggle('dark', theme === 'dark');
            } catch {
                // SSR guard — localStorage not available during server rendering
            }
        });

        // Hydrate theme from storage on init
        this._hydrateTheme();
    }

    // ── Actions ───────────────────────────────────────────────────────────────

    toggleSidebar(): void {
        this._isSidebarCollapsed.update(v => !v);
        // Collapse all expanded groups when sidebar collapses
        if (this._isSidebarCollapsed()) {
            this._expandedNavIds.set(new Set());
        }
    }

    setSidebarCollapsed(collapsed: boolean): void {
        this._isSidebarCollapsed.set(collapsed);
    }

    toggleTheme(): void {
        this._currentTheme.update(t => t === 'light' ? 'dark' : 'light');
    }

    setTheme(theme: AomsTheme): void {
        this._currentTheme.set(theme);
    }

    setActiveRoute(routeId: string, title: string): void {
        this._activeRouteId.set(routeId);
        this._activePageTitle.set(title);
    }

    // setUserRole removed as role is managed by AuthStateService

    setBreadcrumbs(segments: BreadcrumbSegment[]): void {
        this._breadcrumbs.set(segments);
    }

    toggleNavGroup(id: string): void {
        this._expandedNavIds.update(set => {
            const next = new Set(set);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    toggleSearch(): void {
        this._isSearchOpen.update(v => !v);
    }

    decrementNotifications(): void {
        this._notificationCount.update(n => Math.max(0, n - 1));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private _hydrateTheme(): void {
        try {
            const saved = localStorage.getItem('aoms-theme') as AomsTheme | null;
            if (saved === 'light' || saved === 'dark') {
                this._currentTheme.set(saved);
            }
        } catch {

        }
    }
}




