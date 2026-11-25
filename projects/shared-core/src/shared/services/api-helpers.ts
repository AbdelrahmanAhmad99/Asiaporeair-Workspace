import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Logs outgoing API requests for debugging.
 */
export function logApiRequest(serviceName: string, method: string, url: string, payload?: any): void {
  if (!environment.production) {
    console.groupCollapsed(`[${serviceName}] Request: ${method}`);
    console.log('URL:', url);
    if (payload) console.log('Payload:', payload);
    console.groupEnd();
  }
}

/**
 * Logs incoming API responses for debugging.
 */
export function logApiResponse(serviceName: string, method: string, response: any): void {
  if (!environment.production) {
    console.groupCollapsed(`[${serviceName}] Response: ${method}`);
    console.log('Status:', response?.statusCode);
    console.log('Data:', response?.data);
    console.groupEnd();
  }
}

/**
 * Centralized per-method error handling.
 * Logs the error aggressively and re-throws it for the component/interceptor.
 */
export function handleApiError(serviceName: string, method: string, error: HttpErrorResponse): Observable<never> {
  const timestamp = new Date().toISOString();

  // Verbose Error Logging
  console.error(`--- [${serviceName}] Error in ${method} at ${timestamp} ---`);
  console.error(`Status: ${error.status} (${error.statusText})`);
  console.error(`URL: ${error.url}`);

  if (error.error && error.error.message) {
    console.error(`Backend Message: ${error.error.message}`);
  }

  if (error.error && error.error.errors) {
    console.error('Validation Errors:', error.error.errors);
  }

  console.error('Full Error Object:', error);
  console.error('---------------------------------------------------');

  // Return the error to the subscriber
  return throwError(() => error);
}
