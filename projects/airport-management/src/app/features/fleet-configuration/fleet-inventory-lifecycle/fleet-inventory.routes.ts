
import { Routes } from '@angular/router';

export const FLEET_INVENTORY_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'dashboard',
        loadComponent: () =>
            import('./pages/fleet-inventory-dashboard/fleet-inventory-dashboard.component').then(
                m => m.FleetInventoryDashboardComponent
            ),
        title: 'Fleet Assets — AOMS Fleet Configuration',
    },
    {
        path: 'register',
        loadComponent: () =>
            import('./pages/aircraft-registration-wizard/aircraft-registration-wizard.component').then(
                m => m.AircraftRegistrationWizardComponent
            ),
        title: 'Register Aircraft — AOMS Fleet Configuration',
    },
    {
        path: 'edit/:tailNumber',
        loadComponent: () =>
            import('./pages/aircraft-registration-wizard/aircraft-registration-wizard.component').then(
                m => m.AircraftRegistrationWizardComponent
            ),
        title: 'Edit Aircraft — AOMS Fleet Configuration',
    },
    {
        path: 'archival-center',
        loadComponent: () =>
            import('./pages/fleet-archival-center/fleet-archival-center.component').then(
                m => m.FleetArchivalCenterComponent
            ),
        title: 'Fleet Archival Center — AOMS Fleet Configuration',
    },
    {
        // :tailNumber is the aircraft's unique tail number (e.g. 9V-SKA)
        path: ':tailNumber',
        loadComponent: () =>
            import('./pages/aircraft-profile-hub/aircraft-profile-hub.component').then(
                m => m.AircraftProfileHubComponent
            ),
        title: 'Aircraft Profile — AOMS Fleet Configuration',
    },

    {
        path: '**',
        redirectTo: '',
    },
];