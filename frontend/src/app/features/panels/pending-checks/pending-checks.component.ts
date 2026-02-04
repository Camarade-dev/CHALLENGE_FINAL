import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
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
                  <a [href]="c.photoUrl" target="_blank" rel="noopener" class="photo-link">Voir la photo</a>
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
    .photo-link { font-size: 0.875rem; color: #7c3aed; }
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

  constructor(private panelService: PanelService) {}

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
