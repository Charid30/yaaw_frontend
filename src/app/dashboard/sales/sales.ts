// src/app/dashboard/sales/sales.ts
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  LucideAngularModule,
  Search, ShoppingCart, Trash2, Plus, Minus, X,
  Printer, History, Check, Banknote, Smartphone, CreditCard, Package, Receipt, User,
} from 'lucide-angular';
import { buildReceiptHtml, printInFrame } from './receipt.util';
import { ProductService } from '../products/product.service';
import { SaleService } from './sale.service';
import { ShopService } from '../../shop/shop.service';
import { CustomerService } from '../customers/customer.service';
import { Product, Category } from '../products/product.model';
import { Customer } from '../customers/customer.model';
import { CartItem, Sale, PaymentMethod, PAYMENT_METHODS } from './sale.model';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './sales.html',
  styleUrl:    './sales.scss',
})
export class SalesComponent implements OnInit {
  private productService  = inject(ProductService);
  private saleService     = inject(SaleService);
  private shopService     = inject(ShopService);
  private customerService = inject(CustomerService);

  // ── Catalogue ────────────────────────────────────────────
  products       = signal<Product[]>([]);
  categories     = signal<Category[]>([]);
  loadingProducts = signal(false);
  searchQuery    = signal('');
  activeCategory = signal('');

  // ── Panier ────────────────────────────────────────────────
  cart = signal<CartItem[]>([]);

  // ── Remise ───────────────────────────────────────────────
  discountType  = signal<'percent' | 'fixed'>('percent');
  discountValue = signal<number>(0);

  // ── Paiement ─────────────────────────────────────────────
  paymentMethod  = signal<PaymentMethod>('especes');
  amountReceived = signal<number | null>(null);
  note           = signal('');
  processing     = signal(false);
  errorMsg       = signal('');

  // ── Client ────────────────────────────────────────────────
  customers        = signal<Customer[]>([]);
  selectedCustomer = signal<Customer | null>(null);
  customerSearch   = signal('');
  showCustomerDrop = signal(false);

  // ── Ticket ────────────────────────────────────────────────
  showReceipt       = signal(false);
  lastSale          = signal<Sale | null>(null);
  receiptCustomer   = signal<{ id: string; nom: string } | null>(null); // capturé avant clearCart

  // ── Historique ────────────────────────────────────────────
  showHistory  = signal(false);
  history      = signal<Sale[]>([]);
  loadingHistory = signal(false);

  readonly paymentMethods = PAYMENT_METHODS;
  readonly shop = this.shopService.shop;

  readonly icons = { Search, ShoppingCart, Trash2, Plus, Minus, X, Printer, History, Check, Banknote, Smartphone, CreditCard, Package, Receipt, User };


  // ── Computed ─────────────────────────────────────────────

  readonly filteredProducts = computed(() => {
    let list = this.products();
    if (this.activeCategory()) list = list.filter(p => p.categorie_id === this.activeCategory());
    const q = this.searchQuery().toLowerCase().trim();
    if (q) list = list.filter(p => p.nom.toLowerCase().includes(q));
    return list;
  });

  readonly cartTotal = computed(() =>
    this.cart().reduce((sum, item) => sum + item.product.prix * item.quantity, 0)
  );

  readonly discountAmount = computed(() => {
    const v = this.discountValue();
    if (!v || v <= 0) return 0;
    if (this.discountType() === 'percent') {
      return parseFloat(Math.min((this.cartTotal() * v) / 100, this.cartTotal()).toFixed(2));
    }
    return parseFloat(Math.min(v, this.cartTotal()).toFixed(2));
  });

  readonly tvaAmount = computed(() => {
    const s = this.shop();
    const base = this.cartTotal() - this.discountAmount();
    return s?.tva_enabled ? parseFloat((base * (s.tva_rate / 100)).toFixed(2)) : 0;
  });

  readonly grandTotal = computed(() =>
    parseFloat((this.cartTotal() - this.discountAmount() + this.tvaAmount()).toFixed(2))
  );

  readonly change = computed(() => {
    if (this.paymentMethod() !== 'especes') return 0;
    const received = this.amountReceived() ?? 0;
    return Math.max(0, received - this.grandTotal());
  });

  readonly canValidate = computed(() => {
    if (this.cart().length === 0 || this.processing()) return false;
    if (this.paymentMethod() === 'especes') {
      return (this.amountReceived() ?? 0) >= this.grandTotal();
    }
    return true;
  });

