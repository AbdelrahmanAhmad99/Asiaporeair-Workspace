import { UserRole } from './roles.model';

// --- Auth & Token Models ---

/**
 * Response received after a successful login.
 * Reconstructed from usage in AuthService.cs
 */
export interface AuthResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserRole;
  token: string;
  profilePicture?: File;
}


// --- Registration Base Models ---



export interface EmployeeRegisterDtoBase {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  /** Primary date field for hire */
  dateOfHire?: string;
  salary?: number;
  /** Primary date field for birth */
  dateOfBirth?: string;
  address?: string;
  /** Input only: The file to upload */
  profilePicture?: File;
}

// --- Specific Registration DTOs ---

export interface SuperAdminDto extends EmployeeRegisterDtoBase {
  password: string;
  confirmPassword: string;
}

export interface AdminDto extends EmployeeRegisterDtoBase {
  department?: string;
}

export interface SupervisorDto extends EmployeeRegisterDtoBase {
  // Currently empty in C#, reserved for future extension
}

export interface PilotDto extends EmployeeRegisterDtoBase {
  /** The IATA code of the base airport */
  crewBaseAirport: string;
  licenseNumber: string;
  totalFlightHours?: number;
  aircraftTypeId: number;
  lastSimCheckDate?: string;
}

export interface AttendantDto extends EmployeeRegisterDtoBase {
  /** The IATA code of the base airport */
  crewBaseAirport: string;
}


// --- Profile Update DTOs ---

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  /** Input only: New profile picture file */
  profilePicture?: File;
}



export interface UpdateEmployeeProfileDto extends UpdateProfileDto {
  dateOfHire?: string;
  salary?: number;
}

export interface UpdateSuperAdminProfileDto extends UpdateEmployeeProfileDto { }

export interface UpdateAdminProfileDto extends UpdateEmployeeProfileDto {
  department?: string;
}

export interface UpdateSupervisorProfileDto extends UpdateEmployeeProfileDto {
  managedArea?: string;
}

export interface UpdatePilotProfileDto extends UpdateEmployeeProfileDto {
  crewBaseAirport?: string;
  licenseNumber?: string;
  totalFlightHours?: number;
  lastSimCheckDate?: string;
}

export interface UpdateAttendantProfileDto extends UpdateEmployeeProfileDto {
  crewBaseAirport?: string;
}

// --- Profile View Models (Responses) ---

export interface UserProfileBaseDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  userName: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  dateOfBirth?: string;
  address: string;
  dateCreated: string;
  lastLogin?: string;
  userType: UserRole;
}


export interface SuperAdminProfileDto extends UserProfileBaseDto {
  employeeId: number;
  dateOfHire?: string;
  salary?: number;
}

export interface AdminProfileDto extends UserProfileBaseDto {
  employeeId: number;
  dateOfHire?: string;
  salary?: number;
  department?: string;
  addedById?: string;
  addedByName?: string;
}

export interface SupervisorProfileDto extends UserProfileBaseDto {
  employeeId: number;
  dateOfHire?: string;
  salary?: number;
  managedArea?: string;
  addedById?: string;
  addedByName?: string;
}

export interface PilotProfileDto extends UserProfileBaseDto {
  employeeId: number;
  dateOfHire?: string;
  salary?: number;
  crewBaseAirportId?: string;
  position?: string;
  licenseNumber: string;
  totalFlightHours?: number;
  aircraftTypeId: number;
  lastSimCheckDate?: string;
  addedById?: string;
  addedByName?: string;
}

export interface AttendantProfileDto extends UserProfileBaseDto {
  employeeId: number;
  dateOfHire?: string;
  salary?: number;
  crewBaseAirportId?: string;
  position?: string;
  addedById?: string;
  addedByName?: string;
}

/** Union type for the GetMyProfile response */
export type AnyUserProfileDto =
  | SuperAdminProfileDto
  | AdminProfileDto
  | SupervisorProfileDto
  | PilotProfileDto
  | AttendantProfileDto;