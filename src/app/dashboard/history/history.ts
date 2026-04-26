// src/app/dashboard/history/history.ts
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  History, Search, ChevronLeft, ChevronRight, X,
  Banknote, Smartphone, CreditCard, Eye, Filter, Printer,
} from 'lucide-angular';
import { buildReceiptHtml, printInFrame } from '../sales/receipt.util';
import { SaleService } from '../sales/sale.service';
import { ShopService } from '../../shop/shop.service';
import { Sale, PaymentMethod, PAYMENT_METHODS } from '../sales/sale.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './history.html',
  styleUrl:    './history.scss',
})
export class HistoryComponent implements OnInit {
  private saleService = inject(SaleService);
  private shopService = inject(ShopService);

  sales        = signal<Sale[]>([]);
  loading      = signal(true);
  total        = signal(0);
  totalPages   = signal(1);
  currentPage  = signal(1);
  readonly limit = 15;

  // Filtres
  dateDebut     = signal('');
  dateFin       = signal('');
  modePaiement  = signal('');
  searchQuery   = signal('');

  // Détail
  selectedSale  = signal<Sale | null>(null);

  readonly devise = computed(() => this.shopService.shop()?.devise ?? 'FCFA');
  readonly paymentMethods = PAYMENT_METHODS;
  readonly icons = { History, Search, ChevronLeft, ChevronRight, X, Banknote, Smartphone, CreditCard, Eye, Filter, Printer };

  // Total CA de la page courante
  readonly pageTotal = computed(() =>
    this.sales().reduce((s, v) => s + v.montant_total, 0)
  );

  ngOnInit(): void {
    // Par défaut : mois en cours
    const now  = new Date();
    const y    = now.getFullYear();
    const m    = String(now.getMonth() + 1).padStart(2, '0');
    this.dateDebut.set(`${y}-${m}-01`);
    this.dateFin.set(`${y}-${m}-${String(new Date(y, now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.saleService.getSales({
      page:          this.currentPage(),
      limit:         this.limit,
      date_debut:    this.dateDebut()    || undefined,
      date_fin:      this.dateFin()      || undefined,
      mode_paiement: this.modePaiement() || undefined,
      search:        this.searchQuery()  || undefined,
    }).subscribe({
      next: (res) => {
        this.sales.set(res.data);
        this.total.set(res.pagination.total);
        this.totalPages.set(res.pagination.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  applyFilters(): void { this.currentPage.set(1); this.load(); }
  resetFilters(): void {
    this.modePaiement.set('');
    this.dateDebut.set('');
    this.dateFin.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.load();
  }

  onSearch(q: string): void {
    this.searchQuery.set(q);
    this.currentPage.set(1);
    this.load();
  }

  prevPage(): void { if (this.currentPage() > 1) { this.currentPage.update(p => p - 1); this.load(); } }
  nextPage(): void { if (this.currentPage() < this.totalPages()) { this.currentPage.update(p => p + 1); this.load(); } }

  openDetail(sale: Sale): void { this.selectedSale.set(sale); }
  closeDetail(): void          { this.selectedSale.set(null); }

  formatPrice(n: number): string { return n.toLocaleString('fr-FR') + ' ' + this.devise(); }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  paymentLabel(m: string): string {
    return PAYMENT_METHODS.find(p => p.key === m)?.label ?? m;
  }

  paymentClass(m: string): string {
    const map: Record<string, string> = {
      especes:      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      orange_money: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
      moov_money:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    };
    return map[m] ?? 'bg-slate-100 text-slate-600';
  }

  printSaleReceipt(): void {
    const sale = this.selectedSale();
    const shop = this.shopService.shop();
    if (!sale) return;
    printInFrame(buildReceiptHtml({
      sale,
      shopNom:  shop?.nom           ?? 'YAAHW',
      shopType: shop?.type_commerce ?? '',
      devise:   this.devise(),
    }));
  }
}
