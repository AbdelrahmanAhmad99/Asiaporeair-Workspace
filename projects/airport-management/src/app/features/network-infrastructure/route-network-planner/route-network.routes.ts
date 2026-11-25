
import { Routes } from '@angular/router';

export const ROUTE_NETWORK_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'explorer',
        pathMatch: 'full',
    },
    {
        path: 'explorer',
        loadComponent: () =>
            import('./pages/route-explorer-dashboard/route-explorer-dashboard.component').then(
                m => m.RouteExplorerDashboardComponent
            ),
        title: 'Air-Network Command · AOMS',

    },
    {
        path: 'analysis/:id',
        loadComponent: () =>
            import('./pages/route-analysis-detail/route-analysis-detail.component').then(
                m => m.RouteAnalysisDetailComponent
            ),
        title: 'Route Analysis · AOMS',
    },
    {
        path: 'composer/new',
        loadComponent: () =>
            import('./pages/route-composer/route-composer.component').then(
                m => m.RouteComposerComponent
            ),
        title: 'New Route Construction · AOMS',
    },
    {
        path: 'composer/:id',
        loadComponent: () =>
            import('./pages/route-composer/route-composer.component').then(
                m => m.RouteComposerComponent
            ),
        title: 'Refine Route — Analyst · AOMS',
    },
    {
        path: 'operator-control/new',
        loadComponent: () =>
            import('./pages/route-operator-control/route-operator-control.component').then(
                m => m.RouteOperatorControlComponent
            ),
        title: 'Assign Rights — Operator · AOMS',
    },
    {
        path: 'operator-control/:id',
        loadComponent: () =>
            import('./pages/route-operator-control/route-operator-control.component').then(
                m => m.RouteOperatorControlComponent
            ),
        title: 'Operator Rights Registry · AOMS',
    },
    {
        path: 'recovery-center',
        loadComponent: () =>
            import('./pages/route-recovery-center/route-recovery-center.component').then(
                m => m.RouteRecoveryCenterComponent
            ),
        title: 'Route Recovery Center · AOMS',
    },
    {
        path: '**',
        redirectTo: 'explorer',
    },
];