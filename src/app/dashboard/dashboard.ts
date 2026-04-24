import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
          Bonjour, {{ auth.user()?.prenom }} 👋
        </h1>
        <p class="mt-2 text-slate-500">Tableau de bord — à venir</p>
        <button (click)="auth.logout()" class="mt-6 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">
          Se déconnecter
        </button>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  constructor(public auth: AuthService) {}
}
