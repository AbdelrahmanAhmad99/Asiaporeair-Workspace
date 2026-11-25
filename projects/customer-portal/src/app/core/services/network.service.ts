import { Injectable, inject, signal, computed, DestroyRef, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ToastService } from './toast.service';
import { LoggerService } from '../logging/logger.service';


@Injectable({ providedIn: 'root' })
export class NetworkService {

  private readonly toast = inject(ToastService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  // ── State ──────────────────────────────────────────────────────────────────

  private readonly _isOnline = signal<boolean>(this.initialOnlineState());

  readonly isOnline = this._isOnline.asReadonly();

  readonly isOffline = computed(() => !this._isOnline());

  // ── Bootstrap ──────────────────────────────────────────────────────────────

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    const onOnline = () => this.handleOnline();
    const onOffline = () => this.handleOffline();

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('online', onOnline);
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