/**
 * @interface IAircraftTypeDto
 * @description Data Transfer Object for representing Aircraft Type details.
 */
export interface IAircraftTypeDto {
  typeId: number;
  model: string;
  manufacturer: string;
  rangeKm?: number;
  maxSeats?: number;
  cargoCapacity?: number;
  cruisingVelocity?: number;
}

/**
 * @interface IAircraftTypeFilterDto
 * @description Data Transfer Object for filtering Aircraft Type searches.
 */
export interface IAircraftTypeFilterDto {
  modelContains?: string;
  manufacturer?: string;
  minRangeKm?: number;
  maxRangeKm?: number;
  minSeats?: number;
  maxSeats?: number;
  minCargoCapacity?: number;
  maxCargoCapacity?: number;
  includeDeleted?: boolean;
}

/**
 * @interface ICreateAircraftTypeDto
 * @description Data Transfer Object for creating a new Aircraft Type.
 */
export interface ICreateAircraftTypeDto {
  model: string;
  manufacturer: string;
  rangeKm?: number;
  maxSeats?: number;
  cargoCapacity?: number;
  cruisingVelocity?: number;
}

/**
 * @interface IUpdateAircraftTypeDto
 * @description Data Transfer Object for updating an existing Aircraft Type.
 */
export interface IUpdateAircraftTypeDto {
  model: string;
  manufacturer: string;
  rangeKm?: number;
  maxSeats?: number;
  cargoCapacity?: number;
  cruisingVelocity?: number;
}
