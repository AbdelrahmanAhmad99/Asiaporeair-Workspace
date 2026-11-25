// =============================================================================
// loading.service.ts
// Asiaporeair | Core / Services — Global Loading State
// =============================================================================

import { Injectable, signal, computed, Signal } from '@angular/core';

/**
 * Tracks concurrent HTTP requests via a counter signal.
 * `isLoading` is `true` while any request is in flight.
 *
 * Components bind directly to `isLoading`:
 * ```html
 * @if (loadingService.isLoading()) { <app-spinner /> }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {

  private readonly _activeRequests = signal(0);

  readonly isLoading: Signal<boolean> = computed(() => this._activeRequests() > 0);

  /** Called by `loadingInterceptor` before a request is dispatched. */
  show(): void {
    this._activeRequests.update(n => n + 1);
  }

  /** Called by `loadingInterceptor` after a request completes (success or error). */
  hide(): void {
    this._activeRequests.update(n => Math.max(0, n - 1));
  }

  /** Resets the counter immediately — use for error recovery scenarios. */
  reset(): void {
    this._activeRequests.set(0);
  }
}