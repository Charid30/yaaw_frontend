// src/app/dashboard/suppliers/supplier.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SupplierListResponse, SupplierResponse, SupplierFormData } from './supplier.model';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly API = `${environment.apiUrl}/suppliers`;

  constructor(private http: HttpClient) {}

  getSuppliers(opts: { page?: number; limit?: number; search?: string } = {}): Observable<SupplierListResponse> {
    let params = new HttpParams();
    if (opts.page)   params = params.set('page',   opts.page.toString());
    if (opts.limit)  params = params.set('limit',  opts.limit.toString());
    if (opts.search) params = params.set('search', opts.search);
    return this.http.get<SupplierListResponse>(this.API, { params });
  }

  createSupplier(data: SupplierFormData): Observable<SupplierResponse> {
    return this.http.post<SupplierResponse>(this.API, data);
  }

  updateSupplier(id: string, data: Partial<SupplierFormData>): Observable<SupplierResponse> {
    return this.http.patch<SupplierResponse>(`${this.API}/${id}`, data);
  }

  deleteSupplier(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API}/${id}`);
  }
}
