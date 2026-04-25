// src/app/dashboard/products/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductsResponse, Category, CategoryResponse, ProductFormData } from './product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly PRODUCTS_API   = `${environment.apiUrl}/products`;
  private readonly CATEGORIES_API = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  // ── Produits ─────────────────────────────────────────────

  getProducts(filters: {
    page?:         number;
    limit?:        number;
    search?:       string;
    categorie_id?: string;
    is_active?:    string;
  } = {}): Observable<ProductsResponse> {
    let params = new HttpParams();
    if (filters.page)         params = params.set('page',         filters.page);
    if (filters.limit)        params = params.set('limit',        filters.limit);
    if (filters.search)       params = params.set('search',       filters.search);
    if (filters.categorie_id) params = params.set('categorie_id', filters.categorie_id);
    if (filters.is_active)    params = params.set('is_active',    filters.is_active);

    return this.http.get<ProductsResponse>(this.PRODUCTS_API, { params });
  }

  createProduct(data: ProductFormData): Observable<{ success: boolean; data: { product: Product } }> {
    return this.http.post<{ success: boolean; data: { product: Product } }>(this.PRODUCTS_API, data);
  }

  updateProduct(id: string, data: Partial<ProductFormData>): Observable<{ success: boolean; data: { product: Product } }> {
    return this.http.patch<{ success: boolean; data: { product: Product } }>(`${this.PRODUCTS_API}/${id}`, data);
  }

  deleteProduct(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.PRODUCTS_API}/${id}`);
  }

  // ── Catégories ────────────────────────────────────────────

  getCategories(): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(this.CATEGORIES_API);
  }

  createCategory(data: { nom: string; couleur: string; icone: string }): Observable<{ success: boolean; data: { category: Category } }> {
    return this.http.post<{ success: boolean; data: { category: Category } }>(this.CATEGORIES_API, data);
  }

  deleteCategory(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.CATEGORIES_API}/${id}`);
  }
}
