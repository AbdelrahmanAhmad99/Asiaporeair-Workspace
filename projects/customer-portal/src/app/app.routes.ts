// app.routes.ts — Updated with manage-booking lazy feature

import { Routes } from '@angular/router';
import { MainCustomerLayoutComponent } from './layouts/pages/main-customer-layout/main-customer-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainCustomerLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/home/home.routes')
            .then(m => m.HOME_ROUTES)
      },
      {
        path: 'Home',
        loadChildren: () =>
          import('./features/home/home.routes')
            .then(m => m.HOME_ROUTES)
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/traveler-profile/profile.routes')
            .then(m => m.PROFILE_ROUTES)
      },
      {
        path: 'flight-info',
        loadChildren: () =>
          import('./features/flight-info/flight-info.routes')
            .then(m => m.FLIGHT_INFO_ROUTES)
      },
      {
        path: 'booking',
        loadChildren: () =>
          import('./features/booking/booking.routes')
            .then(m => m.BOOKING_ROUTES)
      },
      {
        path: 'manage-booking',
        loadChildren: () =>
          import('./features/manage-booking/manage-booking.routes')
            .then(m => m.MANAGE_BOOKING_ROUTES)
      },
      {
        path: 'check-in',
        loadChildren: () =>
          import('./features/check-in/check-in.routes')
            .then(m => m.CHECK_IN_ROUTES)
      },
      {
        path: 'loyalty',
        loadChildren: () =>
          import('./features/loyalty/loyalty.routes')
            .then(m => m.LOYALTY_ROUTES)
      },
      {
        path: 'journey-with-us',
        loadChildren: () =>
          import('./features/journey-with-us/journey-with-us.routes')
            .then(m => m.JOURNEY_WITH_US_ROUTES)
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/authentication/auth.routes').then(m => m.AUTH_ROUTES)
  }
];