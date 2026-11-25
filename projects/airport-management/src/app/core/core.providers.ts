// =============================================================================
// core.providers.ts
// Asiaporeair | Core — Provider Registration Barrel
// =============================================================================

import {
  APP_INITIALIZER, EnvironmentProviders,
  makeEnvironmentProviders,
} from '@angular/core';
import { HTTP_INTERCEPTORS, withInterceptors, provideHttpClient } from '@angular/common/http';

import { AppConfigService } from './config/app-config.service';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';
import { headerInterceptor } from './interceptors/header.interceptor';

/** Registers all core services, the APP_INITIALIZER, and HTTP interceptors. */
export const coreProviders: EnvironmentProviders = makeEnvironmentProviders([
  // ── External config (must resolve before app renders) ──────────────────────
  {
    provide: APP_INITIALIZER,
    useFactory: (cfg: AppConfigService) => () => cfg.load(),
    deps: [AppConfigService],
    multi: true,
  },

  // ── HTTP client with functional interceptors (order matters) ───────────────
  provideHttpClient(
    withInterceptors([
      headerInterceptor,  // 1. Inject Accept-Language + X-Client-App headers
      jwtInterceptor,     // 2. Attach Bearer token; handle 401 refresh
      errorInterceptor,   // 3. Parse + display API errors
      loadingInterceptor, // 4. Toggle global loading state
    ])
  ),
]);