import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';
import { APP_CONFIG } from '../tokens/app-config.token';
import { isAppApiRequest } from '../utils/api-request.util';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const sessionService = inject(SessionService);
  const config = inject(APP_CONFIG);
  const token = sessionService.getAccessToken();

  // The token is only ever meant for our own backend. Attaching it to another origin leaks it,
  // and Keycloak's token endpoint in particular rejects an unexpected Authorization header with
  // `invalid_client`, which would break the refresh flow.
  if (!token || request.headers.has('Authorization') || !isAppApiRequest(request.url, config)) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
