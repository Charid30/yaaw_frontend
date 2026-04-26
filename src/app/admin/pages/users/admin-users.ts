// src/app/admin/pages/users/admin-users.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Users, ChevronLeft, ChevronRight, UserCheck, UserX, UserPlus, Trash2, CheckCircle, AlertCircle } from 'lucide-angular';
import { AdminApiService, AdminUser } from '../../admin.service';

interface CreateForm {
  nom:      string;
  prenom:   string;
  telephone: string;
  password: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-users.html',
  styleUrl:    './admin-users.scss',
})
export class AdminUsersComponent implements OnInit {
  users       = signal<AdminUser[]>([]);
  loading     = signal(true);
  searchQuery = signal('');
  currentPage = signal(1);
  totalPages  = signal(1);
  total       = signal(0);
  readonly limit = 20;

  // Toggle activer/désactiver
  togglingId    = signal<string | null>(null);
  confirmTarget = signal<AdminUser | null>(null);

  // Création gérant
  showCreateModal = signal(false);
  creating        = signal(false);
  createError     = signal('');
  createForm: CreateForm = { nom: '', prenom: '', telephone: '', password: '' };

  // Suppression gérant
  deleteTarget  = signal<AdminUser | null>(null);
  deletingId    = signal<string | null>(null);

  // Feedback global
  successMsg = signal('');
  errorMsg   = signal('');

  readonly icons = { CheckCircle, AlertCircle, Search, Users, ChevronLeft, ChevronRight, UserCheck, UserX, UserPlus, Trash2 };

  constructor(private adminApi: AdminApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.adminApi.getUsers({
      page: this.currentPage(), limit: this.limit,
      search: this.searchQuery() || undefined,
    }).subscribe({
      next: (res) => {
        this.users.set(res.data.users);
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

  prevPage(): void { if (this.currentPage() > 1) { this.currentPage.update(p => p - 1); this.load(); } }
  nextPage(): void { if (this.currentPage() < this.totalPages()) { this.currentPage.update(p => p + 1); this.load(); } }

  // ── Toggle ────────────────────────────────────────────────────
  askToggle(user: AdminUser): void  { this.confirmTarget.set(user); }
  cancelToggle(): void              { this.confirmTarget.set(null); }

  confirmToggle(): void {
    const user = this.confirmTarget();
    if (!user) return;
    this.confirmTarget.set(null);
    this.togglingId.set(user.id);
    this.adminApi.toggleUser(user.id).subscribe({
      next: (res) => {
        this.users.update(list =>
          list.map(u => u.id === user.id ? { ...u, is_active: res.data.is_active } : u)
        );
        this.togglingId.set(null);
      },
      error: () => this.togglingId.set(null),
    });
  }

  // ── Création ──────────────────────────────────────────────────
  openCreate(): void {
    this.createForm = { nom: '', prenom: '', telephone: '', password: '' };
    this.createError.set('');
    this.showCreateModal.set(true);
  }

  closeCreate(): void { this.showCreateModal.set(false); }

  submitCreate(): void {
    const { nom, prenom, telephone, password } = this.createForm;
    if (!nom.trim() || !prenom.trim() || !telephone.trim() || !password) {
      this.createError.set('Tous les champs sont requis.');
      return;
    }
    if (password.length < 6) {
      this.createError.set('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    this.creating.set(true);
    this.createError.set('');
    this.adminApi.createGerant(this.createForm).subscribe({
      next: (res) => {
        this.users.update(list => [res.data.user, ...list]);
        this.total.update(n => n + 1);
        this.creating.set(false);
        this.showCreateModal.set(false);
        this.flash('success', `Gérant ${res.data.user.prenom} ${res.data.user.nom} créé avec succès.`);
      },
      error: (err) => {
        this.createError.set(err?.error?.message || 'Erreur lors de la création.');
        this.creating.set(false);
      },
    });
  }

  // ── Suppression ───────────────────────────────────────────────
  askDelete(user: AdminUser): void  { this.deleteTarget.set(user); }
  cancelDelete(): void              { this.deleteTarget.set(null); }

  confirmDelete(): void {
    const user = this.deleteTarget();
    if (!user) return;
    this.deleteTarget.set(null);
    this.deletingId.set(user.id);
    this.adminApi.deleteGerant(user.id).subscribe({
      next: () => {
        this.users.update(list => list.filter(u => u.id !== user.id));
        this.total.update(n => Math.max(0, n - 1));
        this.deletingId.set(null);
        this.flash('success', `Gérant ${user.prenom} ${user.nom} supprimé.`);
      },
      error: (err) => {
        this.deletingId.set(null);
        this.flash('error', err?.error?.message || 'Erreur lors de la suppression.');
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  private flash(type: 'success' | 'error', msg: string): void {
    if (type === 'success') { this.successMsg.set(msg); setTimeout(() => this.successMsg.set(''), 4000); }
    else                    { this.errorMsg.set(msg);   setTimeout(() => this.errorMsg.set(''),   4000); }
  }

  initials(prenom: string, nom: string): string {
    return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
