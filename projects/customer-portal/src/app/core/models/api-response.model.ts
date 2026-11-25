
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

  readonly statusCode: number;
  readonly message?: string | null;
  readonly data?: T | null;
}

// ── Specialised Error Response Shapes ────────────────────────────────────────

export interface IApiValidationErrorResponse extends IApiResponse<null> {

  readonly errors: string[] | Record<string, string[]>;
}


export interface IApiExceptionResponse extends IApiResponse<null> {
  /** Technical exception details (stack trace, inner message). */
  readonly details?: string | null;
}

// ── Type Guard Helpers ────────────────────────────────────────────────────────


export function isValidationError(
  res: IApiResponse
): res is IApiValidationErrorResponse {
  return res.statusCode === 400 && 'errors' in res;
}


export function isExceptionResponse(
  res: IApiResponse
): res is IApiExceptionResponse {
  return res.statusCode === 500 && 'details' in res;
}