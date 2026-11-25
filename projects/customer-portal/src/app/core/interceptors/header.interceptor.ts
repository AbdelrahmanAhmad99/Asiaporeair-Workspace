
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LocalizationService } from '../i18n/localization.service';

/**
 * Appends standard headers to every outgoing request:
 *  - `Accept-Language` — tells the .NET backend which locale to use for
 *    server-side error messages and localised content.
 *  - `X-Client-App`   — identifies the portal for server-side analytics.
 */
export const headerInterceptor: HttpInterceptorFn = (req, next) => {
  const localization = inject(LocalizationService);

  const enriched = req.clone({
    setHeaders: {
      'Accept-Language': localization.currentLocale(),
      'X-Client-App': 'asiaporeair-customer-portal',
    },
  });

  return next(enriched);
};