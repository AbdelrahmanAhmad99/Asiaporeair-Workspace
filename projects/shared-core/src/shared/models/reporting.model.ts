export interface IReportRequestDto {
  startDate: string | Date;
  endDate: string | Date;
  airlineIataCode?: string;
  airportIataCode?: string;
}

export interface ISalesSummaryReportDto {
  totalBookingRevenue: number;
  totalAncillaryRevenue: number;
  totalRevenue: number;
  totalBookingsConfirmed: number;
  totalPassengers: number;
}

export interface IFlightPerformanceReportDto {
  totalFlightsScheduled: number;
  totalFlightsOperated: number;
  flightsCancelled: number;
  onTimeDeparturePercentage: number;
  onTimeArrivalPercentage: number;
  averageDepartureDelayMinutes: number;
}

export interface ILoadFactorReportDto {
  totalFlightsOperated: number;
  totalCapacityOffered: number;
  totalPassengersConfirmed: number;
  averageLoadFactorPercent: number;
}

export interface IPassengerManifestDto {
  flightInstanceId: number;
  flightNo: string;
  departureTimeLocal: string | Date;
  originIata: string;
  destinationIata: string;
  passengers: any[];
}
