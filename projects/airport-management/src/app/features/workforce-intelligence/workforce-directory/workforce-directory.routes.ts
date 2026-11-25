

import { Routes } from '@angular/router';

export const WORKFORCE_DIRECTORY_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'inventory-dashboard',
        pathMatch: 'full',
    },
    {
        path: 'inventory-dashboard',
        loadComponent: () =>
            import('./pages/employee-inventory-dashboard/employee-inventory-dashboard.component')
                .then(m => m.EmployeeInventoryDashboardComponent),
        title: 'Workforce Inventory — AOMS',
    },

    {
        path: 'profile-hub/:id',
        loadComponent: () =>
            import('./pages/employee-profile-hub/employee-profile-hub.component')
                .then(m => m.EmployeeProfileHubComponent),
        title: 'Employee Profile — AOMS',
    },
    {
        path: 'onboarding',
        loadComponent: () =>
            import('./pages/workforce-onboarding-wizard/workforce-onboarding-wizard.component')
                .then(m => m.WorkforceOnboardingWizardComponent),
        title: 'Workforce Onboarding — AOMS',
    },
    {
        path: 'access-manager/:id/:role',
        loadComponent: () =>
            import('./pages/system-access-manager/system-access-manager.component')
                .then(m => m.SystemAccessManagerComponent),
        title: 'Access Manager — AOMS',
    },
    { path: '**', redirectTo: 'inventory-dashboard' },
];