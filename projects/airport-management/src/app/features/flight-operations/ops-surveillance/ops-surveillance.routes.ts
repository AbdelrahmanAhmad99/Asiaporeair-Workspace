

import { Routes } from '@angular/router';

export const OPS_SURVEILLANCE_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'live-monitor',
        pathMatch: 'full',
    },

    // ── Live Operations Monitor (primary view) ────────────────────────────
    {
        path: 'live-monitor',
        loadComponent: () =>
            import('./pages/live-operations-monitor/live-operations-monitor.component').then(
                m => m.LiveOperationsMonitorComponent
            ),
        title: 'Live Operations Monitor · AOMS',

    },
    {
        path: 'fids-console',
        loadComponent: () =>
            import('./pages/fids-management-console/fids-management-console.component').then(
                m => m.FidsManagementConsoleComponent
            ),
        title: 'FIDS Management Console · AOMS',

    },
    {
        path: '**',
        redirectTo: 'live-monitor',
    },
];