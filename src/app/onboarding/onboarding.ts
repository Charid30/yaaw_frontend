// src/app/onboarding/onboarding.ts
import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ShopService } from '../shop/shop.service';
import { CommerceType, CreateShopPayload } from '../shop/shop.model';

interface CommerceTypeOption {
  key:            CommerceType;
  label:          string;
  desc:           string;
  icon:           string;
  defaultModules: { stock: boolean; commandes: boolean; rapports: boolean };
}

interface WizardStep { n: number; label: string; }

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
})
export class OnboardingComponent {
  currentStep = signal(1);
  loading     = signal(false);
  errorMsg    = signal('');

  readonly currentYear = new Date().getFullYear();

  form = {
    type_commerce: '' as CommerceType | '',
    nom:           '',
    devise:        'FCFA',
    tva_enabled:   false,
    tva_rate:      18,
    modules:       { stock: true, commandes: false, rapports: true },
  };

  readonly steps: WizardStep[] = [
    { n: 1, label: 'Commerce' },
    { n: 2, label: 'Boutique'  },
    { n: 3, label: 'Modules'   },
    { n: 4, label: 'Prêt !'    },
  ];

  readonly commerceTypes: CommerceTypeOption[] = [
    {
      key:            'boutique',
      label:          'Boutique',
      desc:           'Vêtements, épicerie, électronique, quincaillerie…',
      icon:           '🛍️',
      defaultModules: { stock: true, commandes: false, rapports: true },
    },
    {
      key:            'restaurant',
      label:          'Restaurant / Café',
      desc:           'Menus, tables, commandes, livraisons…',
      icon:           '🍽️',
      defaultModules: { stock: true, commandes: true, rapports: true },
    },
    {
      key:            'pharmacie',
      label:          'Pharmacie',
      desc:           'Médicaments, parapharmacie, ordonnances…',
      icon:           '💊',
      defaultModules: { stock: true, commandes: false, rapports: true },
    },
    {
      key:            'cave',
      label:          'Cave / Bar',
      desc:           'Boissons, alcools, snacks, carte de boissons…',
      icon:           '🍷',
      defaultModules: { stock: true, commandes: true, rapports: true },
    },
  ];

  readonly devises = ['FCFA', 'EUR', 'USD', 'GHS', 'NGN'];

  readonly selectedTypeOption = computed(() =>
    this.commerceTypes.find((c) => c.key === this.form.type_commerce) ?? null
  );

  constructor(private shopService: ShopService, private router: Router) {}

  // ── Actions ──────────────────────────────────────────────────

  selectType(type: CommerceType): void {
    this.form.type_commerce = type;
    const opt = this.commerceTypes.find((c) => c.key === type);
    if (opt) this.form.modules = { ...opt.defaultModules };
  }

  canProceed(): boolean {
    switch (this.currentStep()) {
      case 1: return !!this.form.type_commerce;
      case 2: return this.form.nom.trim().length >= 2;
      case 3: return true;
      default: return true;
    }
  }

  nextStep(): void {
    if (!this.canProceed() || this.currentStep() >= 4) return;
    this.errorMsg.set('');
    this.currentStep.update((s) => s + 1);
  }

  prevStep(): void {
    if (this.currentStep() > 1) this.currentStep.update((s) => s - 1);
  }

  submit(): void {
    if (this.loading()) return;
    this.errorMsg.set('');
    this.loading.set(true);

    const payload: CreateShopPayload = {
      nom:           this.form.nom.trim(),
      type_commerce: this.form.type_commerce as CommerceType,
      devise:        this.form.devise,
      tva_enabled:   this.form.tva_enabled,
      tva_rate:      this.form.tva_rate,
      modules:       { ...this.form.modules },
    };

    this.shopService.createShop(payload).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: HttpErrorResponse) => {
        this.errorMsg.set(err.error?.message || 'Erreur lors de la configuration.');
        this.loading.set(false);
      },
    });
  }

  // ── Helpers CSS ──────────────────────────────────────────────

  getStepCircleClass(n: number): string {
    if (this.currentStep() > n) {
      return 'bg-indigo-600 text-white ring-2 ring-indigo-200 dark:ring-indigo-900';
    }
    if (this.currentStep() === n) {
      return 'bg-indigo-600 text-white shadow-md shadow-indigo-300 dark:shadow-indigo-900';
    }
    return 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500';
  }

  getStepLabelClass(n: number): string {
    return this.currentStep() >= n
      ? 'text-indigo-600 font-semibold dark:text-indigo-400'
      : 'text-slate-400 dark:text-slate-500';
  }

  getTypeCardClass(key: string): string {
    const base =
      'flex flex-col items-center text-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 focus:outline-none w-full';
    return this.form.type_commerce === key
      ? `${base} border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 dark:bg-indigo-950/30 dark:border-indigo-400`
      : `${base} border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-indigo-600`;
  }
}
