// src/app/dashboard/reports/report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ReportKpis, CaDay, CaMonth, TopProduct, PaymentBreakdown, RecentSale,
} from './report.model';

const API = `${environment.apiUrl}/reports`;

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private http: HttpClient) {}

  getKpis(): Observable<{ success: boolean; data: ReportKpis }> {
    return this.http.get<{ success: boolean; data: ReportKpis }>(`${API}/kpis`);
  }

  getCaByDay(days = 30): Observable<{ success: boolean; data: CaDay[] }> {
    const params = new HttpParams().set('days', days);
    return this.http.get<{ success: boolean; data: CaDay[] }>(`${API}/ca/day`, { params });
  }

  getCaByMonth(months = 12): Observable<{ success: boolean; data: CaMonth[] }> {
    const params = new HttpParams().set('months', months);
    return this.http.get<{ success: boolean; data: CaMonth[] }>(`${API}/ca/month`, { params });
  }

  getTopProducts(period = 'month', limit = 10): Observable<{ success: boolean; data: TopProduct[] }> {
    const params = new HttpParams().set('period', period).set('limit', limit);
    return this.http.get<{ success: boolean; data: TopProduct[] }>(`${API}/top`, { params });
  }

  getPaymentBreakdown(period = 'month'): Observable<{ success: boolean; data: PaymentBreakdown[] }> {
    const params = new HttpParams().set('period', period);
    return this.http.get<{ success: boolean; data: PaymentBreakdown[] }>(`${API}/payments`, { params });
  }

  getRecentSales(limit = 10): Observable<{ success: boolean; data: RecentSale[] }> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<{ success: boolean; data: RecentSale[] }>(`${API}/recent`, { params });
  }
}
