import {
  Injectable, computed, signal, WritableSignal, inject
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { switchMap, catchError, tap, finalize } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

import { TokenStoreService } from './token-store.service';
import { LoggerService } from '../logging/logger.service';
import { UserRole } from './roles.model';
import { AnyUserProfile } from '../models/user.model';
import { JwtClaims, AuthSessionResponse, RefreshTokenRequest } from './session.model';
import { IApiResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthStateService {

  // ── Dependencies ─────────────────────────────────────────────────────────────
  private readonly tokenStore = inject(TokenStoreService);
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);

  // ── Internal Signals (writable — private) ────────────────────────────────────

  private readonly _currentUser: WritableSignal<AnyUserProfile | null> = signal(null);
  private readonly _userRole: WritableSignal<UserRole | null> = signal(null);
  private readonly _isAuthenticated: WritableSignal<boolean> = signal(false);

  // ── Public Read-Only Signals ─────────────────────────────────────────────────

  readonly currentUser = this._currentUser.asReadonly();

  readonly userRole = this._userRole.asReadonly();

  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  readonly isSuperAdmin = computed(() => this._userRole() === UserRole.SuperAdmin);

  readonly isEmployee = computed(() => {
    const role = this._userRole();
    return role !== null && role !== UserRole.User;
  });

  readonly displayName = computed(() => {
    const u = this._currentUser() as Record<string, unknown> | null;
    if (!u) return '';
    if (u['firstName'] && u['lastName']) return `${u['firstName']} ${u['lastName']}`;
    if (u['email']) return String(u['email']).split('@')[0];
    return 'Traveler';
  });

  // ── Token Refresh — BehaviorSubject for concurrent-request queuing ───────────

  private _isRefreshing = false;
  private readonly _refreshSubject$ = new BehaviorSubject<string | null>(null);

  constructor() {
    this.initializeFromStorage();
  }

  /**
   * Runs at app startup. Reads any persisted token and restores signal state
   * without making an API call if the token is still valid.
   */
  private initializeFromStorage(): void {
    const token = this.tokenStore.getToken();

    if (token && !this.isTokenExpired(token)) {
      try {
        const claims = this.decodeToken(token);
        this._isAuthenticated.set(true);
        const rawRole = Array.isArray(claims.role) ? claims.role[0] : claims.role;
        this._userRole.set(rawRole as UserRole);
        this.logger.info('[AuthState] Session restored from stored token.', { role: rawRole });
      } catch {
        this.logger.warn('[AuthState] Stored token is malformed. Clearing session.');
        this.clearAuthState();
        this.tokenStore.clearTokens();
      }
    } else {
      if (token) {
        this.logger.info('[AuthState] Stored token is expired. Clearing session.');
        this.tokenStore.clearTokens();
      }
      this.clearAuthState();
    }
  }

  // ── State Actions (Write operations — called by AuthService) ─────────────────

  setAuthState(userProfile: AnyUserProfile): void {
    if (!userProfile) {
      this.logger.warn('[AuthState] setAuthState called with a null profile — ignored.');
      return;
    }
    this._currentUser.set(userProfile);
    this._userRole.set(userProfile.userType);
    this._isAuthenticated.set(true);
    this.logger.info('[AuthState] Auth state updated.', { role: userProfile.userType });
  }

  /**
   * Resets all authentication signals to unauthenticated defaults.
   * Called on logout or session expiry.
   * Does NOT clear tokens from storage — call `tokenStore.clearTokens()` separately.
   */
  clearAuthState(): void {
    this._currentUser.set(null);
    this._userRole.set(null);
    this._isAuthenticated.set(false);
    this.logger.info('[AuthState] Auth state cleared.');
  }

  // ── Token Refresh ─────────────────────────────────────────────────────────────

  /**
   * Initiates a silent token refresh using the stored refresh token.
   * Uses a `BehaviorSubject` pattern to queue concurrent requests during the
   * refresh window — preventing multiple simultaneous refresh calls.
   *
   * @returns Observable that emits the new access token string on success.
   */
  refreshToken(): Observable<string> {
    if (this._isRefreshing) {
      // Queue subsequent callers until the refresh completes
      return new Observable(observer => {
        this._refreshSubject$.subscribe({
          next: (token) => { if (token) { observer.next(token); observer.complete(); } },
          error: (err) => observer.error(err)
        });
      });
    }

    this._isRefreshing = true;
    this._refreshSubject$.next(null);

    const accessToken = this.tokenStore.getToken();
    const refreshToken = this.tokenStore.getRefreshToken();

    if (!accessToken || !refreshToken) {
      this._isRefreshing = false;
      return throwError(() => new Error('[AuthState] Refresh tokens unavailable.'));
    }

    const payload: RefreshTokenRequest = { token: accessToken, refreshToken };
    const url = `${environment.apiUrl}/Auth/refresh-token`;

    return this.http
      .post<IApiResponse<AuthSessionResponse>>(url, payload)
      .pipe(
        switchMap(response => {
          const session = response.data;
          if (!session?.token) {
            return throwError(() => new Error('[AuthState] Refresh response missing token.'));
          }
          this.tokenStore.setToken(session.token);
          this.tokenStore.setRefreshToken(session.refreshToken);
          if (session.userProfile) {
            this.setAuthState(session.userProfile);
          }
          this._refreshSubject$.next(session.token);
          this.logger.info('[AuthState] Token refreshed successfully.');
          return [session.token];
        }),
        catchError(err => {
          this._refreshSubject$.error(err);
          this.logger.error('[AuthState] Token refresh failed. Clearing session.', err);
          this.clearAuthState();
          this.tokenStore.clearTokens();
          return throwError(() => err);
        }),
        finalize(() => {
          this._isRefreshing = false;
        })
      );
  }

  // ── JWT Helpers ───────────────────────────────────────────────────────────────

  /** Decodes a raw JWT string into strongly-typed claims. */
  decodeToken(token: string): JwtClaims {
    return jwtDecode<JwtClaims>(token);
  }

  /** Returns `true` if the token's `exp` claim is in the past. */
  isTokenExpired(token: string): boolean {
    try {
      const { exp } = this.decodeToken(token);
      if (!exp) return true;
      // exp is in seconds; Date.now() is in ms
      return exp < Math.floor(Date.now() / 1000);
    } catch {
      return true;
    }
  }
}