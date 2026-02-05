import { Component, OnInit } from '@angular/core';
import { RewardService, Reward, RewardClaim } from '../../core/services/reward.service';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="rewards-page">
      <div class="header">
        <h1>Système de récompenses</h1>
        <a routerLink="/" class="back">← Retour</a>
      </div>

      <div class="points-card">
        <div class="points-display">
          <span class="label">Vos points</span>
          <span class="value">{{ myPoints | number }}</span>
          <span class="conversion">100 points = 1€</span>
        </div>
      </div>

      <div class="how-it-works">
        <h2>Comment gagner des points ?</h2>
        <p>Soumettez des formulaires de contrôle conformes sur les panneaux. Chaque contrôle validé par un administrateur vous rapporte des points selon l’ancienneté du dernier état des lieux :</p>
        <table class="points-table">
          <thead>
            <tr>
              <th>Ancienneté du dernier état des lieux</th>
              <th>Points attribués</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>&lt; 1 mois</td><td>5</td></tr>
            <tr><td>1 à 3 mois</td><td>10</td></tr>
            <tr><td>3 à 6 mois</td><td>20</td></tr>
            <tr><td>6 à 12 mois</td><td>30</td></tr>
            <tr><td>&gt; 12 mois</td><td>40</td></tr>
            <tr><td>Photo non exploitable</td><td>0</td></tr>
          </tbody>
        </table>
      </div>

      <div class="catalog">
        <h2>Récompenses disponibles</h2>
        @if (loadingCatalog) {
          <p>Chargement…</p>
        } @else {
          <div class="reward-grid">
            @for (r of rewards; track r.id) {
              <div class="reward-card" [class.affordable]="myPoints >= r.pointsRequired">
                <h3>{{ r.name }}</h3>
                @if (r.partners) {
                  <p class="partners"><strong>Partenaires :</strong> {{ r.partners }}</p>
                }
                @if (r.servicesMel) {
                  <p class="services"><strong>Services MEL :</strong> {{ r.servicesMel }}</p>
                }
                <div class="footer">
                  <span class="value">{{ r.valueEur }}€</span>
                  <span class="points">{{ r.pointsRequired | number }} pts</span>
                  <button
                    type="button"
                    class="btn-claim"
                    [disabled]="myPoints < r.pointsRequired || claimingId === r.id"
                    (click)="claim(r)"
                  >
                    {{ myPoints >= r.pointsRequired
                      ? (claimingId === r.id ? 'En cours…' : 'Échanger')
                      : 'Points insuffisants'
                    }}
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <div class="my-claims">
        <h2>Mes récompenses obtenues</h2>
        @if (loadingClaims) {
          <p>Chargement…</p>
        } @else if (claims.length === 0) {
          <p class="empty">Aucune récompense échangée pour le moment.</p>
        } @else {
          <ul class="claims-list">
            @for (c of claims; track c.id) {
              <li>
                <strong>{{ c.rewardName }}</strong>
                <span class="date">— {{ c.claimedAt | date:'dd/MM/yyyy' }}</span>
              </li>
            }
          </ul>
        }
      </div>
    </div>
  `,
  styles: [`
    .rewards-page {
      max-width: 900px;
      margin: 0 auto;
      padding: 1.5rem;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .header h1 { margin: 0; font-size: 1.5rem; }
    .back {
      color: #2563eb;
      text-decoration: none;
      font-size: 0.95rem;
    }
    .points-card {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
    }
    .points-display {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .points-display .label { font-size: 1rem; opacity: 0.9; }
    .points-display .value { font-size: 2rem; font-weight: 700; }
    .points-display .conversion { font-size: 0.85rem; opacity: 0.85; }
    .how-it-works {
      background: #fff;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      border: 1px solid #e5e7eb;
    }
    .how-it-works h2 { margin: 0 0 0.5rem; font-size: 1.1rem; }
    .how-it-works p { margin: 0 0 1rem; color: #4b5563; font-size: 0.95rem; }
    .points-table {
      width: 100%;
      border-collapse: collapse;
    }
    .points-table th, .points-table td {
      padding: 0.5rem 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    .points-table th { background: #f9fafb; font-weight: 600; }
    .catalog {
      background: #fff;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      border: 1px solid #e5e7eb;
    }
    .catalog h2 { margin: 0 0 1rem; font-size: 1.1rem; }
    .reward-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }
    .reward-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1rem;
      transition: box-shadow 0.2s;
    }
    .reward-card.affordable {
      border-color: #059669;
      background: #f0fdf4;
    }
    .reward-card h3 { margin: 0 0 0.5rem; font-size: 1rem; }
    .reward-card .partners, .reward-card .services {
      margin: 0.25rem 0;
      font-size: 0.8rem;
      color: #6b7280;
    }
    .reward-card .footer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.75rem;
      flex-wrap: wrap;
    }
    .reward-card .value { font-weight: 600; color: #059669; }
    .reward-card .points { font-size: 0.9rem; color: #6b7280; }
    .btn-claim {
      margin-left: auto;
      padding: 0.35rem 0.75rem;
      font-size: 0.85rem;
      background: #059669;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-claim:hover:not(:disabled) {
      background: #047857;
    }
    .btn-claim:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
    .my-claims {
      background: #fff;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      border: 1px solid #e5e7eb;
    }
    .my-claims h2 { margin: 0 0 0.75rem; font-size: 1.1rem; }
    .my-claims .empty { color: #6b7280; font-style: italic; }
    .claims-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .claims-list li {
      padding: 0.35rem 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .claims-list .date { font-size: 0.85rem; color: #6b7280; }
  `],
})
export class RewardsComponent implements OnInit {
  myPoints = 0;
  rewards: Reward[] = [];
  claims: RewardClaim[] = [];
  loadingCatalog = true;
  loadingClaims = true;
  claimingId: string | null = null;

  constructor(
    private rewardService: RewardService,
    public auth: AuthService
  ) {}

  private refreshNavbarPoints(): void {
    this.auth.refreshUser();
  }

  ngOnInit(): void {
    this.loadPoints();
    this.loadCatalog();
    this.loadClaims();
    this.refreshNavbarPoints(); // Met à jour les points affichés dans la navbar
  }

  loadPoints(): void {
    this.rewardService.getMyPoints().subscribe({
      next: (pts: number) => (this.myPoints = pts),
    });
  }

  loadCatalog(): void {
    this.loadingCatalog = true;
    this.rewardService.getCatalog().subscribe({
      next: (data: Reward[]) => {
        this.rewards = data;
        this.loadingCatalog = false;
      },
      error: () => {
        this.loadingCatalog = false;
      },
    });
  }

  loadClaims(): void {
    this.loadingClaims = true;
    this.rewardService.getMyClaims().subscribe({
      next: (data: RewardClaim[]) => {
        this.claims = data;
        this.loadingClaims = false;
      },
      error: () => {
        this.loadingClaims = false;
      },
    });
  }

  claim(r: Reward): void {
    if (this.myPoints < r.pointsRequired) return;
    this.claimingId = r.id;
    this.rewardService.claimReward(r.id).subscribe({
      next: (claim: RewardClaim) => {
        this.myPoints -= r.pointsRequired;
        this.claims = [claim, ...this.claims];
        this.claimingId = null;
        this.refreshNavbarPoints();
      },
      error: () => {
        this.claimingId = null;
      },
    });
  }
}
