
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { LoggerService } from '../logging/logger.service';
import {
  IApiResponse,
  IApiValidationErrorResponse,
  isValidationError,
} from '../models/api-response.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const logger = inject(LoggerService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const message = extractMessage(err);

      logger.error(`[HTTP ${err.status}] ${req.url}`, { message, err });

      toast.error(message, `Error ${err.status || ''}`);

      switch (err.status) {
        case 403: router.navigate(['/access-denied']); break;
        case 404: router.navigate(['/not-found']); break;
      }

      return throwError(() => err);
    })
  );
};

// ── Error message extraction ──────────────────────────────────────────────────

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