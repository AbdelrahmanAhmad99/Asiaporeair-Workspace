import { IPassengerDto, ICreatePassengerDto } from './passenger.model';

/**
 * Booking Domain Models
 * Mirrors Application.DTOs.Booking namespace
 */

// ---------------------------------------------------------------------------
// Request DTOs
// ---------------------------------------------------------------------------

/**
 * DTO for initiating a new booking.
 * Mirrors: CreateBookingDto.cs
 */
export interface ICreateBookingDto {
  flightInstanceId: number;
  fareBasisCode: string;
  passengers: ICreatePassengerDto[];
  ancillaryPurchases?: IAddAncillaryDto[] | null;
}

/**
 * Helper DTO for adding ancillaries during creation.
 * Mirrors: AddAncillaryDto.cs
 */
export interface IAddAncillaryDto {
  productId: number;
  quantity: number;
  passengerId?: number | null;
  segmentId?: number | null;
}

/**
 * DTO for cancelling a booking.
 * Mirrors: BookingCancelDto.cs (Nested class in Controller)
 */
export interface IBookingCancelDto {
  reason?: string | null;
}

// ---------------------------------------------------------------------------
// Response DTOs
// ---------------------------------------------------------------------------

/**
 * Standard Booking Summary.
 * Mirrors: BookingDto.cs
 */
export interface IBookingDto {
  bookingId: number;
  bookingReference: string;
  bookingTime: string; // ISO String
  totalPrice: number;
  paymentStatus: string;
  flightNumber: string;
  flightDepartureTime: string | Date; // ISO String
  originAirportCode: string;
  destinationAirportCode: string;
  fareBasisCode: string;
  passengers: IPassengerDto[];
}

/**
 * Detailed Booking Information (for Manage Booking).
 * Mirrors: BookingDetailDto.cs
 */
export interface IBookingDetailDto {
  // Basic Info
  bookingId: number;
  bookingReference: string;
  bookingTime: string;
  totalPrice: number;
  paymentStatus: string;
  isCancelled: boolean;

  // User Info
  userId: number;
  userFullName: string;
  userEmail: string;

  // Flight Info
  flightInstanceId: number;
  flightNumber: string;
  airlineName: string;
  aircraftModel: string;
  flightDepartureTime: string | Date;
  flightArrivalTime: string | Date;
  originAirportCode: string;
  originAirportName: string;
  destinationAirportCode: string;
  destinationAirportName: string;
  fareBasisCode: string;
  fareDescription: string;

  // Collections
  passengers: IBookingPassengerDetailDto[];
  ancillarySales: IAncillarySaleDto[];
  payments: IPaymentDto[];
}

/**
 * Helper for detailed passenger info within a booking.
 * Mirrors: BookingPassengerDetailDto.cs
 */
export interface IBookingPassengerDetailDto {
  passengerId: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | Date | null;
  passportNumber?: string | null;
  assignedSeatNumber?: string | null;
  cabinClassName?: string | null;
}

/**
 * Helper for Ancillary Sales.
 * Mirrors: AncillarySaleDto.cs
 */
export interface IAncillarySaleDto {
  saleId: number;
  bookingId: number;
  productId: number;
  productName: string;
  pricePaid: number;
  quantity: number;
  segmentId?: number | null;
}

/**
 * Helper for Payments.
 * Mirrors: PaymentDto.cs
 */
export interface IPaymentDto {
  paymentId: number;
  bookingId: number;
  bookingReference: string;
  amount: number;
  method: string;
  status: string;
  transactionId?: string | null;
  transactionDateTime: string;
}