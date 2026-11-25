/**
 * @file environment.ts
 * @description Configuration settings for the Local Development environment (ng serve).
 * It enables detailed logging, connects to localhost API, and uses test keys.
 */
export const environment = {
  production: false,
  apiUrl: ' ',
  stripePublicKey: ' ',
  loggingLevel: 'debug',
  appVersion: 'v1.0.0-dev'
};
