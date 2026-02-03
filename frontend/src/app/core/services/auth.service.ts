import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'panneaux_token';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
}

interface LoginResponse {
  success: boolean;
  data: { user: AuthUser; token: string };
}

interface MeResponse {
  success: boolean;
  data: { user: AuthUser };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private currentUserSignal = signal<AuthUser | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUser();
  }

  getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  }

  private setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  private clearToken(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  loadUser(): void {
    const token = this.getToken();
    if (!token) {
      this.currentUserSignal.set(null);
      return;
    }
    const decoded = this.decodeToken(token);
    if (decoded) {
      this.currentUserSignal.set({
        id: decoded.userId,
        email: decoded.email,
        name: null,
        role: decoded.role === 'ADMIN' ? 'ADMIN' : 'USER',
      });
    }
    this.http.get<MeResponse>(`${this.baseUrl}/me`).subscribe({
      next: (res) => {
        if (res.success && res.data.user) {
          this.currentUserSignal.set(res.data.user as AuthUser);
        } else {
          this.clearToken();
          this.currentUserSignal.set(null);
        }
      },
      error: () => {
        this.clearToken();
        this.currentUserSignal.set(null);
      },
    });
  }

  private decodeToken(token: string): { userId: string; email: string; role: string } | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const data = JSON.parse(json) as { userId?: string; email?: string; role?: string };
      return data?.userId && data?.email ? { userId: data.userId, email: data.email, role: data.role || 'USER' } : null;
    } catch {
      return null;
    }
  }

  register(email: string, password: string, name?: string): Observable<AuthUser> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/register`, { email, password, name })
      .pipe(
        tap((res) => {
          if (res.success) {
            this.setToken(res.data.token);
            this.currentUserSignal.set(res.data.user as AuthUser);
          }
        }),
        map((res) => res.data.user as AuthUser)
      );
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap((res) => {
          if (res.success) {
            this.setToken(res.data.token);
            this.currentUserSignal.set(res.data.user as AuthUser);
          }
        }),
        map((res) => res.data.user as AuthUser)
      );
  }

  logout(): void {
    this.clearToken();
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }
}
