export interface ICrewFilterDto {
  baseAirportIata?: string;
  isActive?: boolean;
  position?: string;
}

export interface IUpdateCrewBaseRequestDto {
  newBaseAirportIata: string;
}

export interface ICrewMemberSummaryDto {
  employeeId: number;
  firstName: string;
  lastName: string;
  baseAirportIata: string;
  isActive: boolean;
  appUserId: string;
  crewBaseAirportIata: string;
  email: string;
  fullName: string;
  position: string;
}

export interface ICrewMemberDetailDto {
  employeeId: number;
  firstName: string;
  lastName: string;
  baseAirportIata: string;
  isActive: boolean;
  certifications?: ICertificationDto[];
}

export interface ICertificationDto {
  certId: number;
  certificationName: string;
  type: string;
  issueDate: string;
  expiryDate: string;
  isValid: boolean;
}

export interface ICreateCertificationDto {
  certificationName: string;
  type: string;
  issueDate: string;
  expiryDate: string;
}

export interface ICrewAssignmentDto {
  crewMemberEmployeeId: number;
  role: string;
}

export interface IAssignCrewRequestDto {
  flightInstanceId: number;
  assignments: ICrewAssignmentDto[];
}

export interface ICrewScheduleRequestDto {
  crewMemberEmployeeId: number;
  startDate: string;
  endDate: string;
}

export interface ICrewAvailabilityRequestDto {
  flightDepartureTime: string; // ISO Date String
  flightArrivalTime: string;   // ISO Date String
  requiredPosition?: string;
  requiredBaseAirportIata?: string;
  requiredAircraftTypeId?: number;
}
