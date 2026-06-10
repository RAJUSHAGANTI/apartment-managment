import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 500) {
        notify.error('Server error. Please try again later.');
      } else if (err.status === 403) {
        notify.error('Access denied.');
      }
      return throwError(() => err);
    })
  );
};
