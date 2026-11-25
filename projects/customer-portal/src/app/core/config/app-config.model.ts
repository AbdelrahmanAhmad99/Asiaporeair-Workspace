
/**
 * @interface IAppConfig
 * @description Strongly-typed schema for the external `config.json` file
 * loaded at runtime via `APP_INITIALIZER`.
 *
 * Place `config.json` inside `assets/` and deploy environment-specific
 * versions through CI/CD without rebuilding the Angular app.
 *
 * Example `assets/config.json`:
 * ```json
 * {
 *   "apiUrl":           "https://api.asiaporeair.com/api/v1",
 *   "stripePublicKey":  "pk_live_...",
 *   "featureFlags":     { "loyaltyEnabled": true, "seatMapV2": false },
 *   "sentryDsn":        "https://examplePublicKey@o0.ingest.sentry.io/...",
 *   "supportedLocales": ["en", "ar", "zh"],
 *   "defaultLocale":    "en"
 * }
 * ```
 */
export interface IAppConfig {
  /** Base URL for the .NET backend API (without trailing slash). */
  readonly apiUrl: string;

  /** Stripe publishable key for client-side payment flows. */
  readonly stripePublicKey: string;

  /** Feature flags — add new flags here and update `config.json` per environment. */
  readonly featureFlags: IFeatureFlags;

  /** Optional Sentry DSN for remote error monitoring. */
  readonly sentryDsn?: string;

  /** Locales the application officially supports. */
  readonly supportedLocales: string[];

  /** The locale used when no user preference is stored. */
  readonly defaultLocale: string;
}

/** @interface IFeatureFlags — Toggleable runtime feature switches. */
export interface IFeatureFlags {
  readonly loyaltyEnabled: boolean;
  readonly seatMapV2: boolean;
  [flag: string]: boolean;   // Allow forward-compatible flags without a type change
}