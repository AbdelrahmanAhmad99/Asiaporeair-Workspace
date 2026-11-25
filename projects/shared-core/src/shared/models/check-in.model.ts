import { IPaginationMetadata } from './paging.model';


export interface IBoardingPassSearchResult {
  items: IBoardingPassDto[];
  pagination: IPaginationMetadata;
}

// ==========================================================================
// REGION: Data Transfer Objects (DTOs)
// ==========================================================================

/**
 * Represents the detailed Boarding Pass information.
 * Mirrors C#: Application.DTOs.BoardingPass.BoardingPassDto
 */
export interface IBoardingPassDto {
  passId: number;

  // Passenger Info
  passengerId: number;
  passengerName: string;
  frequentFlyerNumber?: string | null;

  // Flight Info
  flightInstanceId: number;
  flightNumber: string;
  originAirportCode: string;
  destinationAirportCode: string;
  departureTime: string; // ISO Date String
  arrivalTime: string;   // ISO Date String

  // Boarding Info
  seatNumber: string;
  cabinClass: string;
  boardingTime: string;  // ISO Date String
  sequenceNumber: number;
  precheckStatus?: boolean | null;

  // Booking Info
  bookingReference: string;
  ticketCode: string;
}

/**
 * Request payload to generate a new boarding pass.
 * Mirrors C#: Application.DTOs.BoardingPass.GenerateBoardingPassRequestDto
 */
export interface IGenerateBoardingPassRequest {
  bookingId: number;
  passengerId: number;
  // preferredSeatId?: string; // Commented out in backend
}

export interface IGenerateBoardingPassByReferenceRequest {
  bookingReference: string;
  passengerId: number;
}

/**
 * Request payload for scanning a pass at the gate.
 * Mirrors C#: Application.DTOs.BoardingPass.GateScanRequestDto
 */
export interface IGateScanRequest {
  passId: number;
  flightInstanceId: number;
  // gateNumber?: string; // Optional in backend
}

/**
 * Filter criteria for searching boarding passes (Admin).
 * Mirrors C#: Application.DTOs.BoardingPass.BoardingPassFilterDto
 */
export interface IBoardingPassFilter {
  flightInstanceId?: number | null;
  seatNumber?: string | null;
  passengerNameContains?: string | null;
  hasBoarded?: boolean | null;
  includeDeleted?: boolean;
}