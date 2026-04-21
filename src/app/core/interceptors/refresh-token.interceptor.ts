import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { AuthService } from '../services/auth.service';
import { CurrentUserService } from '../services/current-user.service';
import { SessionService } from '../services/session.service';

export const refreshTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const currentUserService = inject(CurrentUserService);
  const sessionService = inject(SessionService);
  const router = inject(Router);

  const isAuthRefreshRequest = request.url.includes(API_ENDPOINTS.auth.refresh);
  const isPublicAuthRequest = request.url.includes(API_ENDPOINTS.auth.login)
    || request.url.includes(API_ENDPOINTS.auth.sendOtp)
    || request.url.includes(API_ENDPOINTS.auth.sendOtpRegister)
    || request.url.includes(API_ENDPOINTS.auth.verifyOtp)
    || request.url.includes(API_ENDPOINTS.auth.logout);

  if (isAuthRefreshRequest || isPublicAuthRequest) {
    return next(request);
  }

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || request.headers.has('x-refresh-attempt')) {
        return throwError(() => error);
      }

      return authService.refresh().pipe(
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
