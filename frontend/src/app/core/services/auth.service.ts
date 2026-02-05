import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  points?: number;
}

interface LoginResponse {
  success: boolean;
  data: { user: AuthUser };
}

interface MeResponse {
  success: boolean;
  data: { user: AuthUser };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private currentUserSignal = signal<AuthUser | null>(null);
  private authReadySignal = signal(false);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');
  /** true une fois que loadUser a terminé (succès ou erreur). */
  readonly authReady = this.authReadySignal.asReadonly();

  private readonly platformId = inject(PLATFORM_ID);
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    if (this.isBrowser) {
      this.loadUser();
    } else {
      this.authReadySignal.set(true);
    }
  }

  /** Attend que l'état d'auth soit résolu (utile pour le guard). */
  waitForAuth(): Promise<boolean> {
    if (this.authReadySignal()) return Promise.resolve(this.currentUserSignal() !== null);
    return new Promise((resolve) => {
      const check = () => {
        if (this.authReadySignal()) {
          resolve(this.currentUserSignal() !== null);
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  /** Le token est dans un cookie HttpOnly : pas accessible en JS. Les requêtes avec withCredentials envoient le cookie automatiquement. */
  getToken(): string | null {
    return null;
  }

  /** Recharge l'utilisateur depuis l'API (ex. après attribution ou échange de points). */
  refreshUser(): void {
    this.loadUser();
  }

  private loadUser(): void {
    this.authReadySignal.set(false);
    this.http.get<MeResponse>(`${this.baseUrl}/me`).subscribe({
      next: (res) => {
        if (res.success && res.data.user) {
          this.currentUserSignal.set(res.data.user as AuthUser);
        } else {
          this.currentUserSignal.set(null);
        }
        this.authReadySignal.set(true);
      },
      error: () => {
        this.currentUserSignal.set(null);
        this.authReadySignal.set(true);
      },
    });
  }

  register(
    email: string,
    password: string,
    options?: { name?: string; firstName?: string; lastName?: string; age?: number | null }
  ): Observable<AuthUser> {
    const body = { email, password, ...options };
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/register`, body)
      .pipe(
        tap((res) => {
          if (res.success) {
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
            this.currentUserSignal.set(res.data.user as AuthUser);
          }
        }),
        map((res) => res.data.user as AuthUser)
      );
  }

  logout(): void {
    this.http.post(`${this.baseUrl}/logout`, {}).subscribe();
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }
}
