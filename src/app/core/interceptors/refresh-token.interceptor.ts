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

  if (request.url.includes(API_ENDPOINTS.auth.refresh)) {
    return next(request);
  }

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || request.headers.has('x-refresh-attempt')) {
        return throwError(() => error);
      }

      return authService.refresh().pipe(
        switchMap(() => currentUserService.loadCurrentUser()),
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
