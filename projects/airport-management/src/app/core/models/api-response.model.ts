// =============================================================================
// api-response.model.ts
// Asiaporeair | Core / Models — Unified API Response Wrapper
// =============================================================================

/**
 * @interface IApiResponse<T>
 * @description Standard response envelope returned by every .NET API endpoint.
 * Mirrors C#: `ApiResponse<T>.cs`
 *
 * All `HttpClient` calls in feature services should type their responses as:
 * `HttpClient.post<IApiResponse<MyDto>>(url, body)`
 *
 * @example
 * ```ts
 * this.http.get<IApiResponse<IPassengerProfile>>('/Auth/profile/me')
 *   .pipe(map(res => res.data!))
 * ```
 */
export interface IApiResponse<T = void> {
  /**
   * HTTP status code mirrored in the response body for convenience.
   * (e.g., 200, 201, 400, 401, 404, 500)
   */
  readonly statusCode: number;

  /**
   * Human-readable message from the server.
   * Always present on errors; optionally present on success.
   */
  readonly message?: string | null;

  /**
   * The actual data payload for successful responses.
   * `null` on error responses or 204 No Content.
   */
  readonly data?: T | null;
}

// ── Specialised Error Response Shapes ────────────────────────────────────────

/**
 * @interface IApiValidationErrorResponse
 * @description Returned on `HTTP 400` when model validation fails in .NET.
 * The `errors` field maps field names to their error messages.
 * Mirrors C#: `ApiValidationErrorResponse.cs`
 */
export interface IApiValidationErrorResponse extends IApiResponse<null> {
  /**
   * Validation errors — may be:
   *  - `string[]`                    — flat list of messages.
   *  - `{ [field]: string[] }`       — field-keyed dictionary (ModelState).
   */
  readonly errors: string[] | Record<string, string[]>;
}


export interface IApiExceptionResponse extends IApiResponse<null> {
  /** Technical exception details (stack trace, inner message). */
  readonly details?: string | null;
}

// ── Type Guard Helpers ────────────────────────────────────────────────────────

/**
 * Type guard — narrows an `IApiResponse` to `IApiValidationErrorResponse`.
 */
export function isValidationError(
  res: IApiResponse
): res is IApiValidationErrorResponse {
  return res.statusCode === 400 && 'errors' in res;
}

/**
 * Type guard — narrows an `IApiResponse` to `IApiExceptionResponse`.
 */
export function isExceptionResponse(
  res: IApiResponse
): res is IApiExceptionResponse {
  return res.statusCode === 500 && 'details' in res;
}