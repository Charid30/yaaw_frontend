// src/app/auth/auth-interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('yaahw_token');

  // Attacher le token JWT si présent
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // Purger la session locale
        localStorage.removeItem('yaahw_token');
        localStorage.removeItem('yaahw_user');
        localStorage.removeItem('yaahw_shop');
        // Rediriger vers login avec un flag pour afficher le message de session expirée
        const currentUrl = router.url;
        const isAuthRoute = currentUrl.startsWith('/auth');
        if (!isAuthRoute) {
          router.navigate(['/auth/login'], { queryParams: { expired: '1' } });
        }
      }
      return throwError(() => err);
    })
  );
};
