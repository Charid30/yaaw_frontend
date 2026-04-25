// src/app/onboarding/onboarding.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth';
import { ShopService } from '../shop/shop.service';

/**
 * Protège la route /onboarding :
 *  - Non connecté  → /auth/login
 *  - Boutique déjà configurée → /dashboard
 *  - Connecté sans boutique  → accès autorisé
 */
export const onboardingGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const shop   = inject(ShopService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/auth/login']);
  }

  // ADMIN → pas besoin de wizard boutique
  if (auth.isAdmin()) {
    return router.createUrlTree(['/dashboard']);
  }

  if (shop.hasShop()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
