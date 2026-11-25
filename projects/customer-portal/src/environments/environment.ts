/**
 * @file environment.ts
 * @description Configuration settings for the Local Development environment (ng serve).
 * It enables detailed logging, connects to localhost API, and uses test keys.
 */
export const environment = {
  // Flag indicating that the application is NOT running in production mode.
  // This enables Angular's internal development checks and features.
  production: false,

  // Base URL for the local ASP.NET Core Web API, usually running on Kestrel (https).
  // This should be used as a prefix for all HTTP requests to the backend.
  apiUrl: ' ',

  // Public key for the payment gateway (Stripe) in TEST mode.
  // This ensures all transactions during development are simulated.
  stripePublicKey: ' ',

  // Sets the logging level to 'debug' to display all logs (info, warn, error)
  // in the browser console for easy troubleshooting.
  loggingLevel: 'debug',

  // Optional: A unique version identifier for the build, useful for caching issues.
  appVersion: 'v1.0.0-dev'
};
