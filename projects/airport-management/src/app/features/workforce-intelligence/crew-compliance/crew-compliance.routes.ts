
import { Routes } from '@angular/router';

export const CREW_COMPLIANCE_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'operational-directory',
        pathMatch: 'full',
    },
    {
        path: 'operational-directory',
        loadComponent: () =>
            import('./pages/crew-operational-directory/crew-operational-directory.component')
                .then(m => m.CrewOperationalDirectoryComponent),
        title: 'Crew Operational Directory — AOMS',
    },
    {
        path: 'technical-profile/:id',
        loadComponent: () =>
            import('./pages/crew-technical-profile/crew-technical-profile.component')
                .then(m => m.CrewTechnicalProfileComponent),
        title: 'Crew Technical Profile — AOMS',
    },
    {
        path: 'watchdog-center',
        loadComponent: () =>
            import('./pages/compliance-watchdog-center/compliance-watchdog-center.component')
                .then(m => m.ComplianceWatchdogCenterComponent),
        title: 'Compliance Watchdog Center — AOMS',
    },
    { path: '**', redirectTo: 'operational-directory' },
];
