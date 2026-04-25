// src/app/dashboard/sales/sale.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sale, CreateSalePayload, SaleFilters } from './sale.model';

export interface SaleResponse   { success: boolean; message: string; data: { sale: Sale } }
export interface SalesResponse  {
  success: boolean; message: string;
  data: Sale[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class SaleService {
  private readonly API = `${environment.apiUrl}/sales`;
  constructor(private http: HttpClient) {}

  createSale(payload: CreateSalePayload): Observable<SaleResponse> {
    return this.http.post<SaleResponse>(this.API, payload);
  }

  getSales(filters: SaleFilters = {}): Observable<SalesResponse> {
    let params = new HttpParams();
    if (filters.page)          params = params.set('page',          filters.page.toString());
    if (filters.limit)         params = params.set('limit',         filters.limit.toString());
    if (filters.date_debut)    params = params.set('date_debut',    filters.date_debut);
    if (filters.date_fin)      params = params.set('date_fin',      filters.date_fin);
    if (filters.mode_paiement) params = params.set('mode_paiement', filters.mode_paiement);
    if (filters.customer_id)   params = params.set('customer_id',   filters.customer_id);
    if (filters.search)        params = params.set('search',        filters.search);
    return this.http.get<SalesResponse>(this.API, { params });
  }

  getSaleById(id: string): Observable<{ success: boolean; data: { sale: Sale } }> {
    return this.http.get<{ success: boolean; data: { sale: Sale } }>(`${this.API}/${id}`);
  }
}
