// src/app/admin/pages/activity/admin-activity.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Activity, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-angular';
import { AdminApiService, AdminSaleSummary } from '../../admin.service';

@Component({
  selector: 'app-admin-activity',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-activity.html',
  styleUrl:    './admin-activity.scss',
})
export class AdminActivityComponent implements OnInit {
  sales       = signal<AdminSaleSummary[]>([]);
  loading     = signal(true);
  currentPage = signal(1);
  totalPages  = signal(1);
  total       = signal(0);
  expandedId  = signal<string | null>(null);
  readonly limit = 30;

  readonly icons = { Activity, ChevronLeft, ChevronRight, ChevronDown, ChevronUp };

  readonly MODE_LABELS: Partial<Record<string, string>> = {
    especes:      '💵 Espèces',
    orange_money: '🟠 Orange Money',
    moov_money:   '🔵 Moov Money',
  };

  constructor(private adminApi: AdminApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.adminApi.getActivity({ page: this.currentPage(), limit: this.limit }).subscribe({
      next: (res) => {
        this.sales.set(res.data.sales);
        this.total.set(res.data.pagination.total);
        this.totalPages.set(res.data.pagination.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  prevPage(): void { if (this.currentPage() > 1) { this.currentPage.update(p => p - 1); this.load(); } }
  nextPage(): void { if (this.currentPage() < this.totalPages()) { this.currentPage.update(p => p + 1); this.load(); } }

  toggleExpand(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  formatPrice(n: number): string { return n.toLocaleString('fr-FR') + ' FCFA'; }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
