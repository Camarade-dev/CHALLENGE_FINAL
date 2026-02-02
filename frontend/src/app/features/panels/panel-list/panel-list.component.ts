import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Panel } from '../../../core/services/panel.service';

@Component({
  selector: 'app-panel-list',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="panel-list">
      <h2 class="title">Panneaux</h2>
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
                  Dernier contrôle :
                  {{ p.lastCheckedAt ? (p.lastCheckedAt | date:'dd/MM/yyyy à HH:mm') : 'Jamais' }}
                </span>
              </div>
              <button type="button" class="btn-check" (click)="onCheck(p)">
                Marquer contrôlé
              </button>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: [`
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
  `],
})
export class PanelListComponent {
  @Input() panels: Panel[] = [];
  @Input() loading = false;
  @Output() check = new EventEmitter<Panel>();

  onCheck(p: Panel): void {
    this.check.emit(p);
  }
}
