import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Panel } from '../../../core/services/panel.service';

@Component({
  selector: 'app-panel-list',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <h2>Panneaux à contrôler</h2>
    @if (loading) {
      <p>Chargement…</p>
    } @else if (!panels.length) {
      <p class="empty">Aucun panneau.</p>
    } @else {
      <ul class="panel-list">
        @for (p of panels; track p.id) {
          <li class="panel-item">
            <span class="name">{{ p.name }}</span>
            <span class="coords">{{ p.latitude | number:'1.4-4' }}, {{ p.longitude | number:'1.4-4' }}</span>
            @if (isAdmin) {
              <span class="badge">Admin : voir contrôles en attente dans Administration</span>
            } @else {
              @if (pendingPanelIds.includes(p.id)) {
                <span class="badge pending">En cours de vérification</span>
              } @else {
                <button type="button" class="btn-check" (click)="check.emit(p)">
                  Soumettre contrôle
                </button>
              }
            }
          </li>
        }
      </ul>
    }
  `,
  styles: [`
    h2 { margin: 0 0 0.5rem 0; font-size: 1.1rem; }
    .empty { color: #6b7280; margin: 0; }
    .panel-list { list-style: none; margin: 0; padding: 0; }
    .panel-item {
      padding: 0.6rem;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      margin-bottom: 0.5rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }
    .panel-item .name { font-weight: 500; }
    .panel-item .coords { font-family: monospace; font-size: 0.85rem; color: #6b7280; }
    .panel-item .badge { font-size: 0.8rem; color: #6b7280; }
    .panel-item .badge.pending { color: #d97706; }
    .btn-check {
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
      background: #059669;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-check:hover { background: #047857; }
  `],
})
export class PanelListComponent {
  @Input() panels: Panel[] = [];
  @Input() loading = false;
  @Input() isAdmin = false;
  @Input() pendingPanelIds: string[] = [];
  @Output() check = new EventEmitter<Panel>();
}
