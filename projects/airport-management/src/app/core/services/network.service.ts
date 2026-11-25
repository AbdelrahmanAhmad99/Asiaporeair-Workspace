// =============================================================================
// network.service.ts
// Asiaporeair | Core / Services — Network Connectivity Monitor
// =============================================================================

import { Injectable, inject, signal, computed, DestroyRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ToastService }      from './toast.service';
import { LoggerService }     from '../logging/logger.service';

/**
 * Monitors the browser's online/offline status using the native `window` events.
 * Exposes reactive signals so components can respond without polling.
 *
 * Event listeners are automatically removed when the service is destroyed
 * via Angular's `DestroyRef` — no memory leaks.
 *
 * @example
 * ```html
 * @if (!networkService.isOnline()) {
 *   <app-offline-banner />
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class NetworkService {

  private readonly toast      = inject(ToastService);
  private readonly logger     = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  // ── State ──────────────────────────────────────────────────────────────────

  private readonly _isOnline = signal<boolean>(this.initialOnlineState());

  /** `true` when the browser reports an active network connection. */
  readonly isOnline  = this._isOnline.asReadonly();

  /** `true` when the browser is offline. */
  readonly isOffline = computed(() => !this._isOnline());

  // ── Bootstrap ──────────────────────────────────────────────────────────────

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    const onOnline  = () => this.handleOnline();
    const onOffline = () => this.handleOffline();

    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);

    // Clean up when Angular destroys this service
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    });
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  private handleOnline(): void {
    this._isOnline.set(true);
    this.toast.success('Connection restored. You are back online.', 'Connected');
    this.logger.info('[Network] Connection restored.');
  }

  private handleOffline(): void {
    this._isOnline.set(false);
    this.toast.warn(
      'You appear to be offline. Some features may be unavailable.',
      'No Connection',
      'long',
    );
    this.logger.warn('[Network] Connection lost.');
  }

  private initialOnlineState(): boolean {
    if (!isPlatformBrowser(this.platformId)) return true;
    return navigator.onLine;
  }
}