import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorMapperService } from '../services/error-mapper.service';
import { NotificationService } from '../services/notification.service';

export const errorMappingInterceptor: HttpInterceptorFn = (request, next) => {
  const errorMapper = inject(ErrorMapperService);
  const notifications = inject(NotificationService);

  return next(request).pipe(
    catchError((error) => {
      const appError = errorMapper.map(error);
      if (appError.type !== 'authentication') {
        notifications.error(appError.message);
      }
      return throwError(() => appError);
    }),
  );
};
