
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { IAppConfig } from './app-config.model';
import { LoggerService } from '../logging/logger.service';

/**
 * @service AppConfigService
 * @description Loads and exposes runtime configuration from an external JSON file,
 * allowing environment-specific settings to be injected at deploy time without
 * requiring a new Angular build.
 *
 * **Wiring** — add to `app.config.ts`:
 * ```ts
 * import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
 * import { AppConfigService } from './core/config/app-config.service';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     {
 *       provide:  APP_INITIALIZER,
 *       useFactory: (cfg: AppConfigService) => () => cfg.load(),
 *       deps:    [AppConfigService],
 *       multi:   true
 *     },
 *     // ... other providers
 *   ]
 * };
 * ```
 *
 * **Usage** anywhere in the app:
 * ```ts
 * const config = inject(AppConfigService);
 * const url = config.get('apiUrl');
 * const ff  = config.getFeatureFlag('loyaltyEnabled');
 * ```
 */
@Injectable({ providedIn: 'root' })
export class AppConfigService {

  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);

  /** Resolved configuration object — `null` until `load()` completes. */
  private _config: IAppConfig | null = null;

  /** Path to the external config file in the `assets/` folder. */
  private readonly CONFIG_PATH = 'assets/config.json';

  // ── Bootstrap ────────────────────────────────────────────────────────────────

  /**
   * Fetches and caches the external config file.
   * **Must** be called via `APP_INITIALIZER` so it resolves before the app renders.
   * @throws Error if the config file cannot be fetched or is malformed.
   */
  async load(): Promise<void> {
    try {
      this._config = await firstValueFrom(
        this.http.get<IAppConfig>(this.CONFIG_PATH)
      );
      this.logger.info('[AppConfig] Configuration loaded successfully.', {
        apiUrl: this._config.apiUrl,
        locales: this._config.supportedLocales
      });
    } catch (err) {
      this.logger.fatal(
        '[AppConfig] CRITICAL — Failed to load config.json. The application cannot start.',
        err
      );
      // Re-throw so Angular's APP_INITIALIZER rejects and displays an error boundary.
      throw new Error(`AppConfigService: Unable to load "${this.CONFIG_PATH}". Ensure the file exists and is valid JSON.`);
    }
  }

  // ── Accessors ─────────────────────────────────────────────────────────────────

  /**
   * Retrieves a top-level configuration value by key.
   * @throws Error if called before `load()` has resolved.
   */
  get<K extends keyof IAppConfig>(key: K): IAppConfig[K] {
    this.assertLoaded();
    return this._config![key];
  }

  /**
   * Retrieves the full configuration object.
   * @throws Error if called before `load()` has resolved.
   */
  getAll(): IAppConfig {
    this.assertLoaded();
    return this._config!;
  }

  /**
   * Retrieves a specific feature flag value.
   * Returns `false` when the flag is absent (safe default).
   * @param flag  The feature flag key defined in `IFeatureFlags`.
   */
  getFeatureFlag(flag: string): boolean {
    this.assertLoaded();
    return this._config?.featureFlags[flag] ?? false;
  }

  // ── Guard ────────────────────────────────────────────────────────────────────

  private assertLoaded(): void {
    if (!this._config) {
      throw new Error(
        '[AppConfigService] Configuration has not been loaded. ' +
        'Ensure AppConfigService.load() is registered as an APP_INITIALIZER.'
      );
    }
  }
}