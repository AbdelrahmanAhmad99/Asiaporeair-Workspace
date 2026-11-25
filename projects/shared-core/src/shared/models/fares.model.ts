export interface IFareBasisCodeDto {
  code: string;
  description: string;
  rules: string;
  fareAmount?: number;
  cabinClass?: string;
  isRefundable?: boolean;
  isChangeable?: boolean;
  basePriceMultiplier?: number;
  baggageAllowanceKg?: number;
  isActive?: boolean;
}

export interface ICreateFareBasisCodeDto {
  code: string;
  description: string;
  rules: string;
  // fareAmount: number;
  // cabinClass: string;
  // isRefundable: boolean;
  // isChangeable: boolean;
  // basePriceMultiplier: number;
  // baggageAllowanceKg: number;
}

export interface IUpdateFareBasisCodeDto {
  description: string;
  rules: string;
}
