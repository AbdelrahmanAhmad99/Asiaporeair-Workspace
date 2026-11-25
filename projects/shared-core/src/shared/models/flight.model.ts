/**
 * Flight Domain Models
 * Mirrors Application.DTOs.Flight namespace
 */

// ---------------------------------------------------------------------------
// Search Request DTOs
// ---------------------------------------------------------------------------

/**
 * DTO for comprehensive flight search.
 * Mirrors: FlightSearchRequestDto.cs
 */
export interface IFlightSearchRequestDto {
  searchType: 'OneWay' | 'RoundTrip' | 'MultiCity';
  passengers: IPassengerCountDto;
  segments: ISearchSegmentDto[];
  cabinClassPreference?: string; // e.g., "Economy", "Business"
  includeFlexibleFares?: boolean;
}

/**
 * Represents passenger mix for search.
 * Mirrors: PassengerCountDto.cs
 */
export interface IPassengerCountDto {
  adults: number;
  children: number;
  infants: number;
  readonly totalPassengers?: number; // Calculated helper
}

/**
 * Represents one leg of the search criteria.
 * Mirrors: SearchSegmentDto.cs
 */
export interface ISearchSegmentDto {
  originIataCode: string;
  destinationIataCode: string;
  departureDate: string; // ISO 8601 Date String
}

/**
 * DTO for checking flight status.
 * Mirrors: FlightStatusRequestDto.cs
 */
export interface IFlightStatusRequestDto {
  flightNumber: string;
  flightDate: string; // ISO 8601 Date String
}

// ---------------------------------------------------------------------------
// Response DTOs (Itinerary & Details)
// ---------------------------------------------------------------------------

/**
 * Represents a complete journey option shown to the user.
 * Mirrors: FlightItineraryDto.cs
 */
export interface IFlightItineraryDto {
  itineraryId: string;
  outboundSegments: IFlightSegmentDto[];
  inboundSegments?: IFlightSegmentDto[] | null;
  fareOptions: IFlightFareOptionDto[];
  totalDurationMinutes: number;
  numberOfStops: number;
}

/**
 * Represents a single flight leg (e.g., SQ318 from SIN to LHR).
 * Mirrors: FlightSegmentDto.cs
 */
export interface IFlightSegmentDto {
  flightInstanceId: number;
  flightNumber: string;
  airlineName: string;
  airlineIataCode: string;
  aircraftModel: string;
  
  // Origin
  originAirportIata: string;
  originAirportName: string;
  originCity: string;
  departureTime: string; // ISO String

  // Destination
  destinationAirportIata: string;
  destinationAirportName: string;
  destinationCity: string;
  arrivalTime: string; // ISO String

  durationMinutes: number;
}

/**
 * Represents a specific fare package for a flight.
 * Mirrors: FlightFareOptionDto.cs
 */
export interface IFlightFareOptionDto {
  fareBasisCode: string;
  fareName: string;
  cabinClass: string;
  
  pricePerAdult: number;
  pricePerChild: number;
  pricePerInfant: number;

  baggageAllowance: string;
  isChangeable: boolean;
  isRefundable: boolean;
  
  availableSeats: number;
}

/**
 * Detailed information for a specific flight instance (Modal/Page).
 * Mirrors: FlightDetailsDto.cs
 */
export interface IFlightDetailsDto {
  flightInstanceId: number;
  flightNumber: string;
  airlineName: string;
  aircraftModel: string;
  tailNumber: string;

  originAirportName: string;
  originIataCode: string;
  scheduledDepartureTime: string; // ISO String

  destinationAirportName: string;
  destinationIataCode: string;
  scheduledArrivalTime: string; // ISO String

  durationMinutes: number;
  status: string;

  cabinClasses: ICabinClassAvailabilityDto[];
  amenities: string[];
}

/**
 * Helper for cabin class seat availability.
 * Mirrors: CabinClassAvailabilityDto.cs
 */
export interface ICabinClassAvailabilityDto {
  cabinClassId: number;
  name: string;
  totalSeats: number;
  availableSeats: number;
  layout: string;
}