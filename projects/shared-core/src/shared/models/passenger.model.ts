
export interface ICreatePassengerDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO 8601 Date String
  passportNumber: string;
  userId?: number | null; // Optional link to a user profile
}


export interface IUpdatePassengerDto {
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  passportNumber?: string | null;
}


export interface IPassengerDto {
  passengerId: number;
  linkedUserId: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  passportNumber?: string | null;
  frequentFlyerCardNumber?: string | null;
}