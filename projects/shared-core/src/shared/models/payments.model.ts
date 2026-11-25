
// ==========================================================================
// REGION: Enums & Shared
// ==========================================================================

/**
 * Represents the search result wrapper containing list items.
 * Corresponds to the paged result returned by the search endpoint.
 */
export interface IPaymentSearchResult {
  items: IPaymentTransaction[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

/**
 * Represents daily revenue statistics.
 * Corresponds to the anonymous object returned by 'GetDailyRevenue'.
 */
export interface IDailyRevenueStats {
  date: string;
  totalRevenue: number;
  transactionCount: number;
  currency: string;
}

// ==========================================================================
// REGION: Data Transfer Objects (DTOs)
// ==========================================================================

/**
 * DTO for initiating a payment intent (Client -> Server).
 * Mirrors C#: Application.DTOs.Payment.CreatePaymentIntentDto
 */
export interface ICreatePaymentIntentRequest {
  bookingId: number;
  amountOverride?: number; // Optional partial payment
  currency?: string; // Default 'sgd'
}

/**
 * Response containing the client secret for Stripe frontend integration.
 * Mirrors C#: Application.DTOs.Payment.PaymentIntentResponseDto
 */
export interface IPaymentIntentResponse {
  bookingId: number;
  paymentIntentId: string;
  clientSecret: string;
  stripePublicKey: string; // To initialize Stripe Elements
  amount: number;
  currency: string;
}

/**
 * DTO representing the intent to finalize/confirm a payment method.
 * Mirrors C#: Application.DTOs.Payment.CreatePaymentDto
 */
export interface ICreatePaymentRequest {
  paymentIntentId: string;
  paymentMethodId?: string; // Optional if handled by Frontend SDK
  returnUrl: string;
}

/**
 * DTO for checking the payment status of a booking.
 * Mirrors C#: Application.DTOs.Payment.PaymentStatusDto
 */
export interface IPaymentStatus {
  bookingId: number;
  status: string; // e.g., "Pending", "Succeeded", "Failed"
  amountPaid: number;
  transactionId?: string;
  lastUpdated: string; // ISO Date String
}

/**
 * Detailed view of a payment transaction (Admin/History).
 * Mirrors C#: Application.DTOs.Payment.PaymentTransactionDto
 */
export interface IPaymentTransaction {
  paymentId: number;
  bookingId: number;
  bookingReference?: string;
  transactionId: string; // Gateway Reference (e.g., Stripe ID)
  amount: number;
  currency: string;
  paymentMethod: string;
  method?: string; // Backend property alias
  status: string;
  transactionDate: string; // ISO Date String
  transactionDateTime?: string; // Backend property alias
  isRefunded: boolean;
}

/**
 * Admin Request to process a refund.
 * Mirrors C#: Application.DTOs.Payment.RefundRequestDto
 */
export interface IRefundRequest {
  paymentId: number; // Internal DB ID
  reason: string; // Min 10 chars
}

/**
 * Result of a refund operation.
 * Mirrors C#: Application.DTOs.Payment.RefundResultDto
 */
export interface IRefundResult {
  originalPaymentId: number;
  refundTransactionId: string; // Stripe Refund ID
  refundedAmount: number;
  status: string; // "refunded"
  timestamp: string;
}

/**
 * Filter criteria for searching payments (Admin).
 * Mirrors C#: Application.DTOs.Payment.PaymentFilterDto
 */
export interface IPaymentFilter {
  bookingId?: number | null;
  minAmount?: number | null;
  maxAmount?: number | null;
  startDate?: string | null; // ISO Date
  endDate?: string | null;   // ISO Date
  status?: string | null;    // e.g., "Succeeded", "Refunded"
  paymentMethod?: string | null;
}