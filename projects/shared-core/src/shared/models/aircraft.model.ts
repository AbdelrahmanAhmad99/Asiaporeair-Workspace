export interface IAddFlightHoursDto {
  hoursToAdd: number;
}

export interface IAircraftConfigDto {
  configId: number;
  configurationName: string;
  totalSeatsCount?: number;
  cabinClasses: ICabinClassDto[];
}

export interface IAircraftDetailDto extends IAircraftDto {
  configurations: IAircraftConfigDto[];
}

export interface IAircraftDto {
  tailNumber: string;
  airlineIataCode: string;
  airlineName: string;
  aircraftTypeModel?: string;
  aircraftTypeId: number;
  status: string;
  totalFlightHours?: number;
  acquisitionDate?: string | Date;

}

export interface IAircraftFilterDto {
  airlineIataCode?: string;
  aircraftTypeId?: number;
  status?: string;
  minFlightHours?: number;
  maxFlightHours?: number;
  acquiredAfterDate?: string | Date;
  includeDeleted?: boolean;
}

export interface ICabinClassDto {
  cabinClassId: number;
  name: string;
  seatCount: number;
}

export interface ICreateAircraftConfigDto {
  configurationName: string;
  totalSeatsCount: number;
}

export interface ICreateAircraftDto {
  tailNumber: string;
  airlineIataCode: string;
  aircraftTypeId: number;
  acquisitionDate?: string | Date;
  status: string;
}

export interface ICreateCabinClassDto {
  configId: number;
  name: string;
}

export interface ICreateSeatDto {
  seatNumber: string;
  cabinClassId: number;
  isWindow?: boolean;
  isExitRow?: boolean;
  isAisle?: boolean;
}

export interface IUpdateAircraftConfigDto {
  configurationName: string;
  totalSeatsCount: number;
}

export interface IUpdateAircraftDto {
  airlineIataCode: string;
  aircraftTypeId: number;
  acquisitionDate?: string | Date;
}

export interface IUpdateAircraftStatusDto {
  status: string;
}

export interface IUpdateSeatDto {
  cabinClassId: number;
  isWindow?: boolean;
  isExitRow?: boolean;
  isAisle?: boolean;
}
