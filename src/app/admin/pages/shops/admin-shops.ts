// src/app/admin/pages/shops/admin-shops.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Store, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight, Check, X } from 'lucide-angular';
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

  readonly icons = { Search, Store, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight, Check, X };

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
    const modules = { ...shop.modules, [module]: !shop.modules[module] };
    this.adminApi.updateShop(shop.id, { modules }).subscribe({
      next: () => {
        this.shops.update(list =>
          list.map(s => s.id === shop.id ? { ...s, modules } : s)
        );
        this.updatingId.set(null);
      },
      error: () => this.updatingId.set(null),
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
