// =============================================================================
// localization.service.ts
// Asiaporeair | Core / i18n — Language & Direction Management
// =============================================================================

import { Injectable, inject, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser }  from '@angular/common';
import { StorageService }     from '../storage/storage.service';
import { LoggerService }      from '../logging/logger.service';

export type SupportedLocale = 'en' | 'ar' | 'zh' | 'fr' | 'de' | string;
export type TextDirection    = 'ltr' | 'rtl';

/** Locales that require right-to-left document direction. */
const RTL_LOCALES: Set<SupportedLocale> = new Set(['ar', 'fa', 'ur', 'he']);

const LOCALE_STORAGE_KEY = 'asiapore_locale';
const DEFAULT_LOCALE: SupportedLocale = 'en';

/**
 * Manages the application's active locale and document text direction.
 *
 * Features:
 *  - Persists locale preference via `StorageService` (SSR-safe).
 *  - Automatically applies `dir` attribute to `<html>` on locale change.
 *  - Exposes reactive signals for components and interceptors to consume.
 */
@Injectable({ providedIn: 'root' })
export class LocalizationService {

  private readonly storage    = inject(StorageService);
  private readonly logger     = inject(LoggerService);
  private readonly platformId = inject(PLATFORM_ID);

  // ── State ──────────────────────────────────────────────────────────────────

  private readonly _locale = signal<SupportedLocale>(this.resolveInitialLocale());

  /** The currently active locale string (e.g. `'en'`, `'ar'`). */
  readonly currentLocale = this._locale.asReadonly();

  /** The text direction derived from the active locale. */
  readonly direction = computed<TextDirection>(() =>
    RTL_LOCALES.has(this._locale()) ? 'rtl' : 'ltr'
  );

  /** `true` when the current direction is right-to-left. */
  readonly isRtl = computed(() => this.direction() === 'rtl');

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Switches the application locale, updates document direction, and persists the choice.
   * @param locale Target locale string (e.g. `'ar'`).
   */
  setLocale(locale: SupportedLocale): void {
    if (locale === this._locale()) return;

    this._locale.set(locale);
    this.storage.set(LOCALE_STORAGE_KEY, locale);
    this.applyDirectionToDocument();
    this.logger.info(`[Localization] Locale changed to "${locale}".`);
  }

  // ── Bootstrap ──────────────────────────────────────────────────────────────

  private resolveInitialLocale(): SupportedLocale {
    const stored = this.storage.get<SupportedLocale>(LOCALE_STORAGE_KEY);
    return stored ?? this.getBrowserLocale() ?? DEFAULT_LOCALE;
  }

  private getBrowserLocale(): SupportedLocale | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const lang = navigator.language?.split('-')[0];
    return lang || null;
  }

  private applyDirectionToDocument(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    document.documentElement.setAttribute('dir', this.direction());
    document.documentElement.setAttribute('lang', this._locale());
  }
}