// =============================================================================
// role.guard.ts
// Asiaporeair | Core / Guards — Role-Based Access Control Guard
// =============================================================================

import { inject }                                    from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthStateService }                          from '../auth/auth-state.service';
import { UserRole }                                  from '../auth/roles.model';

/**
 * Grants access only when the authenticated user holds one of the roles listed
 * in `route.data['roles']`.
 *
 * Route configuration example:
 * ```ts
 * {
 *   path: 'operations',
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: [UserRole.Admin, UserRole.SuperAdmin] },
 * }
 * ```
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authState = inject(AuthStateService);
  const router    = inject(Router);

  const requiredRoles = route.data['roles'] as UserRole[] | undefined;

  if (!requiredRoles?.length) {
    return true; // No restriction defined — allow by default
  }

  const profile = authState.currentUser();

  if (!profile) {
    return router.createUrlTree(['/auth/login']);
  }

  if (requiredRoles.includes(profile.userType)) {
    return true;
  }

  return router.createUrlTree(['/access-denied']);
};