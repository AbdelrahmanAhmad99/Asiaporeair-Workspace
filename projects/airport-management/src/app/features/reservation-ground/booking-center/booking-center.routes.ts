

import { Routes } from '@angular/router';

export const BOOKING_CENTER_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'booking-search-terminal',
        pathMatch: 'full',
    },
    {
        path: 'booking-search-terminal',
        loadComponent: () =>
            import('./pages/booking-search-terminal/booking-search-terminal.component').then(
                m => m.BookingSearchTerminalComponent
            ),
        title: 'Booking Search Terminal — AOMS',

    },
    {
        path: 'pnr-deep-explorer/:pnr',
        loadComponent: () =>
            import('./pages/pnr-deep-explorer/pnr-deep-explorer.component').then(
                m => m.PnrDeepExplorerComponent
            ),
        title: 'PNR Deep Explorer — AOMS',

    },
    {
        path: 'passenger-index',
        loadComponent: () =>
            import('./pages/passenger-master-index/passenger-master-index.component').then(
                m => m.PassengerMasterIndexComponent
            ),
        title: 'Passenger Master Index — AOMS',

    },
    {
        path: '**',
        redirectTo: '',
    },
];