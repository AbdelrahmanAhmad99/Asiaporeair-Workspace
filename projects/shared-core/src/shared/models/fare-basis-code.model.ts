/**
 * Fare Basis Code Domain Models
 * Mirrors Application.DTOs.FareBasisCode namespace
 */

// ---------------------------------------------------------------------------
// Response DTOs
// ---------------------------------------------------------------------------

/**
 * Represents a Fare Basis Code and its details.
 * Mirrors: FareBasisCodeDto.cs
 */
export interface IFareBasisCodeDto {
  code: string;
  description: string;
  rules: string;
}

/**
 * DTO for creating a new Fare Basis Code (Admin/Management context).
 * Mirrors: CreateFareBasisCodeDto.cs
 */
export interface ICreateFareBasisCodeDto {
  code: string;
  description: string;
  rules: string;
}

/**
 * DTO for updating an existing Fare Basis Code.
 * Mirrors: UpdateFareBasisCodeDto.cs
 */
export interface IUpdateFareBasisCodeDto {
  description: string;
  rules: string;
}