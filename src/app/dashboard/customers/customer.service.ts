// src/app/dashboard/customers/customer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerListResponse, CustomerResponse, CustomerFormData } from './customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly API = `${environment.apiUrl}/customers`;

  constructor(private http: HttpClient) {}

  getCustomers(opts: { page?: number; limit?: number; search?: string } = {}): Observable<CustomerListResponse> {
    let params = new HttpParams();
    if (opts.page)   params = params.set('page',   opts.page.toString());
    if (opts.limit)  params = params.set('limit',  opts.limit.toString());
    if (opts.search) params = params.set('search', opts.search);
    return this.http.get<CustomerListResponse>(this.API, { params });
  }

  createCustomer(data: CustomerFormData): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(this.API, data);
  }

  updateCustomer(id: string, data: Partial<CustomerFormData>): Observable<CustomerResponse> {
    return this.http.patch<CustomerResponse>(`${this.API}/${id}`, data);
  }

  deleteCustomer(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.API}/${id}`);
  }
}
