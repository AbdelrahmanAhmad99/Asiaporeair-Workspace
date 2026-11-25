/*
 * Public API Surface of shared-core
 */

// Common Services
export * from './shared/services/common/ancillary.service';
export * from './shared/services/common/checkin.service';
export * from './shared/services/common/frequent-flyer.service';
export * from './shared/services/common/payments.service';
export * from './shared/services/common/ticket.service';
export * from './shared/services/authentication/auth.service';

// Customer-Facing Services
export * from './shared/services/customer-facing/booking.service';
export * from './shared/services/customer-facing/flights.service';
export * from './shared/services/customer-facing/passengers.service';
export * from './shared/services/customer-facing/seat.service';

// Management System Services
export * from './shared/services/management-system/aircraft-types.service';
export * from './shared/services/management-system/aircraft.service';
export * from './shared/services/management-system/airlines.service';
export * from './shared/services/management-system/airports.service';
export * from './shared/services/management-system/booking-management.service';
export * from './shared/services/management-system/countries.service';
export * from './shared/services/management-system/crew.service';
export * from './shared/services/management-system/dashboard.service';
export * from './shared/services/management-system/employee.service';
export * from './shared/services/management-system/fares.service';
export * from './shared/services/management-system/flight-operations.service';
export * from './shared/services/management-system/flight-schedule.service';
export * from './shared/services/management-system/price-log.service';
export * from './shared/services/management-system/pricing-rules.service';
export * from './shared/services/management-system/reporting.service';
export * from './shared/services/management-system/routes.service';

// API & Helpers
export * from './shared/services/api-helpers';

// Models
export * from './shared/models/aircraft-type.model';
export * from './shared/models/aircraft.model';
export * from './shared/models/airline.model';
export * from './shared/models/airport.model';
export * from './shared/models/ancillary.model';
export * from './shared/models/auth.model';
export * from './shared/models/api-response.model';
export * from './shared/models/booking.model';
export * from './shared/models/check-in.model';
export * from './shared/models/country.model';
export * from './shared/models/crew.model';
export * from './shared/models/employee.model';
export * from './shared/models/fares.model';
export * from './shared/models/flight-operations.model';
export * from './shared/models/flight-schedule.model';
export * from './shared/models/flight.model';
export * from './shared/models/frequent-flyer.model';
export * from './shared/models/paginated-result';
export * from './shared/models/paging.model';
export * from './shared/models/passenger.model';
export * from './shared/models/payments.model';
export * from './shared/models/price-log.model';
export * from './shared/models/pricing-rules.model';
export * from './shared/models/reporting.model';
export * from './shared/models/routes.model';
export * from './shared/models/seat.model';
export * from './shared/models/ticket.model';

// Explicitly export non-overlapping interfaces from ambiguous models
export type {
    IBookingConfirmationDto,
    ITicketSummaryDto,
    IBookingFilterDto,
    IUpdateBookingStatusDto,
    IPassengerFilterDto,
    ITicketFilterDto
} from './shared/models/booking-management.model';

export type {
    IOperationalDashboardDto,
    IFlightInstanceForFidsDto
} from './shared/models/dashboard.model';