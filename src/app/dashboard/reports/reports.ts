// src/app/dashboard/reports/reports.ts
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule, LucideIconData,
  RefreshCw, TrendingUp, BarChart2, Receipt, Trophy,
  CreditCard, Banknote, Smartphone, ShoppingCart,
} from 'lucide-angular';
import { ReportService } from './report.service';
import { ShopService } from '../../shop/shop.service';
import { Download } from 'lucide-angular';
import {
  ReportKpis, CaDay, CaMonth, TopProduct, PaymentBreakdown, RecentSale, ReportPeriod,
} from './report.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './reports.html',
  styleUrl:    './reports.scss',
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private shopService   = inject(ShopService);

  readonly devise = computed(() => this.shopService.shop()?.devise ?? 'FCFA');

  kpis          = signal<ReportKpis | null>(null);
  caByDay       = signal<CaDay[]>([]);
  caByMonth     = signal<CaMonth[]>([]);
  topProducts   = signal<TopProduct[]>([]);
  payments      = signal<PaymentBreakdown[]>([]);
  recentSales   = signal<RecentSale[]>([]);

  loading       = signal(true);
  chartView     = signal<'day' | 'month'>('day');
  topPeriod     = signal<ReportPeriod>('month');

  readonly Math = Math;

  readonly icons = { RefreshCw, TrendingUp, BarChart2, Receipt, Trophy, CreditCard, Banknote, Smartphone, ShoppingCart, Download };

  readonly chartData = computed(() =>
    this.chartView() === 'day' ? this.caByDay() : this.caByMonth()
  );

  readonly chartMax = computed(() =>
    Math.max(...this.chartData().map(d => d.ca), 1)
  );

  readonly chartLabels = computed(() => {
    if (this.chartView() === 'day') {
      return this.caByDay().map(d => {
        const parts = d.date.split('-');
        return `${parts[2]}/${parts[1]}`;
      });
    }
    return this.caByMonth().map(d => {
      const [y, m] = d.mois.split('-');
      return new Date(+y, +m - 1).toLocaleString('fr-FR', { month: 'short' });
    });
  });

  readonly paymentConfig: Record<string, { label: string; color: string; bg: string; icon: LucideIconData }> = {
    especes:      { label: 'Espèces',      color: '#10b981', bg: '#d1fae5', icon: Banknote   },
    orange_money: { label: 'Orange Money', color: '#f97316', bg: '#ffedd5', icon: Smartphone },
    moov_money:   { label: 'Moov Money',   color: '#3b82f6', bg: '#dbeafe', icon: Smartphone },
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.reportService.getKpis().subscribe({
      next: r => { this.kpis.set(r.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.reportService.getCaByDay(30).subscribe({ next: r => this.caByDay.set(r.data) });
    this.reportService.getCaByMonth(12).subscribe({ next: r => this.caByMonth.set(r.data) });
    this.loadTopProducts();
    this.loadPayments();
    this.reportService.getRecentSales(8).subscribe({ next: r => this.recentSales.set(r.data) });
  }

  loadTopProducts(): void {
    this.reportService.getTopProducts(this.topPeriod(), 8).subscribe({ next: r => this.topProducts.set(r.data) });
  }

  loadPayments(): void {
    this.reportService.getPaymentBreakdown(this.topPeriod()).subscribe({ next: r => this.payments.set(r.data) });
  }

  onPeriodChange(p: ReportPeriod): void {
    this.topPeriod.set(p);
    this.loadTopProducts();
    this.loadPayments();
  }

  barHeight(ca: number): number {
    const max = this.chartMax();
    return max > 0 ? Math.round((ca / max) * 100) : 0;
  }

  formatPrice(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M ' + this.devise();
    if (n >= 1_000)     return (n / 1_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' k ' + this.devise();
    return n.toLocaleString('fr-FR') + ' ' + this.devise();
  }

  formatPriceFull(n: number): string {
    return n.toLocaleString('fr-FR') + ' ' + this.devise();
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  }

  paymentLabel(mode: string): string        { return this.paymentConfig[mode]?.label ?? mode; }
  paymentColor(mode: string): string        { return this.paymentConfig[mode]?.color ?? '#6366f1'; }
  paymentIcon(mode: string):  LucideIconData { return this.paymentConfig[mode]?.icon  ?? CreditCard; }

  topProductMax = computed(() =>
    Math.max(...this.topProducts().map(p => p.total_qte), 1)
  );

  exportPDF(): void {
    const kpis     = this.kpis();
    const devise   = this.devise();
    const shopName = this.shopService.shop()?.nom ?? 'Yaahw';
    const now      = new Date().toLocaleString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const fmt = (n: number) => n.toLocaleString('fr-FR') + ' ' + devise;

    const topRows = this.topProducts().map(p =>
      `<tr><td>${p.nom}</td><td style="text-align:right">${p.total_qte}</td><td style="text-align:right">${fmt(p.total_ca)}</td></tr>`
    ).join('');

    const payRows = this.payments().map(p =>
      `<tr><td>${this.paymentLabel(p.mode_paiement)}</td><td style="text-align:right">${p.nb_transactions}</td><td style="text-align:right">${fmt(p.total_ca)}</td></tr>`
    ).join('');

    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Rapport — ${shopName}</title>
<style>
  body{font-family:Arial,sans-serif;font-size:12px;color:#1e293b;margin:0;padding:24px}
  h1{font-size:20px;margin:0 0 4px}
  .subtitle{color:#64748b;margin:0 0 20px;font-size:11px}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
  .kpi{background:#f1f5f9;border-radius:8px;padding:12px}
  .kpi-label{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.05em}
  .kpi-value{font-size:18px;font-weight:700;margin-top:4px}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  th{background:#6366f1;color:#fff;padding:7px 10px;text-align:left;font-size:11px}
  td{padding:6px 10px;border-bottom:1px solid #e2e8f0}
  tr:nth-child(even) td{background:#f8fafc}
  h2{font-size:14px;margin:0 0 8px;color:#4f46e5}
  footer{margin-top:32px;font-size:10px;color:#94a3b8;text-align:center}
  @media print{body{padding:0}}
</style>
</head><body>
<h1>Rapport de performance</h1>
<p class="subtitle">${shopName} · Généré le ${now}</p>

<div class="kpi-grid">
  <div class="kpi"><div class="kpi-label">CA du jour</div><div class="kpi-value">${fmt(kpis?.ca_jour ?? 0)}</div></div>
  <div class="kpi"><div class="kpi-label">CA du mois</div><div class="kpi-value">${fmt(kpis?.ca_mois ?? 0)}</div></div>
  <div class="kpi"><div class="kpi-label">Ventes (mois)</div><div class="kpi-value">${kpis?.nb_ventes_mois ?? 0}</div></div>
  <div class="kpi"><div class="kpi-label">Panier moyen</div><div class="kpi-value">${fmt(kpis?.panier_moyen ?? 0)}</div></div>
</div>

<h2>Top produits</h2>
<table><thead><tr><th>Produit</th><th>Qté vendue</th><th>CA</th></tr></thead>
<tbody>${topRows || '<tr><td colspan="3" style="color:#94a3b8">Aucune donnée</td></tr>'}</tbody></table>

<h2>Répartition des paiements</h2>
<table><thead><tr><th>Mode</th><th>Transactions</th><th>CA</th></tr></thead>
<tbody>${payRows || '<tr><td colspan="3" style="color:#94a3b8">Aucune donnée</td></tr>'}</tbody></table>

<footer>Yaahw POS — Rapport confidentiel</footer>
</body></html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  }
}
