// app.routes.ts — AOMS Routing with BaseLayout Shell & Lazy-Loaded Feature Modules
// Role-Based Access Control (RBAC) via CanMatch guard placeholders

import { Routes } from '@angular/router';
import { BaseLayoutComponent } from './layouts/shell/components/base-layout/base-layout.component';

// ─────────────────────────────────────────────────────────────────────────────
// RBAC CanMatch Guard Placeholders
// These will be replaced with real AuthService-based guards
import { hasRole, RoleGroups, isAuthenticatedGuard } from './core/auth/auth.guard';
import { OperationsCenterStore } from './features/operations-center/store/operations-center.store';
import { OPERATIONS_FEED_GATEWAY } from './features/operations-center/store/operations-center.store';
import { HttpWsOperationsFeedGateway } from './features/operations-center/gateway/http-ws-operations-feed.gateway';

// ─────────────────────────────────────────────────────────────────────────────
// Real RBAC CanMatch Guards based on AuthStateService
// ─────────────────────────────────────────────────────────────────────────────

/** Allows: SuperAdmin, Admin, Supervisor, Pilot, Attendant */
const canMatchAnyRole = hasRole(RoleGroups.AnyEmployee);

/** Allows: SuperAdmin, Admin, Supervisor, Pilot */
const canMatchOperations = hasRole(RoleGroups.Operations);

/** Allows: SuperAdmin, Admin, Supervisor */
const canMatchManagement = hasRole(RoleGroups.Management);

/** Allows: SuperAdmin, Admin */
const canMatchExecutive = hasRole(RoleGroups.Executive);

