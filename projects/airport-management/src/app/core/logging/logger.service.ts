// =============================================================================
// logger.service.ts
// Asiaporeair | Core / Logging — Enterprise Error & Event Logger
// =============================================================================

import { Injectable, inject, PLATFORM_ID, isDevMode } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Severity levels mirroring standard syslog conventions. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/** Payload sent to the remote monitoring endpoint in production. */
interface RemoteLogPayload {
  level: LogLevel;
  message: string;
  context?: unknown;
  timestamp: string;
  userAgent: string;
  url: string;
}

/**
 * @service LoggerService
 * @description Enterprise-grade logging wrapper that:
 *  - In **development**: prints colour-coded, formatted messages to the browser console.
 *  - In **production**: suppresses debug/info noise and forwards `error` / `fatal`
 *    events to a remote monitoring endpoint (e.g., a .NET `/Logs/client` endpoint).
 *
 * Replace `console.log` calls throughout the codebase with this service.
 *
 * @example
 * ```ts
 * this.logger.info('User session restored');
 * this.logger.error('Payment failed', { orderId: '123', code: 402 });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {

  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Remote monitoring endpoint. Replace with real URL from AppConfigService when ready.
   * This endpoint receives `RemoteLogPayload` via POST.
   */
  private readonly REMOTE_LOG_URL = '/api/v1/Logs/client';

  private readonly isDev = isDevMode();
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // ── Console styles (Dev only) ───────────────────────────────────────────────
  private readonly styles: Record<LogLevel, string> = {
    debug: 'color:#718096; font-weight:400;',
    info: 'color:#3182CE; font-weight:600;',
    warn: 'color:#D97706; font-weight:600;',
    error: 'color:#E53E3E; font-weight:700;',
    fatal: 'color:#9B2C2C; font-weight:700; text-decoration:underline;'
  };

  // ── Public API ──────────────────────────────────────────────────────────────

  debug(message: string, context?: unknown): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: unknown): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: unknown): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: unknown): void {
    this.log('error', message, context);
  }

  /** Fatal errors — always sent to remote monitoring regardless of environment. */
  fatal(message: string, context?: unknown): void {
    this.log('fatal', message, context);
  }

  // ── Internal ────────────────────────────────────────────────────────────────

  private log(level: LogLevel, message: string, context?: unknown): void {
    if (this.isDev) {
      this.consoleLog(level, message, context);
    } else {
      // Suppress noise in production; only surface warnings and above
      if (level === 'warn') console.warn(`[Asiaporeair] ${message}`, context ?? '');
      if (level === 'error' || level === 'fatal') {
        console.error(`[Asiaporeair] ${message}`, context ?? '');
        this.sendToRemote(level, message, context);
      }
    }
  }

  private consoleLog(level: LogLevel, message: string, context?: unknown): void {
    const tag = `[Asiaporeair::${level.toUpperCase()}]`;
    const style = this.styles[level];
    const timestamp = new Date().toISOString();

    if (context !== undefined) {
      console.groupCollapsed(`%c${tag} ${message} — ${timestamp}`, style);
      console.log('Context:', context);
      console.groupEnd();
    } else {
      /* eslint-disable-next-line no-console */
      console.log(`%c${tag} ${message} — ${timestamp}`, style);
    }
  }

  private sendToRemote(level: LogLevel, message: string, context?: unknown): void {
    if (!this.isBrowser) return; // Never call HTTP from SSR for logging

    const payload: RemoteLogPayload = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Use native fetch to avoid circular dependency with HttpClient + Interceptors
    fetch(this.REMOTE_LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {
    });
  }
}