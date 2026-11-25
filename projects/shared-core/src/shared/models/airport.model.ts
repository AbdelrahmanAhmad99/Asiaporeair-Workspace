export interface IAirportDto {
  iataCode: string;
  icaoCode: string;
  name: string;
  city: string;
  countryIsoCode: string;
  countryName: string;
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface IAirportFilterDto {
  nameContains?: string;
  city?: string;
  countryIsoCode?: string;
  continent?: string;
  minLatitude?: number;
  maxLatitude?: number;
  minLongitude?: number;
  maxLongitude?: number;
  minAltitude?: number;
  maxAltitude?: number;
  includeDeleted?: boolean;
}

export interface ICreateAirportDto {
  iataCode: string;
  icaoCode: string;
  name: string;
  city: string;
  countryIsoCode: string;
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface IUpdateAirportDto {
  name: string;
  city: string;
  countryIsoCode: string;
  latitude: number;
  longitude: number;
  altitude?: number;
}
