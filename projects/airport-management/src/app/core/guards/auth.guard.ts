
import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { AuthStateService } from '../auth/auth-state.service';
import { TokenStoreService } from '../auth/token-store.service';

/**
 * Blocks unauthenticated users from accessing protected routes.
 * Redirects to `/auth/login` on failure and clears any stale tokens.
 */
export const authGuard: CanActivateFn = () => {
  const authState = inject(AuthStateService);
  const tokenStore = inject(TokenStoreService);
  const router = inject(Router);

  if (authState.isAuthenticated()) {
    return true;
  }

  tokenStore.clearTokens();
  return router.createUrlTree(['/auth/login']);
};

/** Applies `authGuard` to child routes as well. */
export const authChildGuard: CanActivateChildFn = authGuard;