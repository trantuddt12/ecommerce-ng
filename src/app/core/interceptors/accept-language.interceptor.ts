import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

export const acceptLanguageInterceptor: HttpInterceptorFn = (request, next) => {
  const languageService = inject(LanguageService);

  if (request.headers.has('Accept-Language')) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: {
        'Accept-Language': languageService.getCurrentLanguage(),
      },
    }),
  );
};
