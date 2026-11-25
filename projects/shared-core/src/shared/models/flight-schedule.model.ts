export interface IScheduleFilterDto {
  flightNo?: string;
  routeId?: number;
  originIata?: string;
  destinationIata?: string;
  isActive?: boolean;
}

export interface IFlightScheduleDto {
  scheduleId: number;
  flightNo: string;
  routeId: number;
  routeName: string;
  airlineIataCode: string;
  aircraftTypeId: number;
  aircraftTypeModel: string;
  originAirportIata: string;
  departureTimeScheduled: string;
  destinationAirportIata: string;
  arrivalTimeScheduled: string;
  daysOfWeek: number;
  effectiveStartDate: string | Date;
  effectiveEndDate?: string | Date;
  isActive: boolean;
  legs?: IFlightLegDefDto[];
}

export interface ICreateFlightScheduleDto {
  flightNo: string;
  routeId: number;
  airlineIataCode: string;
  aircraftTypeId: number;
  departureTimeScheduled: string;
  arrivalTimeScheduled: string;
  daysOfWeek: number;
  effectiveStartDate: string | Date;
  effectiveEndDate?: string | Date;
}

export interface IFlightLegDefDto {
  legDefId: number;
  scheduleId: number;
  segmentNumber: number;
  departureAirportIataCode: string;
  departureAirportName?: string;
  arrivalAirportIataCode: string;
  arrivalAirportName?: string;
  departureOffsetDays: number;
  departureTimeLocal: string;
  arrivalOffsetDays: number;
  arrivalTimeLocal: string;
}

export interface ICreateFlightLegDefDto {
  segmentNumber: number;
  departureAirportIataCode: string;
  arrivalAirportIataCode: string;
}
