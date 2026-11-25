
import { Routes } from '@angular/router';

export const NETWORK_PLANNING_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'schedule-master-inventory',
        pathMatch: 'full',
    },
    {
        path: 'schedule-master-inventory',
        loadComponent: () =>
            import('./pages/schedule-master-inventory/schedule-master-inventory.component').then(
                m => m.ScheduleMasterInventoryComponent
            ),
        title: 'Schedule Master Inventory · AOMS',

    },
    {
        path: 'schedule-configuration',
        loadComponent: () =>
            import('./pages/schedule-configuration-center/schedule-configuration-center.component').then(
                m => m.ScheduleConfigurationCenterComponent
            ),
        title: 'Configure Schedule · AOMS',

    },
    {
        path: 'schedule-configuration/:id',
        loadComponent: () =>
            import('./pages/schedule-configuration-center/schedule-configuration-center.component').then(
                m => m.ScheduleConfigurationCenterComponent
            ),
        title: 'Edit Schedule · AOMS',

    },
    {
        path: '**',
        redirectTo: 'schedule-master-inventory',
    },
];