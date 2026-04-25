// src/app/auth/auth-guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth';

/** Protège les routes privées — redirige vers /auth/login si non connecté */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/auth/login']);
  return false;
};

/** Empêche l'accès aux pages login/register si déjà connecté */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return true;

  // ADMIN → back-office, sinon → dashboard gérant
  router.navigate([auth.isAdmin() ? '/admin' : '/dashboard']);
  return false;
};
