
import { AnyUserProfile } from '../models/user.model';

// ── Inbound Request DTOs ──────────────────────────────────────────────────────


export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}


export interface RefreshTokenRequest {
  /** The current (possibly expired) access token. */
  readonly token: string;
  /** The valid refresh token obtained during last login. */
  readonly refreshToken: string;
}

// ── Outbound Response DTOs ────────────────────────────────────────────────────


export interface AuthSessionResponse {
  /** Signed JWT access token for API authorization. */
  readonly token: string;

  /** Opaque refresh token for silent session renewal. */
  readonly refreshToken: string;

  /**
   * ISO 8601 timestamp indicating when the access token expires.
   * Example: `"2025-12-31T23:59:59Z"`
   */
  readonly expiration: string;
  /** The role-specific profile of the authenticated user. */
  readonly userProfile: AnyUserProfile;
}

// ── JWT Payload ───────────────────────────────────────────────────────────────

/**
 * @interface JwtClaims
 * @description Strongly-typed structure of the decoded JWT payload.
 * Used by `AuthStateService` to extract role and expiry without an API call.
 *
 * Claim names follow the JWT standard (RFC 7519) and must match those
 * configured in the .NET `JwtSecurityTokenHandler`.
 */
export interface JwtClaims {
  /** Subject — the user's GUID from the database. */
  readonly sub: string;

  /** User's email address claim. */
  readonly email: string;

  /** Optional full-name claim (sometimes included for display). */
  readonly name?: string;

  /**
   * Role claim — may be a single string or an array of strings
   * depending on the .NET JWT configuration.
   */
  readonly role: string | string[];

  /** Issued-at time in Unix epoch seconds. */
  readonly iat: number;

  /** Expiration time in Unix epoch seconds. */
  readonly exp: number;

  /** Token issuer (typically the API base URL). */
  readonly iss: string;

  /** Token audience (typically the client application URL). */
  readonly aud: string | string[];
}