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

export interface IOperationalDashboardDto {
  activeFlights?: number;
  delayedFlights?: number;
  cancelledFlights?: number;
}

export interface IFlightInstanceForFidsDto {
  instanceId?: number;
  flightNo: string;
  airlineIataCode?: string;
  airlineName: string;
  originCity?: string;
  originIataCode?: string;
  destinationCity?: string;
  destinationIataCode?: string;
  scheduledTime: string;
  estimatedTime?: string;
  status?: string;
  gate?: string;
}
