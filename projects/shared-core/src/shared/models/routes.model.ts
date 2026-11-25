export interface IRouteFilterDto {
  originIata?: string;
  destinationIata?: string;
  isActive?: boolean;
}

export interface IRouteDto {
  routeId: number;
  originAirportIataCode: string;
  originAirportName: string;
  destinationAirportIataCode: string;
  destinationAirportName: string;
  originCity: string;
  destinationCity: string;
  distanceKm: number;
  isActive: boolean;
}

export interface IRouteDetailDto extends IRouteDto {
  operators: IRouteOperatorDto[];
}

export interface ICreateRouteDto {
  originAirportIataCode: string;
  destinationAirportIataCode: string;
  distanceKm: number;
}

export interface IUpdateRouteDto {
  distanceKm: number;
}

export interface IRouteOperatorDto {
  routeId: number;
  airlineIataCode: string;
  isCodeshare: boolean;
  isActive: boolean;
}

export interface IAssignOperatorDto {
  routeId: number;
  airlineIataCode: string;
  isCodeshare: boolean;
}

export interface IUpdateOperatorDto {
  isCodeshare: boolean;
}
