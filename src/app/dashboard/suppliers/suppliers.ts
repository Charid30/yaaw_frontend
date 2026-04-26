// src/app/dashboard/suppliers/suppliers.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule, Truck, Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight, Phone, Mail, MapPin, StickyNote, CheckCircle, AlertCircle } from 'lucide-angular';
import { SupplierService } from './supplier.service';
import { Supplier, SupplierFormData } from './supplier.model';

const EMPTY_FORM = (): SupplierFormData => ({
  nom: '', telephone: '', email: '', adresse: '', note: '',
});

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './suppliers.html',
  styleUrl:    './suppliers.scss',
})
export class SuppliersComponent implements OnInit {
  suppliers   = signal<Supplier[]>([]);
  loading     = signal(false);
  saving      = signal(false);
  deleting    = signal<string | null>(null);

  showModal   = signal(false);
  editingId   = signal<string | null>(null);
  form        = EMPTY_FORM();

  searchQuery = signal('');
  currentPage = signal(1);
  totalPages  = signal(1);
  total       = signal(0);
  readonly limit = 20;

  errorMsg   = signal('');
  successMsg = signal('');

  readonly icons = {
    CheckCircle, AlertCircle, Truck, Plus, Search, Pencil, Trash2, X,
    ChevronLeft, ChevronRight, Phone, Mail, MapPin, StickyNote,
  };

  constructor(private supplierService: SupplierService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.supplierService.getSuppliers({
      page:   this.currentPage(),
      limit:  this.limit,
      search: this.searchQuery() || undefined,
    }).subscribe({
      next: (res) => {
        this.suppliers.set(res.data.fournisseurs);
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

  prevPage(): void {
    if (this.currentPage() > 1) { this.currentPage.update(p => p - 1); this.load(); }
  }
  nextPage(): void {
    if (this.currentPage() < this.totalPages()) { this.currentPage.update(p => p + 1); this.load(); }
  }

  openCreate(): void {
    this.editingId.set(null);
    this.form = EMPTY_FORM();
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  openEdit(s: Supplier): void {
    this.editingId.set(s.id);
    this.form = {
      nom:       s.nom,
      telephone: s.telephone ?? '',
      email:     s.email     ?? '',
      adresse:   s.adresse   ?? '',
      note:      s.note      ?? '',
    };
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  save(): void {
    if (!this.form.nom.trim()) {
      this.errorMsg.set('Le nom du fournisseur est requis.');
      return;
    }
    this.saving.set(true);
    this.errorMsg.set('');

    const payload = {
      nom:       this.form.nom.trim(),
      telephone: this.form.telephone.trim() || undefined,
      email:     this.form.email.trim()     || undefined,
      adresse:   this.form.adresse.trim()   || undefined,
      note:      this.form.note.trim()      || undefined,
    };

    const obs$ = this.editingId()
      ? this.supplierService.updateSupplier(this.editingId()!, payload)
      : this.supplierService.createSupplier(payload as SupplierFormData);

    obs$.subscribe({
      next: () => {
        this.saving.set(false);
        this.showModal.set(false);
        this.showSuccess(this.editingId() ? 'Fournisseur mis à jour.' : 'Fournisseur ajouté.');
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMsg.set(err.error?.message || 'Une erreur est survenue.');
        this.saving.set(false);
      },
    });
  }

  confirmDelete(s: Supplier): void {
    if (!confirm(`Supprimer « ${s.nom} » ?`)) return;
    this.deleting.set(s.id);
    this.supplierService.deleteSupplier(s.id).subscribe({
      next: () => {
        this.deleting.set(null);
        this.showSuccess('Fournisseur supprimé.');
        this.load();
      },
      error: () => this.deleting.set(null),
    });
  }

  initials(nom: string): string {
    return nom.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  avatarColor(nom: string): string {
    const colors = [
      'bg-indigo-100 text-indigo-700',
      'bg-teal-100 text-teal-700',
      'bg-amber-100 text-amber-700',
      'bg-violet-100 text-violet-700',
      'bg-rose-100 text-rose-700',
      'bg-sky-100 text-sky-700',
    ];
    let hash = 0;
    for (const ch of nom) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffff;
    return colors[hash % colors.length];
  }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(''), 3500);
  }
}
