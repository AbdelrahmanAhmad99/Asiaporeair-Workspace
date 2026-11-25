export interface IBookingConfirmationDto {
  bookingId: number;
  bookingReference: string;
  confirmationMessage: string;
  generatedTickets: ITicketSummaryDto[];
}

export interface ITicketSummaryDto {
  ticketId: number;
  ticketCode: string;
  passengerId: number;
  passengerName: string;
}

export interface ITicketDetailDto {
  ticketId: number;
  ticketCode: string;
  issueDate: string | Date;
  totalFare: number;
  status: string;
  passengerId: number;
  passengerName: string;
  bookingId: number;
  bookingReference: string;
  flightInstanceId: number;
  flightNumber: string;
  departureTime: string | Date;
  seatNumber?: string;
  cabinClassName?: string;
  flightArrivalTime: string | Date;
  originAirportCode: string;
  destinationAirportCode: string;
  fareBasisCode: string;
  airlineName: string;
  aircraftModel: string;
  fareDescription: string;
  originAirportName: string;
  destinationAirportName: string;
}

export interface IBookingDetailDto {
  bookingId: number;
  bookingReference: string;
  bookingTime: string;
  totalPrice: number;
  paymentStatus: string;
  isCancelled: boolean;
  userId: number;
  userFullName: string;
  userEmail: string;
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
  passengers: IBookingPassengerDetailDto[];
  ancillarySales: any[];
  payments: any[];
}

export interface IBookingDto {
  bookingId: number;
  bookingReference: string;
  bookingTime: string;
  totalPrice: number;
  paymentStatus: string;
  flightNumber: string;
  flightDepartureTime: string | Date;
  originAirportCode: string;
  destinationAirportCode: string;
  fareBasisCode: string;
  passengers: IPassengerDto[];
}

export interface IBookingFilterDto {
  bookingReference?: string;
  flightInstanceId?: number;
  passengerNameContains?: string;
  passengerPassport?: string;
  paymentStatus?: string;
  bookingDateFrom?: string | Date;
  bookingDateTo?: string | Date;
  userId?: number;
  includeDeleted?: boolean;
}

export interface IBookingPassengerDetailDto {
  passengerId: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | Date;
  passportNumber?: string;
  assignedSeatNumber?: string;
  cabinClassName?: string;
}

export interface ICreateBookingDto {
  flightInstanceId: number;
  fareBasisCode: string;
  passengers: ICreatePassengerDto[];
  ancillaryPurchases?: any[];
}

export interface IUpdateBookingStatusDto {
  newStatus: string;
  reason?: string;
}

export interface ICreatePassengerDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string | Date;
  passportNumber: string;
}

export interface IPassengerDto {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string | Date;
  passportNumber: string;
}

export interface IPassengerFilterDto {
  nameContains?: string;
  passportNumber?: string;
  userId?: number;
}

export interface IUpdatePassengerDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string | Date;
  passportNumber: string;
}

export interface ITicketDetailDto {
  ticketId: number;
  ticketCode: string;
  issueDate: string | Date;
  totalFare: number;
  status: string;
  passengerId: number;
  passengerName: string;
  bookingId: number;
  bookingReference: string;
  flightInstanceId: number;
  flightNumber: string;
  departureTime: string | Date;
  seatNumber?: string;
  cabinClassName?: string;
}

export interface ITicketDto {
  ticketId: number;
  ticketCode: string;
  issueDate: string | Date;
  status: string;
  passengerName: string;
  flightNumber: string;
}

export interface ITicketFilterDto {
  ticketCode?: string;
  bookingReference?: string;
  passengerId?: number;
  flightInstanceId?: number;
  status?: string;
}

export interface IUpdateTicketStatusDto {
  newStatus: string;
}

export interface IBookingCancelDto {
  reason?: string;
}