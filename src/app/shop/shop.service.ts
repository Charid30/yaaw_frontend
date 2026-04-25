// src/app/shop/shop.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Shop, ShopResponse, CreateShopPayload } from './shop.model';

@Injectable({ providedIn: 'root' })
export class ShopService {
  private readonly API      = `${environment.apiUrl}/shops`;
  private readonly SHOP_KEY = 'yaahw_shop';

  // ── State ────────────────────────────────────────────────────
  private _shop = signal<Shop | null>(this._loadShop());
  readonly shop    = this._shop.asReadonly();
  readonly hasShop = computed(() => !!this._shop());

  constructor(private http: HttpClient) {}

  // ── Requêtes API ─────────────────────────────────────────────

  fetchMyShop(): Observable<ShopResponse> {
    return this.http.get<ShopResponse>(`${this.API}/mine`).pipe(
      tap((res) => this._setShop(res.data.shop))
    );
  }

  createShop(payload: CreateShopPayload): Observable<ShopResponse> {
    return this.http.post<ShopResponse>(this.API, payload).pipe(
      tap((res) => this._setShop(res.data.shop))
    );
  }

  updateShop(payload: Partial<CreateShopPayload>): Observable<ShopResponse> {
    return this.http.patch<ShopResponse>(`${this.API}/mine`, payload).pipe(
      tap((res) => this._setShop(res.data.shop))
    );
  }

  // ── Session ──────────────────────────────────────────────────

  /** Vider le shop du state et du localStorage (ex: à la déconnexion) */
  clearShop(): void {
    localStorage.removeItem(this.SHOP_KEY);
    this._shop.set(null);
  }

  private _setShop(shop: Shop): void {
    localStorage.setItem(this.SHOP_KEY, JSON.stringify(shop));
    this._shop.set(shop);
  }

  private _loadShop(): Shop | null {
    try {
      const raw = localStorage.getItem(this.SHOP_KEY);
      return raw ? (JSON.parse(raw) as Shop) : null;
    } catch {
      return null;
    }
  }
}
