import { IPaginatedResult, IPaginationMetadata } from './paging.model';

/**
 * @description Data structure for paginated ticket results.
 */
export interface ITicketPagedResult {
  items: ITicketDto[];
  pagination: IPaginationMetadata;
}

/**
 * Paginated wrapper for ticket lists and search results.
 * Matches the 'paginatedData' anonymous object returned by the backend.
 */
export type ITicketPaginatedResponse = IPaginatedResult<ITicketDto>;

/**
 * @description Basic Ticket Information (Response DTO).
 */
export interface ITicketDto {
  ticketId: number;
  ticketCode: string;
  issueDate: string | Date; // ISO Date format
  status: string;
}

/**
 * @description Detailed Ticket Information including Flight and Passenger details (Response DTO).
 */
export interface ITicketDetailDto extends ITicketDto {
  bookingId: number;
  bookingReference: string;
  passengerId: number;
  passengerFirstName: string;
  passengerLastName: string;
  passengerDateOfBirth?: string;
  passengerPassportNumber?: string;
  frequentFlyerNumber?: string;
  flightInstanceId: number;
  flightNumber: string;
  airlineName: string;
  flightDepartureTime: string | Date;
  flightArrivalTime: string | Date;
  originAirportCode: string;
  originAirportName: string;
  destinationAirportCode: string;
  destinationAirportName: string;
  seatNumber: string;
  cabinClass: string;
}

/**
 * @description Filter criteria for administrative ticket searching (Request DTO).
 */
export interface ITicketFilter {
  ticketCode?: string;
  bookingId?: number;
  bookingReference?: string;
  flightInstanceId?: number;
  passengerNameContains?: string;
  passengerPassport?: string;
  status?: string;
  issueDateFrom?: string;
  issueDateTo?: string;
  includeDeleted: boolean;
}

/**
 * @description Payload for updating a ticket status (Request DTO).
 */
export interface IUpdateTicketStatusRequest {
  status: string; // Should match TicketStatus Enum values
}

/**
 * @description Payload for voiding a ticket with a reason (Request DTO).
 */
export interface IVoidTicketRequest {
  reason: string;
}