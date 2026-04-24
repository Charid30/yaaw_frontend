// src/app/auth/pages/register/register.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  nom = '';
  prenom = '';
  telephone = '';
  password = '';
  confirmPassword = '';
  showPassword = signal(false);
  showConfirm = signal(false);
  loading = signal(false);
  errorMsg = signal('');
  readonly currentYear = new Date().getFullYear();

  constructor(private auth: AuthService, private router: Router) {}

  togglePassword(): void { this.showPassword.update((v) => !v); }
  toggleConfirm(): void  { this.showConfirm.update((v) => !v); }

  onSubmit(): void {
    this.errorMsg.set('');

    if (!this.nom || !this.prenom || !this.telephone || !this.password || !this.confirmPassword) {
      this.errorMsg.set('Veuillez remplir tous les champs.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg.set('Les mots de passe ne correspondent pas.');
      return;
    }
    if (this.password.length < 8) {
      this.errorMsg.set('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    this.loading.set(true);
    this.auth.register({
      nom: this.nom,
      prenom: this.prenom,
      telephone: this.telephone,
      password: this.password,
      confirmPassword: this.confirmPassword,
    }).subscribe({
      next: () => this.router.navigate(['/onboarding']),
      error: (err: HttpErrorResponse) => {
        this.errorMsg.set(err.error?.message || 'Une erreur est survenue.');
        this.loading.set(false);
      },
    });
  }
}
