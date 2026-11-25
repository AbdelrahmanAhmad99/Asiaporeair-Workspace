import { inject } from '@angular/core';
import { Router, CanMatchFn, CanActivateFn, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthStateService } from './auth-state.service';
import { UserRole } from './roles.model';

/** Safe landing route inside the AOMS shell for staff who fail a module RBAC check. */
const AOMS_HOME = '/aoms/operations-center';

export const isAuthenticatedGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  if (!authState.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }
  return true;
};

/**
 * Functional guard factory that creates a CanMatch guard verifying the user
 * is authenticated and holds one of the allowed roles.
 *
 * On role denial we return a UrlTree to the staff home (Operations Center) or
 * the passenger portal — never to a non-existent path (those used to hit the
 * app wildcard and look like a "bounce back" to Operations Center).
 */
export function hasRole(allowedRoles: UserRole[]): CanMatchFn {
  return (_route: Route, _segments: UrlSegment[]) => {
    const authState = inject(AuthStateService);
    const router = inject(Router);

    if (!authState.isAuthenticated()) {
      return router.createUrlTree(['/auth/login']);
    }

    const currentRole = authState.userRole();
    if (currentRole && allowedRoles.includes(currentRole as UserRole)) {
      return true;
    }

    // Authenticated but insufficient role for this module.
    if (currentRole === UserRole.User) {
      return router.createUrlTree(['/flight-info/search']);
    }
    if (currentRole) {
      return router.createUrlTree([AOMS_HOME]);
    }

    return router.createUrlTree(['/auth/login']);
  };
}

/** Pre-configured role sets for AOMS Routing */

export const RoleGroups = {
  AnyEmployee: [UserRole.SuperAdmin, UserRole.Admin, UserRole.Supervisor, UserRole.Pilot, UserRole.Attendant],
  Operations: [UserRole.SuperAdmin, UserRole.Admin, UserRole.Supervisor, UserRole.Pilot],
  Management: [UserRole.SuperAdmin, UserRole.Admin, UserRole.Supervisor],
  Executive: [UserRole.SuperAdmin, UserRole.Admin]
};