  readonly cartItemCount = computed(() =>
    this.cart().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly devise = computed(() => this.shop()?.devise ?? 'FCFA');

  ngOnInit(): void {
    this.loadCatalog();
    this.loadCustomers();
  }

  // ── Catalogue ────────────────────────────────────────────

  loadCatalog(): void {
    this.loadingProducts.set(true);
    this.productService.getProducts({ limit: 200, is_active: 'true' }).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.loadingProducts.set(false);
      },
      error: () => this.loadingProducts.set(false),
    });
    this.productService.getCategories().subscribe({
      next: (res) => this.categories.set(res.data.categories),
    });
  }

  loadCustomers(): void {
    this.customerService.getCustomers({ limit: 200 }).subscribe({
      next: (res) => this.customers.set(res.data.customers),
    });
  }

  readonly filteredCustomers = computed(() => {
    const q = this.customerSearch().toLowerCase().trim();
    if (!q) return this.customers().slice(0, 8);
    return this.customers().filter(c =>
      c.nom.toLowerCase().includes(q) ||
      (c.telephone ?? '').includes(q)
    ).slice(0, 8);
  });

  selectCustomer(c: Customer): void {
    this.selectedCustomer.set(c);
    this.customerSearch.set('');
    this.showCustomerDrop.set(false);
  }

  clearCustomer(): void { this.selectedCustomer.set(null); this.customerSearch.set(''); }

  setCategory(id: string): void {
    this.activeCategory.set(this.activeCategory() === id ? '' : id);
  }

  onSearch(q: string): void {
    this.searchQuery.set(q);
  }

  // ── Panier ───────────────────────────────────────────────

  addToCart(product: Product): void {
    if (product.stock_qty <= 0) return;
    this.cart.update(items => {
      const idx = items.findIndex(i => i.product.id === product.id);
      if (idx >= 0) {
        const item = items[idx];
        if (item.quantity >= product.stock_qty) return items; // limite stock
        return items.map((i, n) => n === idx ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...items, { product, quantity: 1 }];
    });
  }

  updateQty(productId: string, delta: number): void {
    this.cart.update(items =>
      items
        .map(i => i.product.id === productId
          ? { ...i, quantity: Math.min(i.quantity + delta, i.product.stock_qty) }
          : i)
        .filter(i => i.quantity > 0)
    );
  }

  removeFromCart(productId: string): void {
    this.cart.update(items => items.filter(i => i.product.id !== productId));
  }

  clearCart(): void {
    this.cart.set([]);
    this.amountReceived.set(null);
    this.note.set('');
    this.errorMsg.set('');
    this.selectedCustomer.set(null);
    this.customerSearch.set('');
    this.showCustomerDrop.set(false);
    this.discountValue.set(0);
  }

  cartQty(productId: string): number {
    return this.cart().find(i => i.product.id === productId)?.quantity ?? 0;
  }

  // ── Validation vente ─────────────────────────────────────

  validateSale(): void {
    if (!this.canValidate()) return;
    this.processing.set(true);
    this.errorMsg.set('');

    const payload = {
      items: this.cart().map(i => ({ product_id: i.product.id, quantite: i.quantity })),
      mode_paiement: this.paymentMethod(),
      montant_recu: this.paymentMethod() === 'especes'
        ? (this.amountReceived() ?? this.grandTotal())
        : this.grandTotal(),
      note:           this.note()                     || undefined,
      customer_id:    this.selectedCustomer()?.id     ?? null,
      customer_nom:   !this.selectedCustomer() && this.customerSearch().trim()
                        ? this.customerSearch().trim()
                        : null,
      remise_montant: this.discountAmount() || undefined,
    };

    // Capturer le client AVANT clearCart() qui le réinitialise.
    // Priorité : client sélectionné dans le dropdown, sinon texte libre tapé.
    const freeText = this.customerSearch().trim();
    const customerSnapshot = this.selectedCustomer()
      ? { id: this.selectedCustomer()!.id, nom: this.selectedCustomer()!.nom }
      : freeText
        ? { id: '', nom: freeText }
        : null;

    this.saleService.createSale(payload).subscribe({
      next: (res) => {
        const sale = res.data.sale;
        // Fallback : si l'API ne renvoie pas customer, utiliser le snapshot local
        if (!sale.customer && customerSnapshot) {
          sale.customer = customerSnapshot;
        }
        this.lastSale.set(sale);
        this.receiptCustomer.set(sale.customer ?? customerSnapshot);
        this.processing.set(false);
        this.clearCart();
        this.loadCatalog(); // rafraîchir le stock
        this.showReceipt.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMsg.set(err.error?.message || 'Erreur lors de l\'enregistrement.');
        this.processing.set(false);
      },
    });
  }

  // ── Ticket ────────────────────────────────────────────────

  closeReceipt(): void {
    this.showReceipt.set(false);
    this.receiptCustomer.set(null);
  }

  printReceipt(): void {
    const sale = this.lastSale();
    const shop = this.shop();
    if (!sale) return;
    printInFrame(buildReceiptHtml({
      sale,
      shopNom:     shop?.nom        ?? 'YAAHW',
      shopType:    shop?.type_commerce ?? '',
      devise:      this.devise(),
      customerNom: this.receiptCustomer()?.nom ?? null,
    }));
  }

  // ── Historique ────────────────────────────────────────────

  openHistory(): void {
    this.showHistory.set(true);
    this.loadingHistory.set(true);
    this.saleService.getSales({ limit: 20 }).subscribe({
      next: (res) => {
        this.history.set(res.data);
        this.loadingHistory.set(false);
      },
      error: () => this.loadingHistory.set(false),
    });
  }

  closeHistory(): void { this.showHistory.set(false); }

  // ── Helpers ──────────────────────────────────────────────

  formatPrice(n: number): string {
    return n.toLocaleString('fr-FR') + ' ' + this.devise();
  }

  paymentLabel(method: PaymentMethod): string {
    return PAYMENT_METHODS.find(m => m.key === method)?.label ?? method;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
