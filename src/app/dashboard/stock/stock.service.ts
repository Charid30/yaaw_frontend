// src/app/dashboard/stock/stock.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StockMovement, StockSummary } from './stock.model';

interface SummaryResponse  { success: boolean; message: string; data: StockSummary }
interface MovementsResponse {
  success: boolean; message: string;
  data: StockMovement[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
interface MovementResponse  { success: boolean; message: string; data: { product: unknown; movement: StockMovement } }

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly API = `${environment.apiUrl}/stock`;
  constructor(private http: HttpClient) {}

  getSummary(): Observable<SummaryResponse> {
    return this.http.get<SummaryResponse>(`${this.API}/summary`);
  }

  getMovements(params?: {
    product_id?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Observable<MovementsResponse> {
    let p = new HttpParams();
    if (params?.product_id) p = p.set('product_id', params.product_id);
    if (params?.type)       p = p.set('type', params.type);
    if (params?.page)       p = p.set('page', params.page);
    if (params?.limit)      p = p.set('limit', params.limit);
    return this.http.get<MovementsResponse>(`${this.API}/movements`, { params: p });
  }

  getLowStock(threshold = 5): Observable<{ success: boolean; message: string; data: unknown[] }> {
    return this.http.get<{ success: boolean; message: string; data: unknown[] }>(
      `${this.API}/low`, { params: new HttpParams().set('threshold', threshold) }
    );
  }

  addStock(body: { product_id: string; quantite: number; motif?: string }): Observable<MovementResponse> {
    return this.http.post<MovementResponse>(`${this.API}/entries`, body);
  }

  removeStock(body: { product_id: string; quantite: number; motif?: string }): Observable<MovementResponse> {
    return this.http.post<MovementResponse>(`${this.API}/exits`, body);
  }

  adjustStock(body: { product_id: string; new_qty: number; motif?: string }): Observable<MovementResponse> {
    return this.http.post<MovementResponse>(`${this.API}/adjustments`, body);
  }
}
