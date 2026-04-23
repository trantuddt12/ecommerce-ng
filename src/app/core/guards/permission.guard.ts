import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../state/auth.store';
import { hasAnyPermission } from '../utils/permission.util';

export const permissionGuard: CanActivateFn = (route) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const requiredPermissions = (route.data?.['permissions'] as string[] | undefined) ?? [];
  const requiredRoles = (route.data?.['roles'] as string[] | undefined) ?? [];

  if (requiredRoles.length > 0) {
    const currentRoles = new Set(authStore.roles().filter(Boolean));
    const hasRole = requiredRoles.some((role) => currentRoles.has(role));

    if (!hasRole) {
      return router.createUrlTree(['/forbidden']);
    }
  }

  if (requiredPermissions.length === 0) {
    return true;
  }

  if (hasAnyPermission(authStore.permissions(), requiredPermissions)) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};

