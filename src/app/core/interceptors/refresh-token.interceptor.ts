import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { AuthService } from '../services/auth.service';
import { KeycloakAuthService } from '../services/keycloak-auth.service';
import { SessionService } from '../services/session.service';
import { APP_CONFIG } from '../tokens/app-config.token';
import { isAppApiRequest } from '../utils/api-request.util';

export const refreshTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const keycloakAuthService = inject(KeycloakAuthService);
  const sessionService = inject(SessionService);
  const router = inject(Router);
  const config = inject(APP_CONFIG);

  const isAuthRefreshRequest = request.url.includes(API_ENDPOINTS.auth.refresh);
  const isPublicAuthRequest = request.url.includes(API_ENDPOINTS.auth.login)
    || request.url.includes(API_ENDPOINTS.auth.register)
    || request.url.includes(API_ENDPOINTS.auth.sendOtp)
    || request.url.includes(API_ENDPOINTS.auth.verifyOtp)
    || request.url.includes(API_ENDPOINTS.auth.verifyEmail)
    || request.url.includes(API_ENDPOINTS.auth.logout);

  // A 401 from a third party (Keycloak's own token endpoint, above all) says nothing about our
  // session, so it must never kick off a refresh-and-retry cycle.
  if (!isAppApiRequest(request.url, config) || isAuthRefreshRequest || isPublicAuthRequest) {
    return next(request);
  }

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || request.headers.has('x-refresh-attempt')) {
        return throwError(() => error);
      }

      // Keycloak sessions renew against Keycloak with its refresh token; in-house sessions use the
      // cookie-backed /auth/refresh endpoint. Choosing the wrong one logs the user straight out.
      const refresh$ = sessionService.getAuthProvider() === 'keycloak'
        ? keycloakAuthService.refresh()
        : authService.refresh();

      return refresh$.pipe(
        switchMap(() =>
          next(
            request.clone({
              setHeaders: {
                'x-refresh-attempt': 'true',
              },
            }),
          ),
        ),
        catchError((refreshError) => {
          sessionService.clearSession();
          void router.navigate(['/auth/login']);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
