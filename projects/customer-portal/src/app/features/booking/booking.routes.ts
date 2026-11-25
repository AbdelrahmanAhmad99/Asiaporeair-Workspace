// booking.routes.ts — Full Booking Flow

import { Routes } from '@angular/router';
import { FlightSearchComponent } from '../flight-info/flight-search/pages/flight-search/flight-search.component';
import { FlightResultsComponent } from './flight-results/pages/flight-results/flight-results.component';
import { PassengerDetailsComponent } from './passenger-details/pages/passenger-details/passenger-details.component';
import { AncillariesComponent } from './ancillaries/pages/ancillaries/ancillaries.component';
import { SeatSelectionComponent } from './seat-selection/pages/seat-selection/seat-selection.component';
import { PaymentGatewayComponent } from './payment-gateway/pages/payment-gateway/payment-gateway.component';
import { BookingSuccessComponent } from './booking-success/pages/booking-success/booking-success.component';

export const BOOKING_ROUTES: Routes = [
    { path: 'flight-search', component: FlightSearchComponent },
    { path: 'flight-results', component: FlightResultsComponent },
    { path: 'passenger-details', component: PassengerDetailsComponent },
    { path: 'ancillaries', component: AncillariesComponent },
    { path: 'seat-selection', component: SeatSelectionComponent },
    { path: 'payment', component: PaymentGatewayComponent },
    { path: 'booking-success', component: BookingSuccessComponent },
    { path: '', redirectTo: 'flight-search', pathMatch: 'full' }
];