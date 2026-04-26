// src/app/admin/pages/overview/admin-overview.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Store, Users, TrendingUp, ShoppingCart, ArrowRight, RefreshCw } from 'lucide-angular';
import { AdminApiService, AdminOverview } from '../../admin.service';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './admin-overview.html',
  styleUrl:    './admin-overview.scss',
})
export class AdminOverviewComponent implements OnInit {
  loading = signal(true);
  data    = signal<AdminOverview | null>(null);

  readonly icons = { Store, Users, TrendingUp, ShoppingCart, ArrowRight, RefreshCw };

  readonly TYPE_LABELS: Partial<Record<string, string>> = {
    boutique:   'Boutique',
    restaurant: 'Restaurant',
    pharmacie:  'Pharmacie',
    cave:       'Cave',
  };

  readonly MODE_LABELS: Partial<Record<string, string>> = {
    especes:      'Espèces',
    orange_money: 'Orange Money',
    moov_money:   'Moov Money',
  };

  constructor(private adminApi: AdminApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.adminApi.getOverview().subscribe({
      next:  (res) => { this.data.set(res.data); this.loading.set(false); },
      error: ()    => this.loading.set(false),
    });
  }

  formatPrice(n: number): string {
    return n.toLocaleString('fr-FR') + ' FCFA';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
