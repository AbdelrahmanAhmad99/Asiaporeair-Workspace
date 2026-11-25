
import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthStateService } from '../auth/auth-state.service';
import { UserRole } from '../auth/roles.model';


export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as UserRole[] | undefined;

  if (!requiredRoles?.length) {
    return true;
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