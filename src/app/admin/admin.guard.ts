// src/app/admin/admin.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth';

/** Protège les routes /admin — redirige si non ADMIN */
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }
  if (!auth.isAdmin()) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};
