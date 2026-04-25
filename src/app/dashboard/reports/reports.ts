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

  readonly icons = { RefreshCw, TrendingUp, BarChart2, Receipt, Trophy, CreditCard, Banknote, Smartphone, ShoppingCart };

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
}
