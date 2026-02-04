import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { PanelService, PendingCheck } from '../../../core/services/panel.service';

const STATE_LABELS: Record<string, string> = {
  OK: 'Bon',
  DAMAGED: 'Endommagé',
  MISSING: 'Absent',
  OTHER: 'Autre',
};

@Component({
  selector: 'app-pending-checks',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="pending-page">
      <div class="top">
        <h1>Contrôles en attente de validation</h1>
      </div>
      @if (loading) {
        <p>Chargement…</p>
      } @else if (!checks.length) {
        <p class="empty">Aucun contrôle en attente.</p>
      } @else {
        <ul class="list">
          @for (c of checks; track c.id) {
            <li class="item">
              <div class="info">
                <span class="panel-name">{{ c.panelName }}</span>
                <span class="meta">Par {{ c.userEmail }} · {{ c.checkedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                <span class="state">État : {{ stateLabel(c.state) }}</span>
                @if (c.comment) {
                  <p class="comment">{{ c.comment }}</p>
                }
                @if (c.photoUrl) {
                  <button type="button" class="photo-link" (click)="showPhoto(c.photoUrl!)">Voir la photo</button>
                }
              </div>
              <button
                type="button"
                class="btn-validate"
                (click)="validate(c.id)"
                [disabled]="validatingId === c.id"
              >
                {{ validatingId === c.id ? 'Validation...' : 'Valider' }}
              </button>
            </li>
          }
        </ul>
      }
    </div>

    @if (photoModalUrl) {
      <div class="photo-overlay" (click)="closePhoto()">
        <div class="photo-modal" (click)="$event.stopPropagation()">
          <img [src]="photoModalUrl" alt="Photo du contrôle" />
          <button type="button" class="close-btn" (click)="closePhoto()">Fermer</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .pending-page { max-width: 640px; margin: 0 auto; padding: 1rem; }
    .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .top h1 { margin: 0; font-size: 1.25rem; }
    .back { color: #7c3aed; text-decoration: none; }
    .empty { color: #666; }
    .list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 1rem; }
    .item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border: 1px solid #e9ecef;
    }
    .info { display: flex; flex-direction: column; gap: 0.35rem; }
    .panel-name { font-weight: 600; color: #1a1a2e; }
    .meta { font-size: 0.875rem; color: #666; }
    .state { font-size: 0.875rem; }
    .comment { margin: 0.5rem 0 0; font-size: 0.875rem; color: #374151; white-space: pre-wrap; }
    .photo-link {
      font-size: 0.875rem;
      color: #7c3aed;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      text-decoration: underline;
    }
    .photo-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .photo-modal {
      background: #fff;
      padding: 1rem;
      border-radius: 8px;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
    .photo-modal img {
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
    }
    .photo-modal .close-btn {
      padding: 0.5rem 1rem;
      background: #e5e7eb;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-validate {
      padding: 0.5rem 1rem;
      background: #059669;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-validate:hover:not(:disabled) { background: #047857; }
    .btn-validate:disabled { opacity: 0.7; cursor: not-allowed; }
  `],
})
export class PendingChecksComponent implements OnInit {
  checks: PendingCheck[] = [];
  loading = true;
  validatingId: string | null = null;
  photoModalUrl: SafeUrl | null = null;

  constructor(
    private panelService: PanelService,
    private sanitizer: DomSanitizer
  ) {}

  showPhoto(url: string): void {
    // Toujours afficher via la même origine (chemin relatif) pour passer par le proxy
    const path = this.toPhotoPath(url);
    this.photoModalUrl = this.sanitizer.bypassSecurityTrustResourceUrl(path);
  }

  /** Convertit une URL complète ou un chemin en chemin relatif pour le chargement. */
  private toPhotoPath(url: string): string {
    if (!url) return url;
    if (url.startsWith('http') && url.includes('/uploads/')) {
      const match = url.match(/\/uploads\/[\s\S]+/);
      return match ? match[0] : url;
    }
    return url.startsWith('/') ? url : `/${url}`;
  }

  closePhoto(): void {
    this.photoModalUrl = null;
  }

  ngOnInit(): void {
    this.load();
  }

  stateLabel(state: string): string {
    return STATE_LABELS[state] ?? state;
  }

  load(): void {
    this.loading = true;
    this.panelService.getPendingChecks().subscribe({
      next: (data) => {
        this.checks = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  validate(checkId: string): void {
    this.validatingId = checkId;
    this.panelService.validateCheck(checkId).subscribe({
      next: () => {
        this.checks = this.checks.filter((c) => c.id !== checkId);
        this.validatingId = null;
      },
      error: () => {
        this.validatingId = null;
      },
    });
  }
}
