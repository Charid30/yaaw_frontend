// src/app/dashboard/settings/settings.ts
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  LucideAngularModule,
  Store, KeyRound, User, ShieldAlert, Save, Pencil, X, Eye, EyeOff,
  CheckCircle, AlertCircle, Layers, Archive, BarChart2,
} from 'lucide-angular';
import { AuthService } from '../../auth/auth';
import { ShopService } from '../../shop/shop.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './settings.html',
  styleUrl:    './settings.scss',
})
export class SettingsComponent implements OnInit {
  private auth        = inject(AuthService);
  private shopService = inject(ShopService);
  private http        = inject(HttpClient);

  readonly user = this.auth.user;
  readonly shop = this.shopService.shop;

  readonly icons = { CheckCircle, AlertCircle, Store, KeyRound, User, ShieldAlert, Save, Pencil, X, Eye, EyeOff, Layers, Archive, BarChart2 };

  // ── Section Boutique ──────────────────────────────────────────
  editingShop  = signal(false);
  savingShop   = signal(false);
  shopSuccess  = signal('');
  shopError    = signal('');
  shopForm = {
    nom:         '',
    devise:      'FCFA',
    tva_enabled: false,
    tva_rate:    18,
  };

  readonly DEVISES = ['FCFA', 'XOF', 'XAF', 'GNF', 'EUR', 'USD', 'MAD', 'DZD'];

  // ── Section Modules ───────────────────────────────────────────
  savingModules  = signal(false);
  modulesSuccess = signal('');
  modulesError   = signal('');
  modulesForm = {
    stock:    false,
    rapports: false,
  };

  // ── Section Mot de passe ──────────────────────────────────────
  savingPwd   = signal(false);
  pwdSuccess  = signal('');
  pwdError    = signal('');
  showOld     = signal(false);
  showNew     = signal(false);
  showConfirm = signal(false);
  pwdForm = {
    ancien_mot_de_passe:  '',
    nouveau_mot_de_passe: '',
    confirmation:         '',
  };

  ngOnInit(): void {
    const s = this.shop();
    if (s) {
      this.shopForm = {
        nom:         s.nom,
        devise:      s.devise,
        tva_enabled: s.tva_enabled,
        tva_rate:    s.tva_rate ?? 18,
      };
      this.modulesForm = {
        stock:    s.modules?.stock    ?? false,
        rapports: s.modules?.rapports ?? false,
      };
    }
  }

  // ── Boutique ──────────────────────────────────────────────────

  startEditShop(): void {
    const s = this.shop();
    if (s) {
      this.shopForm = {
        nom:         s.nom,
        devise:      s.devise,
        tva_enabled: s.tva_enabled,
        tva_rate:    s.tva_rate ?? 18,
      };
    }
    this.shopError.set('');
    this.editingShop.set(true);
  }

  cancelEditShop(): void { this.editingShop.set(false); }

  saveShop(): void {
    if (!this.shopForm.nom.trim()) {
      this.shopError.set('Le nom de la boutique est requis.');
      return;
    }
    this.savingShop.set(true);
    this.shopError.set('');
    this.shopService.updateShop(this.shopForm).subscribe({
      next: () => {
        this.savingShop.set(false);
        this.editingShop.set(false);
        this.shopSuccess.set('Boutique mise à jour avec succès.');
        setTimeout(() => this.shopSuccess.set(''), 3500);
      },
      error: (err: HttpErrorResponse) => {
        this.shopError.set(err.error?.message || 'Une erreur est survenue.');
        this.savingShop.set(false);
      },
    });
  }

  // ── Modules ───────────────────────────────────────────────────

  saveModules(): void {
    this.savingModules.set(true);
    this.modulesError.set('');
    const current = this.shop()?.modules;
    this.shopService.updateShop({
      modules: {
        stock:     this.modulesForm.stock,
        rapports:  this.modulesForm.rapports,
        commandes: current?.commandes ?? false,
      },
    }).subscribe({
      next: () => {
        this.savingModules.set(false);
        this.modulesSuccess.set('Fonctionnalités mises à jour.');
        setTimeout(() => this.modulesSuccess.set(''), 3500);
      },
      error: (err: HttpErrorResponse) => {
        this.modulesError.set(err.error?.message || 'Une erreur est survenue.');
        this.savingModules.set(false);
      },
    });
  }

  // ── Mot de passe ──────────────────────────────────────────────

  changePassword(): void {
    const { ancien_mot_de_passe, nouveau_mot_de_passe, confirmation } = this.pwdForm;
    if (!ancien_mot_de_passe || !nouveau_mot_de_passe || !confirmation) {
      this.pwdError.set('Veuillez remplir tous les champs.');
      return;
    }
    if (nouveau_mot_de_passe.length < 6) {
      this.pwdError.set('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (nouveau_mot_de_passe !== confirmation) {
      this.pwdError.set('Les mots de passe ne correspondent pas.');
      return;
    }
    this.savingPwd.set(true);
    this.pwdError.set('');
    this.http.patch(`${environment.apiUrl}/auth/password`, {
      ancien_mot_de_passe,
      nouveau_mot_de_passe,
    }).subscribe({
      next: () => {
        this.savingPwd.set(false);
        this.pwdForm = { ancien_mot_de_passe: '', nouveau_mot_de_passe: '', confirmation: '' };
        this.pwdSuccess.set('Mot de passe modifié avec succès.');
        setTimeout(() => this.pwdSuccess.set(''), 3500);
      },
      error: (err: HttpErrorResponse) => {
        this.pwdError.set(err.error?.message || 'Une erreur est survenue.');
        this.savingPwd.set(false);
      },
    });
  }

  logout(): void { this.auth.logout(); }
}
