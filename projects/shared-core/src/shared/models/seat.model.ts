
export interface IAssignSeatRequestDto {
  bookingId: number;
  passengerId: number;
  seatId: string; // e.g., "12A-B77W-Y"
}


export interface ISeatAvailabilityRequestDto {
  flightInstanceId: number;
  cabinClassId?: number | null;
}


export interface IReserveSeatDto {
  seatId: string;
  passengerId: number;
}


export interface ISeatDto {
  seatId: string;
  seatNumber: string;
  cabinClassId: number;
  cabinClassName: string;
  aircraftTailNumber: string;
  isWindow: boolean;
  isAisle: boolean;
  isExitRow: boolean;
  isAvailable: boolean;
  seatPrice?: number | null;
}


export interface ISeatMapDto {
  flightInstanceId: number;
  aircraftModel: string;
  aircraftTailNumber: string;
  cabinLayouts: ICabinSeatLayoutDto[];
}

export interface ICabinSeatLayoutDto {
  cabinClassId: number;
  cabinClassName: string;
  seats: ISeatDto[];
}

export interface ISeatAssignmentDto {
  bookingId: number;
  passengerId: number;
  passengerName: string;
  seatId: string;
  seatNumber: string;
  cabinClassName: string;
}