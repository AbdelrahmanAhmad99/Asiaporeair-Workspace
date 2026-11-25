// ============================================================================
// check-in.routes.ts
// Asiaporeair | Lazy Routes — Check-in Feature
// ============================================================================

import { Routes } from '@angular/router';

export const CHECK_IN_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'search',
        pathMatch: 'full'
    },
    {
        // Step 1: PNR + Last Name lookup — public, no authGuard required
        path: 'search',
        title: 'Boarding & Services — Asiaporeair',
        loadComponent: () =>
            import('./check-in-search/pages/check-in-search/check-in-search.component')
                .then(m => m.CheckInSearchComponent)
    },
    {
        // Step 2: Passenger selection — requires currentBooking in store
        path: 'passenger-selection',
        title: 'Select Passengers — Asiaporeair',
        loadComponent: () =>
            import('./passenger-selection/pages/passenger-selection/passenger-selection.component')
                .then(m => m.PassengerSelectionComponent)
    },
    {
        // Step 3: Boarding pass confirmation / success
        path: 'success',
        title: 'Your Journey is Confirmed — Asiaporeair',
        loadComponent: () =>
            import('./check-in-success/pages/check-in-success/check-in-success.component')
                .then(m => m.CheckInSuccessComponent)
    },
    {
        // Step 3: Seat confirmation / boarding pass
        path: 'confirmation',
        title: 'Boarding Confirmation — Asiaporeair',
        loadComponent: () =>
            import('./check-in-confirmation/pages/check-in-confirmation/check-in-confirmation.component')
                .then(m => m.CheckInConfirmationComponent)
    }
];