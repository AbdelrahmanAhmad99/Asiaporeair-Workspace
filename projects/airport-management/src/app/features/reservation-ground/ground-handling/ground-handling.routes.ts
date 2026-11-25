import { Routes } from '@angular/router';

export const GROUND_HANDLING_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'security-terminal',
        pathMatch: 'full',
    },
    {
        path: 'gate-terminal/:flightId',
        loadComponent: () =>
            import('./pages/gate-scanning-terminal/gate-scanning-terminal.component').then(
                m => m.GateScanningTerminalComponent
            ),
        title: 'Gate Scanning Terminal — AOMS',

    },
    {
        path: 'flight-final-manifest/:flightId',
        loadComponent: () =>
            import('./pages/flight-final-manifest/flight-final-manifest.component').then(
                m => m.FlightFinalManifestComponent
            ),
        title: 'Final Manifest — AOMS',

    },
    {
        path: 'security-terminal',
        loadComponent: () =>
            import('./pages/boarding-pass-security/boarding-pass-security.component').then(
                m => m.BoardingPassSecurityComponent
            ),
        title: 'Boarding Pass Security Terminal — AOMS',

    },
    {
        path: '**',
        redirectTo: '',
    },
];