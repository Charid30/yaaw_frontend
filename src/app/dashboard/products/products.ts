// src/app/dashboard/products/products.ts
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  LucideAngularModule, LucideIconData,
  Package, ShoppingBag, Utensils, Pill, Wine, Shirt,
  Laptop, Smartphone, Wrench, Droplets, Beef, Coffee,
  Wheat, Sparkles, BookOpen, Car, Baby, Dumbbell, Home, Gem,
  Tag, Apple, Fish, Layers, Scissors,
  Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight,
  LayoutGrid, ListFilter,
} from 'lucide-angular';
import { ProductService } from './product.service';
import { ShopService } from '../../shop/shop.service';
import { Product, Category, ProductFormData, UNITES } from './product.model';

const EMPTY_FORM = (): ProductFormData => ({
  nom: '', description: '', prix: null, prix_achat: null,
  categorie_id: '', stock_qty: 0, unite: 'pièce',
  code_barre: '', is_active: true,
});

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './products.html',
  styleUrl:    './products.scss',
})
export class ProductsComponent implements OnInit {
  // ── State ─────────────────────────────────────────────────
  products    = signal<Product[]>([]);
  categories  = signal<Category[]>([]);
  loading     = signal(false);
  saving      = signal(false);
  deleting    = signal<string | null>(null);
  errorMsg    = signal('');
  successMsg  = signal('');

  // ── Modal produit ──────────────────────────────────────────
  showModal   = signal(false);
  editingId   = signal<string | null>(null);
  form        = EMPTY_FORM();

  // ── Modal catégorie ────────────────────────────────────────
  showCatModal   = signal(false);
  catForm        = { nom: '', couleur: '#6366f1', icone: 'package' };
  savingCat      = signal(false);

  // ── Filtres ────────────────────────────────────────────────
  searchQuery    = signal('');
  filterCategory = signal('');
  filterActive   = signal('');

  // ── Pagination ─────────────────────────────────────────────
  currentPage = signal(1);
  totalPages  = signal(1);
  total       = signal(0);
  readonly limit = 20;

  readonly devise = computed(() => this.shopService.shop()?.devise ?? 'FCFA');
  readonly unites = UNITES;

  // ── Icônes générales (actions) ────────────────────────────
  readonly icons = { Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight, LayoutGrid, ListFilter, Package };

  // ── Palette de couleurs ────────────────────────────────────
  readonly PRESET_COLORS = [
    '#6366f1','#8b5cf6','#ec4899','#ef4444',
    '#f97316','#eab308','#22c55e','#14b8a6','#3b82f6','#64748b',
  ];

  // ── Icônes de catégorie (Lucide) ──────────────────────────
  readonly PRESET_ICONS: { name: string; icon: LucideIconData; label: string }[] = [
    { name: 'package',      icon: Package,    label: 'Général'      },
    { name: 'shopping-bag', icon: ShoppingBag, label: 'Boutique'    },
    { name: 'utensils',     icon: Utensils,   label: 'Restaurant'   },
    { name: 'pill',         icon: Pill,       label: 'Pharmacie'    },
    { name: 'wine',         icon: Wine,       label: 'Cave'         },
    { name: 'shirt',        icon: Shirt,      label: 'Vêtements'    },
    { name: 'laptop',       icon: Laptop,     label: 'Électronique' },
    { name: 'smartphone',   icon: Smartphone, label: 'Mobile'       },
    { name: 'wrench',       icon: Wrench,     label: 'Outillage'    },
    { name: 'droplets',     icon: Droplets,   label: 'Cosmétiques'  },
    { name: 'beef',         icon: Beef,       label: 'Boucherie'    },
    { name: 'coffee',       icon: Coffee,     label: 'Boissons'     },
    { name: 'wheat',        icon: Wheat,      label: 'Boulangerie'  },
    { name: 'sparkles',     icon: Sparkles,   label: 'Nettoyage'    },
    { name: 'book-open',    icon: BookOpen,   label: 'Librairie'    },
    { name: 'car',          icon: Car,        label: 'Auto'         },
    { name: 'baby',         icon: Baby,       label: 'Bébé'         },
    { name: 'dumbbell',     icon: Dumbbell,   label: 'Sport'        },
    { name: 'home',         icon: Home,       label: 'Maison'       },
    { name: 'gem',          icon: Gem,        label: 'Bijoux'       },
    { name: 'tag',          icon: Tag,        label: 'Promo'        },
    { name: 'apple',        icon: Apple,      label: 'Fruits'       },
    { name: 'fish',         icon: Fish,       label: 'Poissonnerie' },
    { name: 'layers',       icon: Layers,     label: 'Divers'       },
    { name: 'scissors',     icon: Scissors,   label: 'Coiffure'     },
  ];

