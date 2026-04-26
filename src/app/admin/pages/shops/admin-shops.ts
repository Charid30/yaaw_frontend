// src/app/admin/pages/shops/admin-shops.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Store, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight, Check, X, AlertCircle } from 'lucide-angular';
import { AdminApiService, AdminShop } from '../../admin.service';

@Component({
  selector: 'app-admin-shops',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-shops.html',
  styleUrl:    './admin-shops.scss',
})
export class AdminShopsComponent implements OnInit {
  shops       = signal<AdminShop[]>([]);
  loading     = signal(true);
  searchQuery = signal('');
  currentPage = signal(1);
  totalPages  = signal(1);
  total       = signal(0);
  readonly limit = 15;

  updatingId = signal<string | null>(null);
  errorMsg   = signal('');

  readonly icons = { AlertCircle, Search, Store, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight, Check, X };

  readonly TYPE_COLORS: Partial<Record<string, string>> = {
    boutique:   'bg-indigo-900/40 text-indigo-300',
    restaurant: 'bg-amber-900/40 text-amber-300',
    pharmacie:  'bg-emerald-900/40 text-emerald-300',
    cave:       'bg-violet-900/40 text-violet-300',
  };

  constructor(private adminApi: AdminApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.adminApi.getShops({
      page: this.currentPage(), limit: this.limit,
      search: this.searchQuery() || undefined,
    }).subscribe({
      next: (res) => {
        this.shops.set(res.data.shops);
        this.total.set(res.data.pagination.total);
        this.totalPages.set(res.data.pagination.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(q: string): void {
    this.searchQuery.set(q);
    this.currentPage.set(1);
    this.load();
  }

  prevPage(): void { if (this.currentPage() > 1) { this.currentPage.update(p => p - 1); this.load(); } }
  nextPage(): void { if (this.currentPage() < this.totalPages()) { this.currentPage.update(p => p + 1); this.load(); } }

  toggleModule(shop: AdminShop, module: 'stock' | 'rapports'): void {
    this.updatingId.set(shop.id);
    this.errorMsg.set('');

    // S'assurer que shop.modules est un objet (pas une string résiduelle du cache)
    const safeModules: Record<string, boolean> =
      shop.modules && typeof shop.modules === 'object' && !Array.isArray(shop.modules)
        ? shop.modules as Record<string, boolean>
        : { stock: true, rapports: true, commandes: false };

    const newVal = !safeModules[module];

    // N'envoyer QUE la clé modifiée — le backend mergera avec les valeurs en base
    this.adminApi.updateShop(shop.id, { modules: { [module]: newVal } }).subscribe({
      next: (res) => {
        // Mettre à jour en local avec les modules retournés par le serveur (source de vérité)
        const raw = res?.data?.shop?.modules;
        const freshModules: AdminShop['modules'] = {
          stock:    raw?.['stock']    ?? safeModules['stock']    ?? true,
          rapports: raw?.['rapports'] ?? safeModules['rapports'] ?? true,
          ...(raw ?? {}),
          [module]: newVal,
        };
        this.shops.update(list =>
          list.map(s => s.id === shop.id ? { ...s, modules: freshModules } : s)
        );
        this.updatingId.set(null);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || `Impossible de modifier le module « ${module} ».`);
        this.updatingId.set(null);
      },
    });
  }

  formatPrice(n: number): string {
    return n.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }
}
