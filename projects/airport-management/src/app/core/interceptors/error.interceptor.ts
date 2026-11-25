// =============================================================================
// error.interceptor.ts
// Asiaporeair | Core / Interceptors — Centralised HTTP Error Handler
// =============================================================================

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject }                               from '@angular/core';
import { catchError, throwError }               from 'rxjs';
import { ToastService }                         from '../services/toast.service';
import { LoggerService }                        from '../logging/logger.service';
import {
  IApiResponse,
  IApiValidationErrorResponse,
  isValidationError,
} from '../models/api-response.model';

/**
 * Surfaces API failures via toast + logger only.
 *
 * IMPORTANT: never navigate from here. A missing REST resource (404) or a
 * forbidden action (403) is not the same as a missing *page*. Navigating on
 * every API 404 used to hit the app wildcard (`**` → `/aoms` →
 * `operations-center`), which yanked the user back to the Operations Center
 * after a momentary transition to the destination module.
 *
 * Page-level access control belongs in route guards (`canMatch` / `canActivate`).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast  = inject(ToastService);
  const logger = inject(LoggerService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const message = extractMessage(err);

      logger.error(`[HTTP ${err.status}] ${req.url}`, { message, err });

      // Suppress toast noise for expected "endpoint not ready" probes that
      // feature gateways already degrade gracefully (e.g. ops-center snapshot).
      if (!shouldSuppressToast(err, req.url)) {
        toast.error(message, `Error ${err.status || ''}`);
      }

      return throwError(() => err);
    })
  );
};

// ── Error message extraction ──────────────────────────────────────────────────

function shouldSuppressToast(err: HttpErrorResponse, url: string): boolean {
  // Operations Center feed falls back to a local snapshot while the API is offline.
  // A toast on every poll/retry would spam the UI and used to accompany the bad redirect.
  if (err.status === 404 && url.includes('/operations-center/')) {
    return true;
  }
  return false;
}

function extractMessage(err: HttpErrorResponse): string {
  if (err.status === 0) {
    return 'Network error — please check your connection.';
  }

  const body = err.error as IApiResponse | IApiValidationErrorResponse | null;

  if (!body) {
    return `${err.status}: ${err.statusText || 'Unknown error'}`;
  }

  if (isValidationError(body as IApiResponse)) {
    const ve = body as IApiValidationErrorResponse;
    const flat = Array.isArray(ve.errors)
      ? ve.errors
      : Object.values(ve.errors).flat();
    return flat.join(' · ');
  }

  return body.message || `${err.status}: ${err.statusText}`;
}
