import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/auth-guard';

export const routes: Routes = [
  // Redirection par défaut
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // Auth (publiques — redirige si déjà connecté)
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./auth/pages/login/login').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./auth/pages/register/register').then((m) => m.RegisterComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // Dashboard (protégé)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard').then((m) => m.DashboardComponent).catch(
        () => import('./auth/pages/login/login').then((m) => m.LoginComponent)
      ),
  },

  // Catch-all
  { path: '**', redirectTo: 'auth/login' },
];
