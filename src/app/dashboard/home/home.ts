// src/app/dashboard/home/home.ts
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule, LucideIconData,
  TrendingUp, BarChart2, Package, AlertTriangle,
  ShoppingCart, Plus, RefreshCw, ArrowRight, Receipt,
  CreditCard, Banknote, Smartphone,
} from 'lucide-angular';
import { AuthService } from '../../auth/auth';
import { ShopService } from '../../shop/shop.service';
import { ReportService } from '../reports/report.service';
import { ReportKpis, RecentSale } from '../reports/report.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
  private auth          = inject(AuthService);
  private shopService   = inject(ShopService);
  private reportService = inject(ReportService);

  readonly user   = this.auth.user;
  readonly shop   = this.shopService.shop;
  readonly devise = computed(() => this.shopService.shop()?.devise ?? 'FCFA');

  kpis          = signal<ReportKpis | null>(null);
  recentSales   = signal<RecentSale[]>([]);
  loading       = signal(true);

  // ── Icônes exposées ──────────────────────────────────────────
  readonly icons = {
    TrendingUp, BarChart2, Package, AlertTriangle,
    ShoppingCart, Plus, RefreshCw, ArrowRight, Receipt,
    CreditCard, Banknote, Smartphone,
  };

  // ── KPI cards config ─────────────────────────────────────────
  readonly kpiCards = computed(() => {
    const k = this.kpis();
    const d = this.devise();
    return [
      {
        label:    "CA aujourd'hui",
        value:    k ? this.fmt(k.caAujourdhui) : '…',
        sub:      k ? `${k.ventesAujourdhui} vente(s)` : '',
        icon:     TrendingUp,
        color:    'indigo',
      },
      {
        label:    'CA ce mois',
        value:    k ? this.fmt(k.caMois) : '…',
        sub:      k ? `${k.ventesMois} vente(s)` : '',
        icon:     BarChart2,
        color:    'violet',
        gradient: true,
      },
      {
        label:    'Ticket moyen',
        value:    k ? this.fmt(k.ticketMoyen) : '…',
        sub:      'ce mois',
        icon:     Receipt,
        color:    'emerald',
      },
      {
        label:    'Total cumulé',
        value:    k ? this.fmt(k.caTotal) : '…',
        sub:      k ? `${k.ventesTotal} vente(s)` : '',
        icon:     TrendingUp,
        color:    'amber',
      },
    ];
  });

  readonly quickActions = computed(() => {
    const modules = this.shopService.shop()?.modules;
    const actions: { label: string; path: string; icon: LucideIconData; primary: boolean }[] = [
      { label: 'Nouvelle vente',    path: '/dashboard/sales',    icon: ShoppingCart, primary: true  },
      { label: 'Ajouter un produit', path: '/dashboard/products', icon: Plus,        primary: false },
    ];
    if (modules?.stock)    actions.push({ label: 'Gérer le stock',    path: '/dashboard/stock',   icon: Package,  primary: false });
    if (modules?.rapports) actions.push({ label: 'Voir les rapports', path: '/dashboard/reports', icon: BarChart2, primary: false });
    return actions;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.reportService.getKpis().subscribe({
      next: r => { this.kpis.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.reportService.getRecentSales(6).subscribe({
      next: r => this.recentSales.set(r.data),
    });
  }

  paymentIcon(mode: string): LucideIconData {
    if (mode === 'especes') return Banknote;
    return Smartphone;
  }

  paymentLabel(mode: string): string {
    if (mode === 'especes')      return 'Espèces';
    if (mode === 'orange_money') return 'Orange Money';
    if (mode === 'moov_money')   return 'Moov Money';
    return mode;
  }

  paymentColor(mode: string): string {
    if (mode === 'especes')      return '#10b981';
    if (mode === 'orange_money') return '#f97316';
    return '#3b82f6';
  }

  fmt(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M ' + this.devise();
    if (n >= 1_000)     return (n / 1_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' k ' + this.devise();
    return n.toLocaleString('fr-FR') + ' ' + this.devise();
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  }
}
