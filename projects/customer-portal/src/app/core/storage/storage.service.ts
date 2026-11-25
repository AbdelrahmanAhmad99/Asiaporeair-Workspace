import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoggerService } from '../logging/logger.service';

/** Selects the underlying browser storage API. */
export type StorageScope = 'local' | 'session';

/**
 * @service StorageService
 * @description A type-safe, SSR-aware wrapper over `localStorage` and `sessionStorage`.
 *
 * Key features:
 *  - **SSR Safety**: All storage calls are gated behind `isPlatformBrowser()`.
 *    No server crashes — calls silently no-op on Node.js.
 *  - **Automatic JSON serialization/deserialization** on every get/set.
 *  - **Type-safe generics** — `get<T>()` returns `T | null`.
 *  - **Error isolation** — malformed JSON returns `null` with a warning log.
 *
 * @example
 * ```ts
 * storageService.set('user-prefs', { lang: 'ar', theme: 'dark' });
 * const prefs = storageService.get<UserPrefs>('user-prefs');
 * storageService.remove('user-prefs');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class StorageService {

  private readonly platformId = inject(PLATFORM_ID);
  private readonly logger = inject(LoggerService);

  // ── Platform guard ──────────────────────────────────────────────────────────

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private resolveStorage(scope: StorageScope): Storage | null {
    if (!this.isBrowser) {
      this.logger.debug('[StorageService] Storage access skipped — SSR environment.');
      return null;
    }
    return scope === 'local' ? localStorage : sessionStorage;
  }

  // ── Write ───────────────────────────────────────────────────────────────────

  /**
   * Serializes and persists `value` under `key`.
   * @param key   Storage key.
   * @param value Any JSON-serializable value.
   * @param scope `'local'` (default) for persistent, `'session'` for tab-scoped storage.
   */
  set<T>(key: string, value: T, scope: StorageScope = 'local'): void {
    const storage = this.resolveStorage(scope);
    if (!storage) return;

    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (err) {
      this.logger.error(`[StorageService] Failed to write key "${key}":`, err);
    }
  }

  // ── Read ────────────────────────────────────────────────────────────────────

  /**
   * Retrieves and deserializes the value stored at `key`.
   * Returns `null` if the key is absent, the platform is SSR, or JSON parsing fails.
   * @param key   Storage key.
   * @param scope `'local'` (default) | `'session'`.
   */
  get<T>(key: string, scope: StorageScope = 'local'): T | null {
    const storage = this.resolveStorage(scope);
    if (!storage) return null;

    const raw = storage.getItem(key);
    if (raw === null) return null;

    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logger.warn(
        `[StorageService] Corrupt value for key "${key}". Clearing entry.`,
        { raw, err }
      );
      storage.removeItem(key); // Auto-heal corrupted entries
      return null;
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  /**
   * Removes a single entry from storage.
   * @param key   Storage key.
   * @param scope `'local'` (default) | `'session'`.
   */
  remove(key: string, scope: StorageScope = 'local'): void {
    this.resolveStorage(scope)?.removeItem(key);
  }

  // ── Utilities ───────────────────────────────────────────────────────────────

  /**
   * Checks whether a key has a stored value (non-null).
   * @param key   Storage key.
   * @param scope `'local'` (default) | `'session'`.
   */
  has(key: string, scope: StorageScope = 'local'): boolean {
    return this.resolveStorage(scope)?.getItem(key) !== null;
  }

  /**
   * Wipes **all** entries from the specified storage scope.
   * Use with care — typically only called on full logout.
   * @param scope `'local'` (default) | `'session'`.
   */
  clear(scope: StorageScope = 'local'): void {
    this.resolveStorage(scope)?.clear();
    this.logger.debug(`[StorageService] Cleared ${scope}Storage.`);
  }
}