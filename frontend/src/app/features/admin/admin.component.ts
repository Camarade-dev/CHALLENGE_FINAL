import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PanelManagementComponent } from '../panels/panel-management/panel-management.component';
import { PendingChecksComponent } from '../panels/pending-checks/pending-checks.component';
import { MelManagementComponent } from '../mel/mel-management/mel-management.component';

type AdminTab = 'panels' | 'pending' | 'mel';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, PanelManagementComponent, PendingChecksComponent, MelManagementComponent],
  template: `
    <div class="admin-page">
      <div class="top">
        <h1>Administration</h1>
        <a routerLink="/" class="back">Retour à la carte</a>
      </div>
      <div class="tabs">
        <button type="button" [class.active]="tab === 'panels'" (click)="tab = 'panels'">Panneaux</button>
        <button type="button" [class.active]="tab === 'pending'" (click)="tab = 'pending'">Contrôles en attente</button>
        <button type="button" [class.active]="tab === 'mel'" (click)="tab = 'mel'">Signalisation MEL</button>
      </div>
      @switch (tab) {
        @case ('panels') {
          <app-panel-management />
        }
        @case ('pending') {
          <app-pending-checks />
        }
        @case ('mel') {
          <app-mel-management />
        }
      }
    </div>
  `,
  styles: [`
    .admin-page { max-width: 1000px; margin: 0 auto; padding: 1rem; }
    .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .top h1 { margin: 0; font-size: 1.5rem; }
    .back { color: #2563eb; text-decoration: none; }
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .tabs button {
      padding: 0.5rem 1rem;
      border: 1px solid #e5e7eb;
      background: #fff;
      border-radius: 6px;
      cursor: pointer;
    }
    .tabs button.active { background: #2563eb; color: #fff; border-color: #2563eb; }
  `],
})
export class AdminComponent {
  tab: AdminTab = 'panels';
}
