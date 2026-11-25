// ============================================================================
// profile.routes.ts
// Asiaporeair | Traveler Profile — Lazy-Loaded Feature Routes
// ============================================================================

import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PROFILE_ROUTES: Routes = [
    {
        path: '',
        // Profile shell layout wraps all child pages
        canActivate: [authGuard],
        children: [
            {
                path: '',
                redirectTo: 'personal-info',
                pathMatch: 'full'
            },
            {
                path: 'personal-info',
                canActivate: [authGuard],
                loadComponent: () =>
                    import('./personal-info/pages/personal-info/personal-info.component')
                        .then(m => m.PersonalInfoComponent),
                title: 'Personal Information | Asiaporeair'
            },
            {
                path: 'saved-passengers',
                loadComponent: () =>
                    import('./saved-passengers/pages/saved-passengers/saved-passengers.component')
                        .then(m => m.SavedPassengersComponent),
                title: 'Saved Passengers | Asiaporeair'
            },
            {
                path: 'account-security',
                loadComponent: () =>
                    import('./account-security/pages/account-security/account-security.component')
                        .then(m => m.AccountSecurityComponent),
                title: 'Account Security | Asiaporeair'
            }

        ]
    }
];