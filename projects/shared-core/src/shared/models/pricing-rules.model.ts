export interface IPricingAttributeFilterDto {
  attributeType?: string;
  targetValue?: string;
  isActive?: boolean;
}

export interface IContextualPricingAttributeDto {
  attributeId: number;
  timeUntilDeparture: number | null;
  lengthOfStay: number | null;
  competitorFares: string | null;
  willingnessToPay: number | null;
  isActive?: boolean;
  attributeType: string;
  targetValue: string;
  modifierPercentage: number;
  priority: number;
}

export interface ICreatePricingAttributeDto {
  timeUntilDeparture?: number | null;
  lengthOfStay?: number | null;
  competitorFares?: string | null;
  willingnessToPay?: number | null;
  attributeType?: string;
  targetValue?: string;
  modifierPercentage?: number | null;
  priority?: number | null;
}

export interface IUpdatePricingAttributeDto {
  timeUntilDeparture?: number | null;
  lengthOfStay?: number | null;
  competitorFares?: string | null;
  willingnessToPay?: number | null;
  attributeType?: string;
  targetValue?: string;
  modifierPercentage?: number | null;
  priority?: number | null;
}

export interface IPricingContextDto {
  bookingClass?: string;
  frequentFlyerTier?: string;
  daysToDeparture?: number;
  seasonality?: string;
}

