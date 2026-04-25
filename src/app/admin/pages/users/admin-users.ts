// src/app/admin/pages/users/admin-users.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Users, ChevronLeft, ChevronRight, UserCheck, UserX } from 'lucide-angular';
import { AdminApiService, AdminUser } from '../../admin.service';

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

  togglingId  = signal<string | null>(null);

  readonly icons = { Search, Users, ChevronLeft, ChevronRight, UserCheck, UserX };

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

  toggle(user: AdminUser): void {
    const action = user.is_active ? 'désactiver' : 'activer';
    if (!confirm(`Voulez-vous ${action} le compte de ${user.prenom} ${user.nom} ?`)) return;
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

  initials(prenom: string, nom: string): string {
    return `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
