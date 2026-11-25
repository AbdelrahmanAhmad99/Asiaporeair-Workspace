export interface IFlightInstanceDto {
  instanceId: number;
  scheduleId: number;
  flightNo: string;
  airlineIataCode: string;
  airlineName: string;
  originIataCode: string;
  originAirportName: string;
  originCity: string;
  destinationIataCode: string;
  destinationAirportName: string;
  destinationCity: string;
  scheduledDeparture: string | Date;
  scheduledArrival: string | Date;
  scheduledDepartureUtc?: string | Date;
  scheduledArrivalUtc?: string | Date;
  actualDeparture?: string | Date;
  actualArrival?: string | Date;
  status: string;
  assignedAircraftTailNumber?: string;
  scheduledAircraftModel?: string;
  assignedAircraftModel?: string;
  tailNumber?: string;
  originGate?: string;
  destinationGate?: string;
  originAirportIata?: string;
  destinationAirportIata?: string;
  baggageClaimCarousel?: string;
}




export interface IFlightInstanceBriefDto {
  instanceId: number;
  flightNo: string;
  scheduledDeparture: string | Date;
  scheduledArrival: string | Date;
  status: string;
  originIata: string;
  destinationIata: string;
}

export interface IFlightInstanceFilterDto {
  flightNo?: string;
  originIata?: string;
  destinationIata?: string;
  airportIataCode?: string;
  status?: string;
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface IGenerateInstancesRequestDto {
  startDate: string | Date;
  endDate: string | Date;
  airlineIataCode: string;
  // scheduleIds?: number[];
}

export interface IGenerationReportDto {
  instancesCreated: number;
  warnings: string[];
  failures: string[];
}

export interface ICreateAdHocFlightInstanceDto {
  flightNo: string;
  routeId: number;
  airlineIataCode: string;
  scheduledDeparture: string | Date;
  scheduledArrival: string | Date;
  aircraftTailNumber?: string;
  status: string;
}

export interface IUpdateFlightStatusDto {
  status: string;
  reason?: string;
}

export interface IUpdateFlightTimesDto {
  actualDeparture?: string | Date;
  actualArrival?: string | Date;
  // estimatedDepartureTime?: string | Date;
  // estimatedArrivalTime?: string | Date;
}

export interface IUpdateGateInfoDto {
  originGate?: string;
  destinationGate?: string;
  baggageClaimCarousel?: string;
}

export interface IAssignAircraftDto {
  tailNumber: string;
}
