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
      // Rediriger vers login si 401 (token expiré / invalide)
      if (err.status === 401) {
        localStorage.removeItem('yaahw_token');
        localStorage.removeItem('yaahw_user');
        router.navigate(['/auth/login']);
      }
      return throwError(() => err);
    })
  );
};
