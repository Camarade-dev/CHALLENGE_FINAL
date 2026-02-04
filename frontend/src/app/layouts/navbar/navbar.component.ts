import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="brand">
        Panneaux de la ville
      </a>
      <ul class="nav-links">
        @if (auth.isLoggedIn()) {
          @if (auth.isAdmin()) {
            <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Carte & Liste</a></li>
            <li><a routerLink="/admin/pending-checks" routerLinkActive="active">Contrôles en attente</a></li>
            <li><a routerLink="/admin/panels" routerLinkActive="active">Gestion panneaux</a></li>
          } @else {
            <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Carte & Panneaux à contrôler</a></li>
          }
          <li class="user">
            <span class="email">{{ auth.currentUser()?.email }}</span>
            <button type="button" class="btn-logout" (click)="auth.logout()">Déconnexion</button>
          </li>
        } @else {
          <li><a routerLink="/login">Connexion</a></li>
          <li><a routerLink="/register">Inscription</a></li>
        }
      </ul>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.5rem;
      background: red;
      color: #eee;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .brand {
      font-weight: 700;
      font-size: 1.25rem;
      color: #eee;
      text-decoration: none;
    }
    .brand:hover, .nav-links a:hover { color: #fff; }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .nav-links a {
      color: #ccc;
      text-decoration: none;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
    }
    .nav-links a.active { color: #7c3aed; background: rgba(124,58,237,0.15); }
    .user { display: flex; align-items: center; gap: 0.75rem; }
    .email { font-size: 0.875rem; color: #aaa; }
    .btn-logout {
      padding: 0.35rem 0.75rem;
      background: transparent;
      color: #ccc;
      border: 1px solid #555;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .btn-logout:hover { color: #fff; border-color: #777; }
  `],
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
