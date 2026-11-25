// ============================================================================
// flight-info.routes.ts
// Asiaporeair | Flight Information & Exploration — Lazy Routes
//
// These routes are entirely read-only / exploration.
// They do NOT participate in the booking flow (which lives under /booking/).
// State for these pages is managed by flights.store.ts exclusively.
// ============================================================================

import { Routes } from '@angular/router';

export const FLIGHT_INFO_ROUTES: Routes = [
    {
        // Default: the luxury landing / flight search page
        path: '',
        redirectTo: 'search',
        pathMatch: 'full'
    },
    {
        path: 'search',
        title: 'Begin Your Journey — Asiaporeair',
        loadComponent: () =>
            import('./flight-search/pages/flight-search/flight-search.component')
                .then(m => m.FlightSearchComponent)
    },
    {
        path: 'status',
        title: 'Flight Status — Asiaporeair',
        loadComponent: () =>
            import('./flight-status/pages/flight-status/flight-status.component')
                .then(m => m.FlightStatusComponent)
    },
    {
        path: 'status-viewer',
        title: 'Flight Status Details — Asiaporeair',
        loadComponent: () =>
            import('./status-viewer/pages/status-viewer/status-viewer.component')
                .then(m => m.StatusViewerComponent)
    },
    {
        path: 'fares',
        title: 'Active Fare Directory — Asiaporeair',
        loadComponent: () =>
            import('./fares-directory/pages/fares-directory/fares-directory.component')
                .then(m => m.FaresDirectoryComponent)
    }

];