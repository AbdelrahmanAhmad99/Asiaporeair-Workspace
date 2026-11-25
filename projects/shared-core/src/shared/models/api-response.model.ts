// src/app/core/models/api-response.model.ts

/**
 * @interface IApiResponse<T>
 * @description Base wrapper for all successful responses and non-validation errors (404, 500).
 * Mirrors C#: ApiResponse.cs
 */
export interface IApiResponse<T = any> {
  /** The HTTP status code (e.g., 200, 404, 500). */
  statusCode: number;

  /** A user-friendly message, especially for errors. */
  message?: string | null;

  /** The actual data payload for successful requests. */
  data?: T | null;
}

/**
 * @interface IApiValidationErrorResponse
 * @description Used for HTTP 400 Bad Request responses with model state validation errors.
 * Mirrors C#: ApiValidationErrorResponse.cs
 */
export interface IApiValidationErrorResponse extends IApiResponse {
  /** A collection of specific validation errors (e.g., "Email is required"). */
  errors: string[];
}

/**
 * @interface IApiExceptionResponse
 * @description Used for detailed exceptions (e.g., HTTP 500 in Development mode).
 * Mirrors C#: ApiExceptionResponse.cs
 */
export interface IApiExceptionResponse extends IApiResponse {
  /** Detailed technical information about the exception (e.g., stack trace). */
  details?: string | null;
}