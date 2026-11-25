
import { Routes } from '@angular/router';

export const CABIN_DESIGNER_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'aircraft-explorer',
        pathMatch: 'full',
    },
    {
        path: 'aircraft-explorer',
        loadComponent: () =>
            import('./pages/aircraft-explorer/aircraft-explorer.component').then(
                m => m.AircraftExplorerComponent
            ),
        title: 'Aircraft Explorer — LOPA Designer · AOMS',
    },
    {
        path: 'config-explorer/:tailNumber',
        loadComponent: () =>
            import('./pages/aircraft-config-explorer/aircraft-config-explorer.component').then(
                m => m.AircraftConfigExplorerComponent
            ),
        title: 'Config Explorer — LOPA Designer · AOMS',
    },
    {
        path: 'cabin-builder/:configId',
        loadComponent: () =>
            import('./pages/cabin-class-builder/cabin-class-builder.component').then(
                m => m.CabinClassBuilderComponent
            ),
        title: 'Cabin Builder — LOPA Designer · AOMS',
    },
    {
        path: 'seat-map/:cabinId',
        loadComponent: () =>
            import('./pages/seat-map-architect/seat-map-architect.component').then(
                m => m.SeatMapArchitectComponent
            ),
        title: 'Seat Map Architect — LOPA Designer · AOMS',
    },
    {
        path: '**',
        redirectTo: 'aircraft-explorer',
    },
];