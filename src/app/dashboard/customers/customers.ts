// src/app/dashboard/customers/customers.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import {
  LucideAngularModule,
  Users, UserPlus, Search, Pencil, Trash2, X,
  ChevronLeft, ChevronRight, Phone, Mail, StickyNote,
} from 'lucide-angular';
import { CustomerService } from './customer.service';
import { Customer, CustomerFormData } from './customer.model';

const EMPTY_FORM = (): CustomerFormData => ({
  nom: '', telephone: '', email: '', note: '',
});

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './customers.html',
  styleUrl:    './customers.scss',
})
export class CustomersComponent implements OnInit {
  customers   = signal<Customer[]>([]);
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
    Users, UserPlus, Search, Pencil, Trash2, X,
    ChevronLeft, ChevronRight, Phone, Mail, StickyNote,
  };

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.customerService.getCustomers({
      page:   this.currentPage(),
      limit:  this.limit,
      search: this.searchQuery() || undefined,
    }).subscribe({
      next: (res) => {
        this.customers.set(res.data.customers);
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

  openEdit(c: Customer): void {
    this.editingId.set(c.id);
    this.form = {
      nom:       c.nom,
      telephone: c.telephone ?? '',
      email:     c.email     ?? '',
      note:      c.note      ?? '',
    };
    this.errorMsg.set('');
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); }

  save(): void {
    if (!this.form.nom.trim()) {
      this.errorMsg.set('Le nom du client est requis.');
      return;
    }
    this.saving.set(true);
    this.errorMsg.set('');

    const payload = {
      nom:       this.form.nom.trim(),
      telephone: this.form.telephone.trim() || undefined,
      email:     this.form.email.trim()     || undefined,
      note:      this.form.note.trim()      || undefined,
    };

    const obs$ = this.editingId()
      ? this.customerService.updateCustomer(this.editingId()!, payload)
      : this.customerService.createCustomer(payload as CustomerFormData);

    obs$.subscribe({
      next: () => {
        this.saving.set(false);
        this.showModal.set(false);
        this.showSuccess(this.editingId() ? 'Client mis à jour.' : 'Client ajouté.');
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMsg.set(err.error?.message || 'Une erreur est survenue.');
        this.saving.set(false);
      },
    });
  }

  confirmDelete(c: Customer): void {
    if (!confirm(`Supprimer « ${c.nom} » ?`)) return;
    this.deleting.set(c.id);
    this.customerService.deleteCustomer(c.id).subscribe({
      next: () => {
        this.deleting.set(null);
        this.showSuccess('Client supprimé.');
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
      'bg-violet-100 text-violet-700',
      'bg-pink-100 text-pink-700',
      'bg-amber-100 text-amber-700',
      'bg-emerald-100 text-emerald-700',
      'bg-cyan-100 text-cyan-700',
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
