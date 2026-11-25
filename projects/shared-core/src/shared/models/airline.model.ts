import { IAircraftDto } from './aircraft.model';

export interface IAirlineDetailDto extends IAirlineDto {
  fleet: IAircraftDto[];
}

export interface IAirlineDto {
  iataCode: string;
  name: string;
  callsign: string;
  operatingRegion: string;
  baseAirportIataCode: string;
  baseAirportName: string;
}

export interface ICreateAirlineDto {
  iataCode: string;
  name: string;
  callsign: string;
  operatingRegion: string;
  baseAirportIataCode: string;
}

export interface IUpdateAirlineDto {
  name: string;
  callsign: string;
  operatingRegion: string;
  baseAirportIataCode: string;
}
