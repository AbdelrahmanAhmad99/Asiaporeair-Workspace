// --- 1. Base Entity Models (Response DTOs) ---

/**
 * Represents the definition of an ancillary product.
 * Maps to C#: AncillaryProductDto
 */
export interface IAncillaryProduct {
  productId: number;
  name: string;
  category: string; // e.g., 'Baggage', 'Meal'
  baseCost: number;
  unitOfMeasure: string; // e.g., 'kg', 'piece'
}

/**
 * Represents a purchased ancillary item within a booking.
 * Maps to C#: AncillarySaleDto
 */
export interface IAncillarySale {
  saleId: number;
  bookingId: number;
  productId: number;
  productName: string;
  pricePaid: number;
  quantity: number;
  segmentId?: number | null;
}

// --- 2. Request DTOs (Input Models) ---

/**
 * Payload for adding an ancillary to an existing booking.
 * Maps to C#: CreateAncillarySaleDto
 */
export interface ICreateAncillarySaleRequest {
  bookingId: number;
  productId: number;
  quantity: number; // Range 1-100
}

/**
 * Payload for creating a new product definition (Admin).
 * Maps to C#: CreateAncillaryProductDto
 */
export interface ICreateAncillaryProductRequest {
  name: string;
  category: string;
  baseCost: number;
  unitOfMeasure: string;
}

/**
 * Payload for updating a product definition (Admin).
 * Maps to C#: UpdateAncillaryProductDto
 */
export interface IUpdateAncillaryProductRequest {
  name: string;
  category: string;
  baseCost: number;
  unitOfMeasure: string;
}

/**
 * Filter criteria for searching products (Admin).
 * Maps to C#: AncillaryProductFilterDto
 */
export interface IAncillaryProductFilter {
  nameContains?: string;
  category?: string;
  minCost?: number;
  maxCost?: number;
  includeDeleted?: boolean;
}

// --- 3. Complex Response Structures ---

/**
 * Represents the anonymous object returned by the Admin Pagination endpoint.
 * Contains the list of items and metadata.
 */
export interface IPaginatedAncillaryResponse {
  items: IAncillaryProduct[];
  pagination: {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
  };
}