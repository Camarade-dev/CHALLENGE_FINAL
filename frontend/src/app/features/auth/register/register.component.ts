import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-card">
      <h1>Inscription</h1>
      @if (error) {
        <p class="error">{{ error }}</p>
      }
      <form (ngSubmit)="onSubmit()" #f="ngForm">
        <label>
          Email
          <input type="email" name="email" [(ngModel)]="email" required email />
        </label>
        <label>
          Mot de passe (min. 6 caractères)
          <input type="password" name="password" [(ngModel)]="password" required minlength="6" />
        </label>
        <label>
          Nom (optionnel)
          <input type="text" name="name" [(ngModel)]="name" />
        </label>
        <button type="submit" [disabled]="f.invalid || loading">Créer le compte</button>
      </form>
      <p class="link"><a routerLink="/login">Déjà un compte ? Se connecter</a></p>
    </div>
  `,
  styles: [`
    .auth-card {
      max-width: 360px;
      margin: 2rem auto;
      padding: 1.5rem;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    h1 { margin: 0 0 1rem; font-size: 1.5rem; }
    .error { color: #b91c1c; font-size: 0.875rem; margin-bottom: 0.5rem; }
    label { display: block; margin-bottom: 1rem; }
    label input { width: 100%; padding: 0.5rem; margin-top: 0.25rem; box-sizing: border-box; }
    button {
      width: 100%;
      padding: 0.6rem;
      background: #7c3aed;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
    }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .link { margin-top: 1rem; text-align: center; }
    .link a { color: #7c3aed; }
  `],
})
export class RegisterComponent {
  email = '';
  password = '';
  name = '';
  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = '';
    this.loading = true;
    this.auth.register(this.email, this.password, this.name || undefined).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.loading = false;
        if (err?.status === 0 || err?.status === undefined) {
          this.error = 'Impossible de joindre le serveur. Vérifiez que le backend tourne (port 3000) et redémarrez le frontend (ng serve).';
        } else {
          const msg = err?.error?.message || err?.message;
          this.error = msg || 'Inscription impossible.';
          if (err?.status === 500 && msg?.includes('users')) {
            this.error += ' (La table "users" existe-t-elle en base ? Exécutez backend/db/schema.sql ou 000_users.sql)';
          }
        }
      },
      complete: () => (this.loading = false),
    });
  }
}
