import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../state/auth.store';
import { hasAllPermissions } from '../utils/permission.util';

export const permissionGuard: CanActivateFn = (route) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const requiredPermissions = (route.data?.['permissions'] as string[] | undefined) ?? [];

  if (requiredPermissions.length === 0) {
    return true;
  }

  if (hasAllPermissions(authStore.permissions(), requiredPermissions)) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};
