
import { IApiResponse } from '../../../core/models/api-response.model';
import { UserRole } from '../../../core/auth/roles.model';

// --- Auth & Token Models ---


export interface AuthResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: UserRole;
  token: string;
  profilePicture?: File;
}

// --- Login & Password Management ---

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// --- Registration Base Models ---

export interface RegisterDtoBase {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string; // ISO Date string
  address?: string;
  profilePicture?: File;
}

export interface EmployeeRegisterDtoBase {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfHire?: string;
  salary?: number;
  dateOfBirth?: string;
  address?: string;
  profilePicture?: File;
}

// --- Specific Registration DTOs ---

export interface UserDto extends RegisterDtoBase {
  frequentFlyerId?: number;
  krisFlyerTier?: string;
}

export interface SuperAdminDto extends EmployeeRegisterDtoBase {
  password: string;
  confirmPassword: string;
}

export interface AdminDto extends EmployeeRegisterDtoBase {
  department?: string;
}

export interface SupervisorDto extends EmployeeRegisterDtoBase {
}

export interface PilotDto extends EmployeeRegisterDtoBase {
  crewBaseAirport: string;
  licenseNumber: string;
  totalFlightHours?: number;
  aircraftTypeId: number;
  lastSimCheckDate?: string;
}

export interface AttendantDto extends EmployeeRegisterDtoBase {
  crewBaseAirport: string;
}

// --- Profile Update DTOs ---

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  profilePicture?: File;
}

export interface UpdateUserProfileDto extends UpdateProfileDto {
  krisFlyerTier?: string;
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
  crewBaseAirportId?: string;
  licenseNumber?: string;
  totalFlightHours?: number;
  lastSimCheckDate?: string;
}

export interface UpdateAttendantProfileDto extends UpdateEmployeeProfileDto {
  crewBaseAirportId?: string;
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

export interface PassengerProfileDto extends UserProfileBaseDto {
  frequentFlyerId?: number;
  krisFlyerTier?: string;
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

export type AnyUserProfileDto =
  | PassengerProfileDto
  | SuperAdminProfileDto
  | AdminProfileDto
  | SupervisorProfileDto
  | PilotProfileDto
  | AttendantProfileDto;