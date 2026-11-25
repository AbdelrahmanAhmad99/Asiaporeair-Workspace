
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * Increments the loading counter before each request and decrements it
 * on completion (success or error), keeping the global spinner in sync
 * with the true number of in-flight requests.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  loading.show();

  return next(req).pipe(finalize(() => loading.hide()));
};