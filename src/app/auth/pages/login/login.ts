// src/app/auth/pages/login/login.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  telephone = '';
  password = '';
  showPassword = signal(false);
  loading = signal(false);
  errorMsg = signal('');
  readonly currentYear = new Date().getFullYear();

  constructor(private auth: AuthService, private router: Router) {}

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    this.errorMsg.set('');
    if (!this.telephone || !this.password) {
      this.errorMsg.set('Veuillez remplir tous les champs.');
      return;
    }

    this.loading.set(true);
    this.auth.login({ telephone: this.telephone, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: HttpErrorResponse) => {
        this.errorMsg.set(err.error?.message || 'Une erreur est survenue.');
        this.loading.set(false);
      },
    });
  }
}
