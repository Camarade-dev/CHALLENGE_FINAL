import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
        <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Carte & Liste</a></li>
      </ul>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.5rem;
      background: #1a1a2e;
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
  `],
})
export class NavbarComponent {}
