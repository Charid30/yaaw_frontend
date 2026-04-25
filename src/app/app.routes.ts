import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/auth-guard';
import { onboardingGuard } from './onboarding/onboarding.guard';
import { adminGuard } from './admin/admin.guard';

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

  // Onboarding — wizard de configuration boutique (post-inscription)
  {
    path: 'onboarding',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./onboarding/onboarding').then((m) => m.OnboardingComponent),
  },

  // Dashboard — layout avec sidebar + routes enfants
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/dashboard-layout').then((m) => m.DashboardLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/home/home').then((m) => m.HomeComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./dashboard/products/products').then((m) => m.ProductsComponent),
      },
      {
        path: 'sales',
        loadComponent: () => import('./dashboard/sales/sales').then(m => m.SalesComponent),
      },
      {
        path: 'stock',
        loadComponent: () => import('./dashboard/stock/stock').then(m => m.StockComponent),
      },
      {
        path: 'reports',
        loadComponent: () => import('./dashboard/reports/reports').then(m => m.ReportsComponent),
      },
      {
        path: 'history',
        loadComponent: () => import('./dashboard/history/history').then(m => m.HistoryComponent),
      },
      {
        path: 'customers',
        loadComponent: () => import('./dashboard/customers/customers').then(m => m.CustomersComponent),
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./dashboard/suppliers/suppliers').then(m => m.SuppliersComponent),
      },
      {
        path: 'employees',
        loadComponent: () => import('./dashboard/employees/employees').then(m => m.EmployeesComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./dashboard/settings/settings').then(m => m.SettingsComponent),
      },
    ],
  },

  // Back-office Admin — interface super-admin séparée
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./admin/admin-layout').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./admin/pages/overview/admin-overview').then(m => m.AdminOverviewComponent),
      },
      {
        path: 'shops',
        loadComponent: () =>
          import('./admin/pages/shops/admin-shops').then(m => m.AdminShopsComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./admin/pages/users/admin-users').then(m => m.AdminUsersComponent),
      },
      {
        path: 'activity',
        loadComponent: () =>
          import('./admin/pages/activity/admin-activity').then(m => m.AdminActivityComponent),
      },
    ],
  },

  // Catch-all
  { path: '**', redirectTo: 'auth/login' },
];
