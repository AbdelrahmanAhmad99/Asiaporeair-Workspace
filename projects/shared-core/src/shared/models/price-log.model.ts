export interface IPriceOfferLogFilterDto {
  fareCode?: string;
  ancillaryProductId?: number;
  startDate?: string | Date;
  endDate?: string | Date;
  wasPurchased?: boolean;
}

export interface IPriceOfferLogDto {
  offerId: number;
  timestamp: string | Date;
  fareCode?: string;
  ancillaryProductId?: number;
  basePrice: number;
  offeredPrice: number;
  contextApplied: string;
  wasPurchased: boolean;
  purchaseBookingId?: number;
  isActive: boolean;
}

export interface IPriceAnalyticsDto {
  totalOffers: number;
  totalPurchases: number;
  conversionRate: number;
  averageOfferedPrice: number;
  averageDiscountApplied: number;
}

export interface ICreatePriceOfferLogDto {
  fareCode?: string;
  ancillaryProductId?: number;
  basePrice: number;
  offeredPrice: number;
  contextApplied: string;
  wasPurchased: boolean;
  purchaseBookingId?: number;
}
