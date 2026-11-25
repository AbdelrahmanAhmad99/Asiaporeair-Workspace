

import { Routes } from '@angular/router';

export const AIRPORT_HUB_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'dashboard',
        loadComponent: () =>
            import('./pages/airport-dashboard/airport-dashboard.component').then(
                m => m.AirportDashboardComponent
            ),
        title: 'Airport Hub — Dashboard · AOMS',
    },
    {
        path: 'details/:iataCode',
        loadComponent: () =>
            import('./pages/airport-details-view/airport-details-view.component').then(
                m => m.AirportDetailsViewComponent
            ),
        title: 'Airport Details · AOMS',
    },
    {
        path: 'manage/new',
        loadComponent: () =>
            import('./pages/airport-terminal-editor/airport-terminal-editor.component').then(
                m => m.AirportTerminalEditorComponent
            ),
        title: 'New Airport · AOMS',
        data: { breadcrumb: 'New Airport', requiredRoles: ['SuperAdmin', 'Admin'] },
    },
    {
        path: 'manage/:iataCode',
        loadComponent: () =>
            import('./pages/airport-terminal-editor/airport-terminal-editor.component').then(
                m => m.AirportTerminalEditorComponent
            ),
        title: 'Edit Airport · AOMS',
        data: { breadcrumb: 'Edit Airport', requiredRoles: ['SuperAdmin', 'Admin'] },
    },
    {
        path: 'archive',
        loadComponent: () =>
            import('./pages/airport-archive-audit/airport-archive-audit.component').then(
                m => m.AirportArchiveAuditComponent
            ),
        title: 'Airport Archive · AOMS',
        data: { breadcrumb: 'Archive', requiredRoles: ['SuperAdmin', 'Admin'] },
    },
    {
        path: '**',
        redirectTo: 'dashboard',
    },
];