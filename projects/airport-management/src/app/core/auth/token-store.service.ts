// =============================================================================
// token-store.service.ts
// Asiaporeair | Core / Auth — Secure JWT Token Storage Manager
// =============================================================================

import { Injectable, inject } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { LoggerService } from '../logging/logger.service';

/**
 * @service TokenStoreService
 * @description The single authoritative manager for reading, writing, and clearing
 * JWT access and refresh tokens.
 *
 * Design decisions:
 *  - Delegates all storage I/O to `StorageService` to inherit SSR-safety and
 *    automatic JSON serialization.
 *  - `localStorage` is used intentionally to survive browser tab refreshes.
 *    Sensitive sessions are invalidated server-side on logout.
 *  - Token keys are scoped with the `asiapore_` namespace to avoid collisions
 *    with third-party scripts that share the same origin.
 *
 * @example
 * ```ts
 * tokenStore.setToken(session.token);
 * tokenStore.setRefreshToken(session.refreshToken);
 * const jwt = tokenStore.getToken();
 * tokenStore.clearTokens();
 * ```
 */
@Injectable({ providedIn: 'root' })
export class TokenStoreService {

  private readonly storage = inject(StorageService);
  private readonly logger  = inject(LoggerService);

  // ── Storage key constants ───────────────────────────────────────────────────
  /** Namespaced key for the JWT access token. */
  private readonly ACCESS_TOKEN_KEY  = 'asiapore_auth_token';
  /** Namespaced key for the JWT refresh token. */
  private readonly REFRESH_TOKEN_KEY = 'asiapore_refresh_token';

  // ── Access Token ────────────────────────────────────────────────────────────

  /**
   * Persists the JWT access token to `localStorage`.
   * Silently skips empty/null strings to guard against storing invalid tokens.
   * @param token Raw JWT string.
   */
  setToken(token: string): void {
    if (!token?.trim()) {
      this.logger.warn('[TokenStore] Attempted to store an empty access token — skipped.');
      return;
    }
    this.storage.set<string>(this.ACCESS_TOKEN_KEY, token);
    this.logger.debug('[TokenStore] Access token stored.');
  }

  /**
   * Retrieves the stored JWT access token.
   * Returns `null` when no token exists (user is unauthenticated) or on SSR.
   */
  getToken(): string | null {
    return this.storage.get<string>(this.ACCESS_TOKEN_KEY);
  }

  // ── Refresh Token ───────────────────────────────────────────────────────────

  /**
   * Persists the refresh token to `localStorage`.
   * @param refreshToken Raw refresh token string.
   */
  setRefreshToken(refreshToken: string): void {
    if (!refreshToken?.trim()) {
      this.logger.warn('[TokenStore] Attempted to store an empty refresh token — skipped.');
      return;
    }
    this.storage.set<string>(this.REFRESH_TOKEN_KEY, refreshToken);
    this.logger.debug('[TokenStore] Refresh token stored.');
  }

  /**
   * Retrieves the stored refresh token.
   * Returns `null` if absent or on SSR.
   */
  getRefreshToken(): string | null {
    return this.storage.get<string>(this.REFRESH_TOKEN_KEY);
  }

  // ── Utilities ───────────────────────────────────────────────────────────────

  /**
   * Checks whether an access token is present in storage.
   * Does **not** validate token expiry — use `AuthStateService` for that.
   */
  hasToken(): boolean {
    return this.storage.has(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Atomically removes both the access token and refresh token from storage.
   * Called on logout or when session integrity cannot be guaranteed.
   */
  clearTokens(): void {
    this.storage.remove(this.ACCESS_TOKEN_KEY);
    this.storage.remove(this.REFRESH_TOKEN_KEY);
    this.logger.info('[TokenStore] All authentication tokens cleared.');
  }
}