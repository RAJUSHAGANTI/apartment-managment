import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenStorageService } from '../auth/token-storage.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = tokenStorage.getAccessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401 && !req.url.includes('/auth/')) {
        return authService.refreshToken().pipe(
          switchMap(res => {
            const retried = req.clone({ setHeaders: { Authorization: `Bearer ${res.data.accessToken}` } });
            return next(retried);
          }),
          catchError(() => {
            tokenStorage.clear();
            router.navigate(['/auth/login']);
            return throwError(() => err);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
