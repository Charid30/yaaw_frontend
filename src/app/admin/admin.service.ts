// src/app/admin/admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminOverview {
  boutiques:   { total: number; configurees: number };
  gerants:     { total: number; actifs: number };
  ventes:      { aujourd_hui: number; ca_jour: number; ca_mois: number };
  recentSales: AdminSaleSummary[];
  shopsByType: { type: string; total: number }[];
}

export interface AdminShop {
  id:            string;
  nom:           string;
  type_commerce: string;
  devise:        string;
  tva_enabled:   boolean;
  tva_rate:      number;
  modules:       { stock: boolean; rapports: boolean; [k: string]: boolean };
  is_configured: boolean;
  created_at:    string;
  owner:         { id: string; nom: string; prenom: string; telephone: string; is_active: boolean } | null;
  stats:         { nb_ventes: number; ca_total: number; derniere_vente: string | null };
}

export interface AdminUser {
  id:         string;
  nom:        string;
  prenom:     string;
  telephone:  string;
  role:       string;
  is_active:  boolean;
  last_login: string | null;
  created_at: string;
  shop:       { id: string; nom: string; type_commerce: string } | null;
}

export interface AdminSaleSummary {
  id:            string;
  shop:          { id: string; nom: string; type?: string } | null;
  customer:      { id: string; nom: string } | null;
  montant_total: number;
  remise_montant: number;
  tva_montant:   number;
  mode_paiement: string;
  items:         { nom: string; quantite: number; montant: number }[];
  created_at:    string;
}

interface Pagination { total: number; page: number; limit: number; totalPages: number }

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly API = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getOverview(): Observable<{ success: boolean; data: AdminOverview }> {
    return this.http.get<{ success: boolean; data: AdminOverview }>(`${this.API}/overview`);
  }

  getShops(opts: { page?: number; limit?: number; search?: string } = {}):
    Observable<{ success: boolean; data: { shops: AdminShop[]; pagination: Pagination } }> {
    let p = new HttpParams();
    if (opts.page)   p = p.set('page',   opts.page);
    if (opts.limit)  p = p.set('limit',  opts.limit);
    if (opts.search) p = p.set('search', opts.search);
    return this.http.get<any>(`${this.API}/shops`, { params: p });
  }

  updateShop(id: string, body: { modules?: Record<string, boolean>; is_configured?: boolean }):
    Observable<{ success: boolean; data: { shop: Partial<AdminShop> } }> {
    return this.http.patch<any>(`${this.API}/shops/${id}`, body);
  }

  getUsers(opts: { page?: number; limit?: number; search?: string } = {}):
    Observable<{ success: boolean; data: { users: AdminUser[]; pagination: Pagination } }> {
    let p = new HttpParams();
    if (opts.page)   p = p.set('page',   opts.page);
    if (opts.limit)  p = p.set('limit',  opts.limit);
    if (opts.search) p = p.set('search', opts.search);
    return this.http.get<any>(`${this.API}/users`, { params: p });
  }

  toggleUser(id: string): Observable<{ success: boolean; data: { id: string; is_active: boolean } }> {
    return this.http.patch<any>(`${this.API}/users/${id}/toggle`, {});
  }

  getActivity(opts: { page?: number; limit?: number } = {}):
    Observable<{ success: boolean; data: { sales: AdminSaleSummary[]; pagination: Pagination } }> {
    let p = new HttpParams();
    if (opts.page)  p = p.set('page',  opts.page);
    if (opts.limit) p = p.set('limit', opts.limit);
    return this.http.get<any>(`${this.API}/activity`, { params: p });
  }
}
