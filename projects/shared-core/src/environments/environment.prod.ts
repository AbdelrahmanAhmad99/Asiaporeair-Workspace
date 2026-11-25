

/**
 * @file environment.prod.ts
 * @description Configuration settings for the Live Production environment.
 * It optimizes for performance, connects to the live API, and uses live keys.
 */
export const environment = {

  production: true,
  apiUrl: 'https://api.asiaporeair.com/api',
  stripePublicKey: ' ',
  loggingLevel: 'error',
  appVersion: 'v1.0.0-prod'
};