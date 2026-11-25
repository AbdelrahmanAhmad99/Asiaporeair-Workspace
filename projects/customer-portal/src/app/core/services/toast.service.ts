import { Injectable, signal, Signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warn';
export type ToastDuration = 'short' | 'long';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration: number;
}

const DURATIONS: Record<ToastDuration, number> = {
  short: 3_000,
  long: 7_000,
};

/**
 * Centralised notification service built entirely on Angular Signals —
 * no Angular Material dependency required.
 *
 * The `ToastContainerComponent` reads the `toasts` signal and renders messages.
 * Toasts auto-dismiss after their duration expires.
 *
 * @example
 * ```ts
 * toast.success('Booking confirmed!');
 * toast.error('Payment failed — please retry.', 'Payment Error', 'long');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ToastService {

  private readonly _toasts = signal<ToastMessage[]>([]);

  /** Read-only list of active toasts for the container component. */
  readonly toasts: Signal<ToastMessage[]> = this._toasts.asReadonly();

  // ── Public API ─────────────────────────────────────────────────────────────

  success(message: string, title?: string, duration: ToastDuration = 'short'): void {
    this.push('success', message, title, duration);
  }

  error(message: string, title?: string, duration: ToastDuration = 'long'): void {
    this.push('error', message, title, duration);
  }

  info(message: string, title?: string, duration: ToastDuration = 'short'): void {
    this.push('info', message, title, duration);
  }

  warn(message: string, title?: string, duration: ToastDuration = 'short'): void {
    this.push('warn', message, title, duration);
  }

  /** Manually dismiss a toast by its id. */
  dismiss(id: string): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  /** Clear all active toasts. */
  clearAll(): void {
    this._toasts.set([]);
  }

  // ── Internal ───────────────────────────────────────────────────────────────

  private push(
    type: ToastType,
    message: string,
    title?: string,
    duration: ToastDuration = 'short',
  ): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const ms = DURATIONS[duration];
    const toast: ToastMessage = { id, type, message, title, duration: ms };

    this._toasts.update(list => [...list, toast]);

    setTimeout(() => this.dismiss(id), ms);
  }
}