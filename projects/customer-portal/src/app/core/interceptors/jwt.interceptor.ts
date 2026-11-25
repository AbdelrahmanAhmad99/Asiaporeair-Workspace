
import {
  HttpInterceptorFn, HttpRequest, HttpHandlerFn,
  HttpEvent, HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenStoreService } from '../auth/token-store.service';
import { AuthStateService } from '../auth/auth-state.service';

/** URLs that must never receive an Authorization header. */
const AUTH_EXCLUDED_PATHS = ['/Auth/login', '/Auth/register', '/Auth/refresh-token'];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStore = inject(TokenStoreService);
  const authState = inject(AuthStateService);
  const router = inject(Router);

  const token = tokenStore.getToken();

  // Skip excluded auth endpoints or requests without a token
  if (!token || AUTH_EXCLUDED_PATHS.some(p => req.url.includes(p))) {
    return next(req);
  }

  return next(attachToken(req, token)).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        return handle401(req, next, authState, tokenStore, router);
      }
      return throwError(() => err);
    })
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function attachToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authState: AuthStateService,
  tokenStore: TokenStoreService,
  router: Router,
): Observable<HttpEvent<unknown>> {
  return authState.refreshToken().pipe(
    switchMap((newToken: string) => next(attachToken(req, newToken))),
    catchError(err => {
      authState.clearAuthState();
      tokenStore.clearTokens();
      router.navigate(['/auth/login']);
      return throwError(() => err);
    })
  );
}