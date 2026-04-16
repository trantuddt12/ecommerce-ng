import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_CONFIG } from '../tokens/app-config.token';

export const credentialsInterceptor: HttpInterceptorFn = (request, next) => {
  const config = inject(APP_CONFIG);
  const shouldAttachCredentials = [config.apiBaseUrl, config.searchApiBaseUrl].some((baseUrl) =>
    request.url.startsWith(baseUrl),
  );

  if (!shouldAttachCredentials) {
    return next(request);
  }

  return next(request.clone({ withCredentials: true }));
};
