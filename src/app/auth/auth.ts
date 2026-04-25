// src/app/auth/auth.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  User,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from './models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'yaahw_token';

  // ── State (signals) ────────────────────────────────────────
  private _user = signal<User | null>(this._loadUser());
  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  readonly user = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly isGerant = computed(() => this._user()?.role === 'GERANT');

  constructor(private http: HttpClient, private router: Router) {}

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, payload).pipe(
      tap((res) => this._setSession(res))
    );
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, payload).pipe(
      tap((res) => this._setSession(res))
    );
  }

  logout(): void {
    this.http.post(`${this.API}/logout`, {}).subscribe({
      complete: () => this._clearSession(),
      error: () => this._clearSession(),
    });
  }

  fetchMe(): Observable<{ success: boolean; data: { user: User } }> {
    return this.http
      .get<{ success: boolean; data: { user: User } }>(`${this.API}/me`)
      .pipe(tap((res) => this._user.set(res.data.user)));
  }

  private _setSession(res: AuthResponse): void {
    const { user, token } = res.data;
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem('yaahw_user', JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }

  private _clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('yaahw_user');
    localStorage.removeItem('yaahw_shop'); // purge shop cache
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  private _loadUser(): User | null {
    try {
      const raw = localStorage.getItem('yaahw_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
