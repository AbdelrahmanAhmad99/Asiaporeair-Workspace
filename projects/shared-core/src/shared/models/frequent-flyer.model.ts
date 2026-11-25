import { IPaginationMetadata } from './paging.model';

// ==========================================================================
// REGION: Enums & Shared Metadata
// ==========================================================================

export interface IPointsAddedResponse {
  pointsAdded: number;
}

// ==========================================================================
// REGION: Data Transfer Objects (DTOs)
// ==========================================================================

/**
 * Represents the detailed Frequent Flyer account information.
 * Mirrors C#: Application.DTOs.FrequentFlyer.FrequentFlyerDto
 */
export interface IFrequentFlyerDto {
  flyerId: number;
  linkedUserId: number;
  linkedUserName: string;
  cardNumber: string;
  level: string; // e.g., "Member", "Silver", "Gold"
  awardPoints: number;
  isActive: boolean;
}

/**
 * Wrapper for the Search result which contains items and pagination metadata.
 * Mirrors the anonymous object returned in FrequentFlyerController.SearchAccounts
 */
export interface IFrequentFlyerSearchResult {
  items: IFrequentFlyerDto[];
  pagination: IPaginationMetadata;
}

/**
 * Payload to create a new Frequent Flyer account.
 * Mirrors C#: Application.DTOs.FrequentFlyer.CreateFrequentFlyerDto
 */
export interface ICreateFrequentFlyerRequest {
  userId: number;
  cardNumber: string;
  level?: string; // Optional, defaults to "Member" in backend
  initialAwardPoints?: number;
}

/**
 * Filter criteria for searching accounts (Admin).
 * Mirrors C#: Application.DTOs.FrequentFlyer.FrequentFlyerFilterDto
 */
export interface IFrequentFlyerFilter {
  cardNumberContains?: string | null;
  level?: string | null;
  minPoints?: number | null;
  maxPoints?: number | null;
  includeDeleted?: boolean;
}

/**
 * Payload for manually adjusting points.
 * Mirrors C#: Presentation.Controllers.FrequentFlyerController.UpdatePointsRequestDto
 */
export interface IUpdatePointsRequest {
  pointsDelta: number; // Positive to add, negative to subtract
  reason: string;
}

/**
 * Payload for updating the tier level.
 * Mirrors C#: Presentation.Controllers.FrequentFlyerController.UpdateLevelRequestDto
 */
export interface IUpdateLevelRequest {
  newLevel: string;
}