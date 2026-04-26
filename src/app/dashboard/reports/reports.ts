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
    const kpis = this.kpis();
    if (!kpis) return;

    const shop     = this.shopService.shop();
    const shopName = shop?.nom           ?? 'YAAHW';
    const shopType = shop?.type_commerce ?? '';
    const devise   = this.devise();

    const now = new Date().toLocaleString('fr-FR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const fmt = (n: number) =>
      n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' ' + devise;

    const fmtDate = (iso: string) => new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    // ── Graphique CA mensuel ───────────────────────────────────
    const months = this.caByMonth();
    const maxCa  = Math.max(...months.map(m => m.ca), 1);
    const caRows = months.map(m => {
      const [y, mo] = m.mois.split('-');
      const label   = new Date(+y, +mo - 1).toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
      const pct     = Math.max(2, Math.round((m.ca / maxCa) * 100));
      return `<div class="ca-row">
        <span class="ca-label">${label}</span>
        <div class="ca-bar-wrap"><div class="ca-bar" style="width:${pct}%"></div></div>
        <span class="ca-val">${m.ca > 0 ? fmt(m.ca) : '—'}</span>
        <span class="ca-nb">${m.nb_ventes}v</span>
      </div>`;
    }).join('');

    // ── Top produits ───────────────────────────────────────────
    const topMax  = Math.max(...this.topProducts().map(p => p.total_qte), 1);
    const COLORS  = ['#4f46e5', '#7c3aed', '#a855f7', '#6366f1', '#818cf8', '#c4b5fd', '#ddd6fe', '#ede9fe'];
    const topRows = this.topProducts().length === 0
      ? '<tr><td colspan="5" class="empty">Aucune vente sur cette période</td></tr>'
      : this.topProducts().map((p, i) => {
          const pct = Math.round((p.total_qte / topMax) * 100);
          return `<tr>
            <td class="rank">${i + 1}</td>
            <td class="prod-name">${p.nom}</td>
            <td>
              <div class="bar-cell">
                <div class="bar-bg"><div class="bar-fill" style="width:${pct}%;background:${COLORS[i] ?? '#818cf8'}"></div></div>
                <span>${p.total_qte}</span>
              </div>
            </td>
            <td class="text-right">${p.nb_ventes}</td>
            <td class="text-right bold">${fmt(p.total_ca)}</td>
          </tr>`;
        }).join('');

    // ── Modes de paiement ──────────────────────────────────────
    const PAY_COLOR: Record<string, string> = {
      especes:      '#10b981',
      orange_money: '#f97316',
      moov_money:   '#3b82f6',
    };
    const payRows = this.payments().length === 0
      ? '<tr><td colspan="4" class="empty">Aucune donnée</td></tr>'
      : this.payments().map(p => {
          const color = PAY_COLOR[p.mode] ?? '#6366f1';
          return `<tr>
            <td>
              <span class="pay-dot" style="background:${color}"></span>
              ${this.paymentLabel(p.mode)}
            </td>
            <td class="text-right">${p.nb}</td>
            <td>
              <div class="bar-cell">
                <div class="bar-bg"><div class="bar-fill" style="width:${p.pourcentage}%;background:${color}"></div></div>
                <span>${p.pourcentage}%</span>
              </div>
            </td>
            <td class="text-right bold">${fmt(p.ca)}</td>
          </tr>`;
        }).join('');

    // ── Dernières transactions ─────────────────────────────────
    const recentRows = this.recentSales().length === 0
      ? '<tr><td colspan="4" class="empty">Aucune transaction</td></tr>'
      : this.recentSales().map((s, i) => `<tr class="${i % 2 === 1 ? 'even' : ''}">
          <td>${fmtDate(s.created_at)}</td>
          <td>${this.paymentLabel(s.mode_paiement)}</td>
          <td class="text-right">${s.nb_articles} article(s)</td>
          <td class="text-right bold">${fmt(s.montant_total)}</td>
        </tr>`).join('');

    // ── HTML complet du rapport ────────────────────────────────
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport — ${shopName}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 14mm; }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 10px;
      color: #1e293b;
      background: #fff;
      line-height: 1.4;
    }

    /* ── En-tête ── */
    .report-header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #fff;
      padding: 18px 22px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-left .shop-name { font-size: 20px; font-weight: 800; letter-spacing: -.3px; }
    .header-left .shop-type { font-size: 10px; opacity: .8; margin-top: 2px; }
    .header-right { text-align: right; }
    .header-right .report-title { font-size: 14px; font-weight: 700; opacity: .95; }
    .header-right .report-date { font-size: 9px; opacity: .7; margin-top: 4px; }

    /* ── KPI grid ── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 16px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .kpi-card {
      padding: 11px 13px;
      border-radius: 6px;
      border-left: 4px solid #4f46e5;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
    }
    .kpi-card.c1 { border-left-color: #4f46e5; }
    .kpi-card.c2 { border-left-color: #10b981; }
    .kpi-card.c3 { border-left-color: #f59e0b; }
    .kpi-card.c4 { border-left-color: #8b5cf6; }
    .kpi-label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: #64748b; }
    .kpi-value { font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 3px; line-height: 1.1; }
    .kpi-sub   { font-size: 8px; color: #94a3b8; margin-top: 3px; }

    /* ── Section ── */
    .section { margin-bottom: 14px; page-break-inside: avoid; }
    .section-title {
      font-size: 9px; font-weight: 800; color: #4f46e5;
      text-transform: uppercase; letter-spacing: .08em;
      border-bottom: 2px solid #e0e7ff;
      padding-bottom: 5px; margin-bottom: 8px;
    }

    /* ── Deux colonnes ── */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }

    /* ── Tables ── */
    table { width: 100%; border-collapse: collapse; }
    th {
      background: #4f46e5; color: #fff;
      padding: 6px 8px; text-align: left; font-size: 9px; font-weight: 700;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    th.text-right { text-align: right; }
    td { padding: 5px 8px; font-size: 9px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    tr.even td { background: #f8fafc; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .text-right { text-align: right; }
    .bold { font-weight: 700; }
    .rank { font-weight: 800; color: #4f46e5; text-align: center; width: 20px; }
    .prod-name { font-weight: 600; }
    .empty { text-align: center; color: #94a3b8; padding: 12px; }

    /* ── Barres ── */
    .bar-cell { display: flex; align-items: center; gap: 5px; }
    .bar-bg { flex: 1; background: #e2e8f0; height: 6px; border-radius: 3px; min-width: 40px; }
    .bar-fill { height: 100%; border-radius: 3px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    /* ── Point paiement ── */
    .pay-dot {
      display: inline-block; width: 7px; height: 7px; border-radius: 50%;
      margin-right: 4px; vertical-align: middle;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }

    /* ── Graphique CA mensuel ── */
    .ca-chart { padding: 4px 0; }
    .ca-row { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    .ca-label { width: 36px; font-size: 8px; color: #64748b; text-align: right; flex-shrink: 0; font-weight: 600; }
    .ca-bar-wrap { flex: 1; background: #f1f5f9; height: 11px; border-radius: 3px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .ca-bar { height: 100%; background: linear-gradient(90deg, #4f46e5, #818cf8); border-radius: 3px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .ca-val { width: 90px; font-size: 8px; font-weight: 700; color: #374151; text-align: right; flex-shrink: 0; }
    .ca-nb  { width: 22px; font-size: 8px; color: #94a3b8; text-align: right; flex-shrink: 0; }

    /* ── Pied de page ── */
    .report-footer {
      margin-top: 16px; padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      display: flex; justify-content: space-between; align-items: center;
      font-size: 8px; color: #94a3b8;
    }
    .footer-badge {
      background: #4f46e5; color: #fff; padding: 2px 8px; border-radius: 20px;
      font-size: 8px; font-weight: 700;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
  </style>
</head>
<body>

  <!-- En-tête -->
  <div class="report-header">
    <div class="header-left">
      <div class="shop-name">${shopName}</div>
      ${shopType ? `<div class="shop-type">${shopType}</div>` : ''}
    </div>
    <div class="header-right">
      <div class="report-title">Rapport de performance</div>
      <div class="report-date">Généré le ${now}</div>
    </div>
  </div>

  <!-- KPI -->
  <div class="kpi-grid">
    <div class="kpi-card c1">
      <div class="kpi-label">CA aujourd'hui</div>
      <div class="kpi-value">${fmt(kpis.caAujourdhui)}</div>
      <div class="kpi-sub">${kpis.ventesAujourdhui} vente(s)</div>
    </div>
    <div class="kpi-card c2">
      <div class="kpi-label">CA ce mois</div>
      <div class="kpi-value">${fmt(kpis.caMois)}</div>
      <div class="kpi-sub">${kpis.ventesMois} vente(s)</div>
    </div>
    <div class="kpi-card c3">
      <div class="kpi-label">Ticket moyen</div>
      <div class="kpi-value">${fmt(kpis.ticketMoyen)}</div>
      <div class="kpi-sub">ce mois</div>
    </div>
    <div class="kpi-card c4">
      <div class="kpi-label">Total cumulé</div>
      <div class="kpi-value">${fmt(kpis.caTotal)}</div>
      <div class="kpi-sub">${kpis.ventesTotal} vente(s) au total</div>
    </div>
  </div>

  <!-- Graphique CA mensuel -->
  <div class="section">
    <div class="section-title">Évolution du chiffre d'affaires — 12 derniers mois</div>
    <div class="ca-chart">
      ${caRows || '<p style="color:#94a3b8;font-size:9px;text-align:center;padding:8px 0">Aucune donnée disponible</p>'}
    </div>
  </div>

  <!-- Top produits + Paiements -->
  <div class="two-col">
    <div class="section">
      <div class="section-title">Top produits vendus</div>
      <table>
        <thead>
          <tr>
            <th style="width:16px">#</th>
            <th>Produit</th>
            <th>Quantité</th>
            <th class="text-right">Ventes</th>
            <th class="text-right">CA</th>
          </tr>
        </thead>
        <tbody>${topRows}</tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Répartition des paiements</div>
      <table>
        <thead>
          <tr>
            <th>Mode</th>
            <th class="text-right">Tx</th>
            <th>Part</th>
            <th class="text-right">CA</th>
          </tr>
        </thead>
        <tbody>${payRows}</tbody>
      </table>
    </div>
  </div>

  <!-- Dernières transactions -->
  <div class="section">
    <div class="section-title">Dernières transactions</div>
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Mode de paiement</th>
          <th class="text-right">Articles</th>
          <th class="text-right">Montant</th>
        </tr>
      </thead>
      <tbody>${recentRows}</tbody>
    </table>
  </div>

  <!-- Pied de page -->
  <div class="report-footer">
    <span>${shopName} — Document confidentiel</span>
    <span class="footer-badge">Yaahw POS</span>
    <span>Page 1</span>
  </div>

</body>
</html>`;

    // Impression via iframe invisible (A4)
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:900px;height:700px;border:0;visibility:hidden;';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) { document.body.removeChild(iframe); return; }
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe); }, 1000);
    }, 400);
  }
}
