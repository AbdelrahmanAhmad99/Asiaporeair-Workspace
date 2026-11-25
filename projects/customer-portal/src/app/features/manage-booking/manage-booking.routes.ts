// ============================================================================
// manage-booking.routes.ts
// Asiaporeair | Lazy Routes — Manage Booking Feature
// ============================================================================

import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const MANAGE_BOOKING_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'my-trips',
        pathMatch: 'full'
    },
    {
        path: 'my-trips',
        title: 'My Trips — Asiaporeair',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./my-trips/pages/my-trips/my-trips.component')
                .then(m => m.MyTripsComponent)
    },
    {
        path: 'booking/:id',
        title: 'Your Journey Manifest — Asiaporeair',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./booking-details/pages/booking-details/booking-details.component')
                .then(m => m.BookingDetailsComponent)
    },
    {
        path: 'booking/:id/modify',
        title: 'Update Your Suite Manifest — Asiaporeair',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./modify-booking/pages/modify-booking/modify-booking.component')
                .then(m => m.ModifyBookingComponent)
    },
    {
        path: 'booking/:id/cancel',
        title: 'Initiate Refund Process — Asiaporeair',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./cancellation/pages/cancellation/cancellation.component')
                .then(m => m.CancellationComponent)
    },
    {
        path: 'booking/:id/add-services',
        title: 'Add Services — Asiaporeair',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./add-services/pages/add-services/add-services.component')
                .then(m => m.AddServicesComponent)
    },
    {
        path: 'ticket/:code',
        title: 'Your E-Ticket — Asiaporeair',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./ticket-viewer/pages/ticket-viewer/ticket-viewer.component')
                .then(m => m.TicketViewerComponent)
    },
    {
        path: 'retrieve-booking',
        title: 'Locate Your Journey — Asiaporeair',
        loadComponent: () =>
            import('./retrieve-booking/pages/retrieve-booking/retrieve-booking.component')
                .then(m => m.RetrieveBookingComponent)
    },
    {
        path: 'retrieve-ticket',
        title: 'Locate Your Electronic Ticket — Asiaporeair',
        loadComponent: () =>
            import('./retrieve-ticket/pages/retrieve-ticket/retrieve-ticket.component')
                .then(m => m.RetrieveTicketComponent)
    }
];