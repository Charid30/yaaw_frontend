// src/app/dashboard/stock/stock.ts
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  LucideAngularModule, LucideIconData,
  History, Search, Plus, Minus, SlidersHorizontal,
  Package, ArrowDownToLine, ArrowUpFromLine, X, ChevronDown, ShoppingCart,
} from 'lucide-angular';
import { StockService } from './stock.service';
import { ProductService } from '../products/product.service';
import { ShopService } from '../../shop/shop.service';
import {
  StockSummary, StockMovement, StockProduct,
  MovementType, MOVEMENT_TYPES,
} from './stock.model';
import { Product } from '../products/product.model';

type ModalMode = 'entree' | 'sortie' | 'ajustement';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './stock.html',
  styleUrl:    './stock.scss',
})
export class StockComponent implements OnInit {
  private stockService   = inject(StockService);
  private productService = inject(ProductService);
  private shopService    = inject(ShopService);

  readonly devise = computed(() => this.shopService.shop()?.devise ?? 'FCFA');

  // ── Summary ──────────────────────────────────────────────────
  summary        = signal<StockSummary | null>(null);
  loadingSummary = signal(false);

  // ── Products list ────────────────────────────────────────────
  products      = signal<Product[]>([]);
  searchQuery   = signal('');
  stockFilter   = signal<'all' | 'low' | 'out'>('all');

  readonly filteredProducts = computed(() => {
    let list = this.summary()?.products ?? [];
    const q = this.searchQuery().toLowerCase().trim();
    if (q) list = list.filter(p => p.nom.toLowerCase().includes(q));
    if (this.stockFilter() === 'low') list = list.filter(p => p.stock_qty > 0 && p.stock_qty <= 5);
    if (this.stockFilter() === 'out') list = list.filter(p => p.stock_qty === 0);
    return list;
  });

  // ── Movements ─────────────────────────────────────────────────
  showHistory      = signal(false);
  movements        = signal<StockMovement[]>([]);
  loadingMovements = signal(false);
  movementTypeFilter = signal<string>('');

  // ── Modal ─────────────────────────────────────────────────────
  showModal    = signal(false);
  modalMode    = signal<ModalMode>('entree');
  selectedProduct = signal<StockProduct | null>(null);

  // Form
  formQty    = signal<number | null>(null);
  formNewQty = signal<number | null>(null);
  formMotif  = signal('');
  processing = signal(false);
  errorMsg   = signal('');

  readonly modalTitle = computed(() => {
    switch (this.modalMode()) {
      case 'entree':     return 'Entrée de stock';
      case 'sortie':     return 'Sortie de stock';
      case 'ajustement': return 'Ajustement d\'inventaire';
    }
  });

  readonly MOVEMENT_TYPES = MOVEMENT_TYPES;
  readonly icons = { History, Search, Plus, Minus, SlidersHorizontal, Package, ArrowDownToLine, ArrowUpFromLine, X, ChevronDown };

  ngOnInit(): void {
    this.loadSummary();
  }

  // ── Data loading ─────────────────────────────────────────────

  loadSummary(): void {
    this.loadingSummary.set(true);
    this.stockService.getSummary().subscribe({
      next: (res) => {
        this.summary.set(res.data);
        this.loadingSummary.set(false);
      },
      error: () => this.loadingSummary.set(false),
    });
  }

  openHistory(): void {
    this.showHistory.set(true);
    this.loadMovements();
  }

  loadMovements(): void {
    this.loadingMovements.set(true);
    const type = this.movementTypeFilter() || undefined;
    this.stockService.getMovements({ type, limit: 50 }).subscribe({
      next: (res) => {
        this.movements.set(res.data);
        this.loadingMovements.set(false);
      },
      error: () => this.loadingMovements.set(false),
    });
  }

  // ── Modal ─────────────────────────────────────────────────────

  openModal(product: StockProduct, mode: ModalMode): void {
    this.selectedProduct.set(product);
    this.modalMode.set(mode);
    this.formQty.set(null);
    this.formNewQty.set(mode === 'ajustement' ? product.stock_qty : null);
    this.formMotif.set('');
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedProduct.set(null);
  }

  submit(): void {
    const product = this.selectedProduct();
    if (!product || this.processing()) return;

    const mode   = this.modalMode();
    const qty    = this.formQty();
    const newQty = this.formNewQty();
    const motif  = this.formMotif().trim() || undefined;

    if (mode !== 'ajustement' && (!qty || qty <= 0)) {
      this.errorMsg.set('Quantité invalide.');
      return;
    }
    if (mode === 'ajustement' && (newQty === null || newQty < 0)) {
      this.errorMsg.set('Nouvelle quantité invalide.');
      return;
    }

    this.processing.set(true);
    this.errorMsg.set('');

    let call$;
    if (mode === 'entree') {
      call$ = this.stockService.addStock({ product_id: product.id, quantite: qty!, motif });
    } else if (mode === 'sortie') {
      call$ = this.stockService.removeStock({ product_id: product.id, quantite: qty!, motif });
    } else {
      call$ = this.stockService.adjustStock({ product_id: product.id, new_qty: newQty!, motif });
    }

    call$.subscribe({
      next: () => {
        this.processing.set(false);
        this.closeModal();
        this.loadSummary();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMsg.set(err.error?.message || 'Une erreur est survenue.');
        this.processing.set(false);
      },
    });
  }

  // ── Helpers ──────────────────────────────────────────────────

  stockClass(qty: number): string {
    if (qty === 0) return 'text-red-600 dark:text-red-400';
    if (qty <= 5)  return 'text-amber-600 dark:text-amber-400';
    return 'text-emerald-600 dark:text-emerald-400';
  }

  stockBadge(qty: number): string {
    if (qty === 0) return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50';
    if (qty <= 5)  return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50';
  }

  movementIcon(type: MovementType): LucideIconData {
    switch (type) {
      case 'entree':     return ArrowDownToLine;
      case 'sortie':     return ArrowUpFromLine;
      case 'ajustement': return SlidersHorizontal;
      case 'vente':      return ShoppingCart;
      default:           return Package;
    }
  }

  movementLabel(type: MovementType): string {
    return MOVEMENT_TYPES.find(t => t.key === type)?.label ?? type;
  }

  movementBadge(type: MovementType): string {
    switch (type) {
      case 'entree':     return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50';
      case 'sortie':     return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50';
      case 'ajustement': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/50';
      case 'vente':      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/50';
    }
  }

  deltaSign(type: MovementType): string {
    return type === 'entree' ? '+' : type === 'sortie' || type === 'vente' ? '-' : '±';
  }

  formatPrice(n: number): string {
    return n.toLocaleString('fr-FR') + ' ' + this.devise();
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
