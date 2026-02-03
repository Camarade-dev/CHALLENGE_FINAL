import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Panel } from '../../../core/services/panel.service';

@Component({
  selector: 'app-panel-list',
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <div class="panel-list">
      <div class="header">
        <h2 class="title">{{ isAdmin ? 'Panneaux' : 'Panneaux à contrôler' }}</h2>
        @if (isAdmin) {
          <a routerLink="/admin/panels" class="link-manage">Gestion panneaux</a>
        }
      </div>
      @if (loading) {
        <p class="empty">Chargement…</p>
      } @else if (!panels.length) {
        <p class="empty">Aucun panneau.</p>
      } @else {
        <ul class="list">
          @for (p of panels; track p.id) {
            <li class="item">
              <div class="info">
                <span class="name">{{ p.name }}</span>
                <span class="date">
                  @if (pendingPanelIds.includes(p.id)) {
                    <span class="badge-pending">En cours de vérification</span>
                  } @else {
                    Dernier contrôle :
                    {{ p.lastCheckedAt ? (p.lastCheckedAt | date:'dd/MM/yyyy à HH:mm') : 'Jamais' }}
                  }
                </span>
              </div>
              @if (!isAdmin) {
                <div class="actions">
                  @if (pendingPanelIds.includes(p.id)) {
                    <span class="label-pending">En attente</span>
                  } @else {
                    <button type="button" class="btn-check" (click)="onCheck(p)">
                      Soumettre contrôle
                    </button>
                  }
                </div>
              }
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
    .header { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 1rem; }
    .link-manage { font-size: 0.875rem; color: #7c3aed; text-decoration: none; }
    .link-manage:hover { text-decoration: underline; }
    .actions { display: flex; gap: 0.5rem; }
    .panel-list {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      padding: 1rem;
      height: 100%;
      min-height: 280px;
      overflow: auto;
    }
    .title {
      margin: 0 0 1rem;
      font-size: 1.125rem;
      color: #1a1a2e;
    }
    .empty {
      color: #666;
      margin: 0;
    }
    .list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #e9ecef;
    }
    .info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .name { font-weight: 600; color: #1a1a2e; }
    .date { font-size: 0.875rem; color: #666; }
    .btn-check {
      padding: 0.4rem 0.75rem;
      background: #7c3aed;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-check:hover { background: #6d28d9; }
    .badge-pending { color: #b45309; font-weight: 500; }
    .label-pending { font-size: 0.875rem; color: #666; }
  `],
})
export class PanelListComponent {
  @Input() panels: Panel[] = [];
  @Input() loading = false;
  @Input() isAdmin = false;
  @Input() pendingPanelIds: string[] = [];
  @Output() check = new EventEmitter<Panel>();

  onCheck(p: Panel): void {
    this.check.emit(p);
  }
}