export const routes: Routes = [
    // ── Authentication (Outside Shell) ────────────────────────────────────
    {
        path: 'auth',
        loadChildren: () =>
            import('./features/authentication/auth.routes').then(m => m.AUTH_ROUTES),
    },
    {
        path: 'global-geography',
        loadChildren: () =>
            import('./features/network-infrastructure/global-geography/global-geography.routes').then(m => m.GLOBAL_GEOGRAPHY_ROUTES),
    },
    // ── AOMS Shell (Protected Layout) ─────────────────────────────────────
    {
        path: 'aoms',
        component: BaseLayoutComponent,
        canActivate: [isAuthenticatedGuard],
        children: [
            // ── Default redirect → Operations Center ─────────────────────
            {
                path: '',
                redirectTo: 'operations-center',
                pathMatch: 'full',
            },

            // ── Operations Center (Primary Landing) ──────────────────────
            // Store + gateway are provided HERE so the clock & live feed
            // only run while this route is mounted (scoped providers).
            {
                path: 'operations-center',
                canMatch: [canMatchAnyRole],
                providers: [
                    OperationsCenterStore,
                    { provide: OPERATIONS_FEED_GATEWAY, useClass: HttpWsOperationsFeedGateway },
                ],
                loadComponent: () =>
                    import('./features/operations-center/pages/operations-center.page').then(
                        m => m.OperationsCenterPage
                    ),
            },

            // ── Backward-compat redirect (old bookmarks / deep links) ─────
            {
                path: 'dashboard',
                redirectTo: 'operations-center',
                pathMatch: 'full',
            },

            // ── Flight Operations ─────────────────────────────────────────
            {
                path: 'flight-operations',
                canMatch: [canMatchOperations],
                children: [
                    {
                        path: '',
                        redirectTo: 'network-planning',
                        pathMatch: 'full',
                    },
                    {
                        path: 'network-planning',
                        loadChildren: () =>
                            import('./features/flight-operations/network-planning/network-planning.routes').then(
                                m => m.NETWORK_PLANNING_ROUTES
                            ),
                    },
                    {
                        path: 'dispatch-center',
                        loadChildren: () =>
                            import('./features/flight-operations/dispatch-center/flight-dispatch.routes').then(
                                m => m.FLIGHT_DISPATCH_ROUTES
                            ),
                    },
                    {
                        path: 'ops-surveillance',
                        loadChildren: () =>
                            import('./features/flight-operations/ops-surveillance/ops-surveillance.routes').then(
                                m => m.OPS_SURVEILLANCE_ROUTES
                            ),
                    },

                ],
            },

            // ── Fleet & Assets ────────────────────────────────────────────
            {
                path: 'fleet-configuration',
                canMatch: [canMatchManagement],
                children: [
                    {
                        path: '',
                        redirectTo: 'aircraft-type-authority',
                        pathMatch: 'full',
                    },
                    {
                        path: 'aircraft-type-authority',
                        loadChildren: () =>
                            import('./features/fleet-configuration/aircraft-type-authority/aircraft-type-authority.routes').then(
                                m => m.AIRCRAFT_TYPE_AUTHORITY_ROUTES
                            ),
                    },
                    {
                        path: 'fleet-inventory-lifecycle',
                        loadChildren: () =>
                            import('./features/fleet-configuration/fleet-inventory-lifecycle/fleet-inventory.routes').then(
                                m => m.FLEET_INVENTORY_ROUTES
                            ),
                    },
                    {
                        path: 'cabin-configuration-designer',
                        loadChildren: () =>
                            import('./features/fleet-configuration/cabin-configuration-designer/cabin-designer.routes').then(
                                m => m.CABIN_DESIGNER_ROUTES
                            ),
                    },

                ],
            },

            // ── Crew Intelligence ─────────────────────────────────────────
            {
                path: 'workforce-intelligence',
                canMatch: [canMatchManagement],
                children: [
                    {
                        path: '',
                        redirectTo: 'workforce-directory',
                        pathMatch: 'full',
                    },

                    {
                        path: 'workforce-directory',
                        loadChildren: () =>
                            import('./features/workforce-intelligence/workforce-directory/workforce-directory.routes').then(
                                m => m.WORKFORCE_DIRECTORY_ROUTES
                            ),
                    },
                    {
                        path: 'crew-compliance',
                        loadChildren: () =>
                            import('./features/workforce-intelligence/crew-compliance/crew-compliance.routes').then(
                                m => m.CREW_COMPLIANCE_ROUTES
                            ),
                    },
                    {
                        path: 'tactical-rostering',
                        loadChildren: () =>
                            import('./features/workforce-intelligence/tactical-rostering/tactical-trc.routes').then(
                                m => m.TACTICAL_TRC_ROUTES
                            ),
                    },
                    {
                        path: 'workforce-analytics',
                        loadChildren: () =>
                            import('./features/workforce-intelligence/workforce-analytics/workforce-analytics.routes').then(
                                m => m.WORKFORCE_ANALYTICS_ROUTES
                            ),
                    },

                ],
            },

            // ── Network & Infrastructure ──────────────────────────────────
            {
                path: 'network-infrastructure',
                canMatch: [canMatchExecutive],
                children: [
                    {
                        path: '',
                        redirectTo: 'airport-hub-operations',
                        pathMatch: 'full',
                    },
                    {
                        path: 'airport-hub-operations',
                        loadChildren: () =>
                            import('./features/network-infrastructure/airport-hub-operations/airport-hub.routes').then(m => m.AIRPORT_HUB_ROUTES),
                    },
                    {
                        path: 'global-geography',
                        loadChildren: () =>
                            import('./features/network-infrastructure/global-geography/global-geography.routes').then(m => m.GLOBAL_GEOGRAPHY_ROUTES),
                    },
                    {
                        path: 'airline-partnership-directory',
                        loadChildren: () =>
                            import('./features/network-infrastructure/airline-partnership-directory/airline-partnership.routes').then(m => m.AIRLINE_PARTNERSHIP_ROUTES),
                    },
                    {
                        path: 'route-network-planner',
                        loadChildren: () =>
                            import('./features/network-infrastructure/route-network-planner/route-network.routes').then(m => m.ROUTE_NETWORK_ROUTES),
                    },

                ],
            },

            // ── Revenue Management ────────────────────────────────────────
            {
                path: 'commercial-revenue',
                canMatch: [canMatchExecutive],
                children: [
                    {
                        path: '',
                        redirectTo: 'fare-engine',
                        pathMatch: 'full',
                    },
                    {
                        path: 'fare-engine',
                        loadChildren: () =>
                            import('./features/commercial-revenue/fare-engine/fare-engine.routes').then(m => m.FARE_ENGINE_ROUTES),
                    },
                    {
                        path: 'dynamic-pricing',
                        loadChildren: () =>
                            import('./features/commercial-revenue/dynamic-pricing/dynamic-pricing.routes').then(m => m.DYNAMIC_PRICING_ROUTES),
                    },
                    {
                        path: 'ancillary-catalog',
                        loadChildren: () =>
                            import('./features/commercial-revenue/ancillary-catalog/ancillary-catalog.routes').then(m => m.ANCILLARY_CATALOG_ROUTES),
                    },
                    {
                        path: 'financial-hub',
                        loadChildren: () =>
                            import('./features/commercial-revenue/financial-hub/financial-hub.routes').then(m => m.FINANCIAL_HUB_ROUTES),
                    },

                ],
            },

            // ── Reservations & Ground Handling ────────────────────────────
            {
                path: 'reservation-ground',
                canMatch: [canMatchExecutive],
                children: [
                    {
                        path: '',
                        redirectTo: 'booking-center',
                        pathMatch: 'full',
                    },
                    {
                        path: 'booking-center',
                        loadChildren: () =>
                            import('./features/reservation-ground/booking-center/booking-center.routes').then(m => m.BOOKING_CENTER_ROUTES),
                    },
                    {
                        path: 'ticketing-hub',
                        loadChildren: () =>
                            import('./features/reservation-ground/ticketing-hub/ticketing.routes').then(m => m.TICKETING_ROUTES),
                    },
                    {
                        path: 'ground-handling',
                        loadChildren: () =>
                            import('./features/reservation-ground/ground-handling/ground-handling.routes').then(m => m.GROUND_HANDLING_ROUTES),
                    },
                    {
                        path: 'loyalty-intelligence',
                        loadChildren: () =>
                            import('./features/reservation-ground/loyalty-intelligence/loyalty-intelligence.routes').then(m => m.LOYALTY_INTELLIGENCE_ROUTES),
                    },

                ],
            },

            // ── Analytics & Reports ───────────────────────────────────────
            {
                path: 'reports',
                canMatch: [canMatchManagement],
                loadComponent: () =>
                    import('./features/reports/reports-placeholder.component').then(
                        m => m.ReportsPlaceholderComponent
                    ),
            },
        ],
    },

    // ── Default Redirect ──────────────────────────────────────────────────
    {
        path: '',
        redirectTo: 'aoms',
        pathMatch: 'full',
    },

    {
        path: '**',
        redirectTo: 'aoms/operations-center',
    },
];