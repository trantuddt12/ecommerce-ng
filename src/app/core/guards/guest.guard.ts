import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../state/auth.store';
import { PostLoginRouteService } from '../services/post-login-route.service';

export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const postLoginRouteService = inject(PostLoginRouteService);

  if (!authStore.isAuthenticated()) {
    return true;
  }

  return router.parseUrl(postLoginRouteService.getDefaultRoute());
};
