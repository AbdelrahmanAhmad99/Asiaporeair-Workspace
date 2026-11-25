// =============================================================================
// user.model.ts
// Asiaporeair | Core / Models — User Profile Domain Models
// =============================================================================

import { UserRole } from '../auth/roles.model';

// ── Base Profile ──────────────────────────────────────────────────────────────


export interface IBaseUserProfile {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phoneNumber?: string | null;
  readonly address?: string | null;
  readonly profilePictureUrl?: string | null;
  readonly userType: UserRole;
  readonly createdAt: string;
  readonly dateCreated: string;
  readonly updatedAt?: string | null;
}

// ── Passenger / Customer Profile ─────────────────────────────────────────────


export interface IPassengerProfile extends IBaseUserProfile {
  readonly userType: UserRole.User;
  readonly dateOfBirth?: string | null;  // ISO 8601
  readonly passportNumber?: string | null;
  readonly nationality?: string | null;
  readonly loyaltyTier?: LoyaltyTier | null;
  readonly loyaltyMiles?: number;
  readonly frequentFlyerNumber?: string | null;
}

/** Loyalty programme tier levels. */
export type LoyaltyTier = 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

// ── Internal Staff Profiles ───────────────────────────────────────────────────


export interface ISuperAdminProfile extends IBaseUserProfile {
  readonly userType: UserRole.SuperAdmin;
  readonly permissions: string[];
}


export interface IAdminProfile extends IBaseUserProfile {
  readonly userType: UserRole.Admin;
  readonly department?: string | null;
}


export interface ISupervisorProfile extends IBaseUserProfile {
  readonly userType: UserRole.Supervisor;
  readonly section?: string | null;
}

/**
 * @interface IPilotProfile
 * Mirrors C#: `PilotProfileDto.cs`
 */
export interface IPilotProfile extends IBaseUserProfile {
  readonly userType: UserRole.Pilot;
  readonly licenseNumber?: string | null;
  readonly flightHours?: number | null;
  readonly aircraftRatings?: string[];
}


export interface IAttendantProfile extends IBaseUserProfile {
  readonly userType: UserRole.Attendant;
  readonly cabinRank?: string | null;
  readonly languages?: string[];
}

// ── Discriminated Union ───────────────────────────────────────────────────────


export type AnyUserProfile =
  | IPassengerProfile
  | ISuperAdminProfile
  | IAdminProfile
  | ISupervisorProfile
  | IPilotProfile
  | IAttendantProfile;