  // ── Map nom → icône pour l'affichage ─────────────────────
  private readonly iconMap: Record<string, LucideIconData> = Object.fromEntries(
    this.PRESET_ICONS.map(i => [i.name, i.icon])
  );

  getCatIcon(name: string): LucideIconData {
    return this.iconMap[name] ?? Package;
  }

  constructor(
    private productService: ProductService,
    public  shopService:    ShopService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  // ── Chargement ────────────────────────────────────────────

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts({
      page:         this.currentPage(),
      limit:        this.limit,
      search:       this.searchQuery() || undefined,
      categorie_id: this.filterCategory() || undefined,
      is_active:    this.filterActive()   || undefined,
    }).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.total.set(res.pagination.total);
        this.totalPages.set(res.pagination.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (res) => this.categories.set(res.data.categories),
    });
  }

  // ── Filtres ────────────────────────────────────────────────

  onSearch(q: string): void {
    this.searchQuery.set(q);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onFilterCategory(id: string): void {
    this.filterCategory.set(id);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onFilterActive(val: string): void {
    this.filterActive.set(val);
    this.currentPage.set(1);
    this.loadProducts();
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.loadProducts();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.loadProducts();
    }
  }

  // ── Modal produit ──────────────────────────────────────────

  openCreate(): void {
    this.editingId.set(null);
    this.form = EMPTY_FORM();
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  openEdit(product: Product): void {
    this.editingId.set(product.id);
    this.form = {
      nom:          product.nom,
      description:  product.description ?? '',
      prix:         product.prix,
      prix_achat:   product.prix_achat,
      categorie_id: product.categorie_id ?? '',
      stock_qty:    product.stock_qty,
      unite:        product.unite,
      code_barre:   product.code_barre ?? '',
      is_active:    product.is_active,
    };
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  saveProduct(): void {
    if (!this.form.nom.trim() || !this.form.prix) {
      this.errorMsg.set('Le nom et le prix de vente sont requis.');
      return;
    }
    this.saving.set(true);
    this.errorMsg.set('');

    const payload = {
      ...this.form,
      nom:          this.form.nom.trim(),
      description:  this.form.description  || null,
      prix_achat:   this.form.prix_achat   ?? null,
      categorie_id: this.form.categorie_id || null,
      code_barre:   this.form.code_barre   || null,
    };

    const obs$ = this.editingId()
      ? this.productService.updateProduct(this.editingId()!, payload)
      : this.productService.createProduct(payload as ProductFormData);

    obs$.subscribe({
      next: () => {
        this.saving.set(false);
        this.showModal.set(false);
        this.showSuccess(this.editingId() ? 'Produit mis à jour.' : 'Produit créé.');
        this.loadProducts();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMsg.set(err.error?.message || 'Une erreur est survenue.');
        this.saving.set(false);
      },
    });
  }

  confirmDelete(product: Product): void {
    if (!confirm(`Supprimer « ${product.nom} » ? Cette action est irréversible.`)) return;
    this.deleting.set(product.id);
    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.deleting.set(null);
        this.showSuccess('Produit supprimé.');
        this.loadProducts();
      },
      error: () => this.deleting.set(null),
    });
  }

  // ── Modal catégorie ────────────────────────────────────────

  openCatModal(): void {
    this.catForm = { nom: '', couleur: '#6366f1', icone: 'package' };
    this.showCatModal.set(true);
  }

  closeCatModal(): void { this.showCatModal.set(false); }

  saveCategory(): void {
    if (!this.catForm.nom.trim()) return;
    this.savingCat.set(true);
    this.productService.createCategory(this.catForm).subscribe({
      next: (res) => {
        this.categories.update(cats => [...cats, res.data.category]);
        this.savingCat.set(false);
        this.showCatModal.set(false);
        this.showSuccess('Catégorie créée.');
      },
      error: () => this.savingCat.set(false),
    });
  }

  deleteCategory(cat: Category): void {
    if (!confirm(`Supprimer « ${cat.nom} » ? Les produits associés seront conservés sans catégorie.`)) return;
    this.productService.deleteCategory(cat.id).subscribe({
      next: () => {
        this.categories.update(cats => cats.filter(c => c.id !== cat.id));
        this.loadProducts();
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(''), 3500);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('fr-FR') + ' ' + this.devise();
  }

  stockBadgeClass(qty: number): string {
    if (qty <= 0) return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    if (qty <= 5) return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
  }
}
