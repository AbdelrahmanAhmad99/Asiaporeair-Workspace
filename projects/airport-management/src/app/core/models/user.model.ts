// =============================================================================
// user.model.ts
// Asiaporeair | Core / Models — User Profile Domain Models
// =============================================================================

import { UserRole } from '../auth/roles.model';

// ── Base Profile ──────────────────────────────────────────────────────────────

/**
 * @interface IBaseUserProfile
 * @description Fields shared by every user type in the system.
 * Mirrors C#: `BaseUserDto.cs`
 */
export interface IBaseUserProfile {
  readonly id:              string;
  readonly firstName:       string;
  readonly lastName:        string;
  readonly email:           string;
  readonly phoneNumber?:    string | null;
  readonly profilePictureUrl?: string | null;
  /** Discriminant — maps to `UserRole` enum for TypeScript narrowing. */
  readonly userType:        UserRole;
  readonly createdAt:       string;
  readonly updatedAt?:      string | null;
}

// ── Passenger / Customer Profile ─────────────────────────────────────────────

/**
 * @interface IPassengerProfile
 * @description Extended profile for registered customers (Role: `User`).
 * Mirrors C#: `PassengerProfileDto.cs`
 */
export interface IPassengerProfile extends IBaseUserProfile {
  readonly userType:            UserRole.User;
  readonly dateOfBirth?:        string | null;  // ISO 8601
  readonly passportNumber?:     string | null;
  readonly nationality?:        string | null;
  readonly loyaltyTier?:        LoyaltyTier | null;
  readonly loyaltyMiles?:       number;
  readonly frequentFlyerNumber?: string | null;
}

/** Loyalty programme tier levels. */
export type LoyaltyTier = 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

// ── Internal Staff Profiles ───────────────────────────────────────────────────

/**
 * @interface ISuperAdminProfile
 * Mirrors C#: `SuperAdminProfileDto.cs`
 */
export interface ISuperAdminProfile extends IBaseUserProfile {
  readonly userType:    UserRole.SuperAdmin;
  readonly permissions: string[];
}

/**
 * @interface IAdminProfile
 * Mirrors C#: `AdminProfileDto.cs`
 */
export interface IAdminProfile extends IBaseUserProfile {
  readonly userType:    UserRole.Admin;
  readonly department?: string | null;
}

/**
 * @interface ISupervisorProfile
 * Mirrors C#: `SupervisorProfileDto.cs`
 */
export interface ISupervisorProfile extends IBaseUserProfile {
  readonly userType:   UserRole.Supervisor;
  readonly section?:  string | null;
}

/**
 * @interface IPilotProfile
 * Mirrors C#: `PilotProfileDto.cs`
 */
export interface IPilotProfile extends IBaseUserProfile {
  readonly userType:         UserRole.Pilot;
  readonly licenseNumber?:   string | null;
  readonly flightHours?:     number | null;
  readonly aircraftRatings?: string[];
}

/**
 * @interface IAttendantProfile
 * Mirrors C#: `AttendantProfileDto.cs`
 */
export interface IAttendantProfile extends IBaseUserProfile {
  readonly userType:       UserRole.Attendant;
  readonly cabinRank?:     string | null;
  readonly languages?:     string[];
}

// ── Discriminated Union ───────────────────────────────────────────────────────

/**
 * @type AnyUserProfile
 * @description Discriminated union of all role-specific profile types.
 * TypeScript narrows this automatically via the `userType` property.
 *
 * @example
 * ```ts
 * if (profile.userType === UserRole.Pilot) {
 *   console.log(profile.flightHours); 
 * }
 * ```
 */
export type AnyUserProfile =
  | IPassengerProfile
  | ISuperAdminProfile
  | IAdminProfile
  | ISupervisorProfile
  | IPilotProfile
  | IAttendantProfile;