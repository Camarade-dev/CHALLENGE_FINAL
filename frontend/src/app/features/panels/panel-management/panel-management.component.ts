import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PanelService, Panel } from '../../../core/services/panel.service';

@Component({
  selector: 'app-panel-management',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="management">
      <div class="top">
        <h1>Gestion des panneaux</h1>
      </div>

      <section class="form-section">
        <h2>{{ editingId ? 'Modifier le panneau' : 'Ajouter un panneau' }}</h2>
        <form (ngSubmit)="onSubmit()" #f="ngForm">
          <div class="fields">
            <label>Nom <input type="text" name="name" [(ngModel)]="form.name" required /></label>
            <label>Latitude <input type="number" step="any" name="latitude" [(ngModel)]="form.latitude" required /></label>
            <label>Longitude <input type="number" step="any" name="longitude" [(ngModel)]="form.longitude" required /></label>
          </div>
          <div class="buttons">
            <button type="submit" [disabled]="f.invalid || saving">
              {{ editingId ? 'Enregistrer' : 'Ajouter' }}
            </button>
            @if (editingId) {
              <button type="button" class="cancel" (click)="cancelEdit()">Annuler</button>
            }
          </div>
        </form>
      </section>

      <section class="table-section">
        <h2>Liste des panneaux</h2>
        @if (loading) {
          <p>Chargement…</p>
        } @else if (!panels.length) {
          <p class="empty">Aucun panneau.</p>
        } @else {
          <table class="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Dernier contrôle</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (p of panels; track p.id) {
                <tr>
                  <td>{{ p.name }}</td>
                  <td>{{ p.latitude }}</td>
                  <td>{{ p.longitude }}</td>
                  <td>{{ p.lastCheckedAt ? (p.lastCheckedAt | date:'dd/MM/yyyy HH:mm') : 'Jamais' }}</td>
                  <td class="actions">
                    <button type="button" class="btn-edit" (click)="startEdit(p)">Modifier</button>
                    <button type="button" class="btn-delete" (click)="confirmDelete(p)">Supprimer</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </section>

      @if (deleteTarget) {
        <div class="modal-overlay" (click)="deleteTarget = null">
          <div class="modal" (click)="$event.stopPropagation()">
            <p>Supprimer le panneau « {{ deleteTarget.name }} » ?</p>
            <div class="modal-actions">
              <button type="button" class="btn-delete" (click)="doDelete()">Supprimer</button>
              <button type="button" class="cancel" (click)="deleteTarget = null">Annuler</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .management { max-width: 900px; margin: 0 auto; padding: 1rem; }
    .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .top h1 { margin: 0; font-size: 1.5rem; }
    .back { color: #7c3aed; text-decoration: none; }
    .form-section, .table-section {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .form-section h2, .table-section h2 { margin: 0 0 1rem; font-size: 1.125rem; }
    .fields { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
    .fields label { display: flex; flex-direction: column; gap: 0.25rem; }
    .fields input { padding: 0.5rem; width: 140px; }
    .buttons { display: flex; gap: 0.5rem; }
    button { padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; border: none; }
    button[type="submit"] { background: #7c3aed; color: #fff; }
    .cancel { background: #e5e7eb; color: #374151; }
    .btn-edit { background: #3b82f6; color: #fff; font-size: 0.875rem; }
    .btn-delete { background: #dc2626; color: #fff; font-size: 0.875rem; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .table th { font-weight: 600; }
    .actions { display: flex; gap: 0.5rem; }
    .empty { color: #666; margin: 0; }
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center; z-index: 100;
    }
    .modal { background: #fff; padding: 1.5rem; border-radius: 8px; min-width: 320px; }
    .modal p { margin: 0 0 1rem; }
    .modal-actions { display: flex; gap: 0.5rem; }
  `],
})
export class PanelManagementComponent implements OnInit {
  panels: Panel[] = [];
  loading = true;
  saving = false;
  editingId: string | null = null;
  deleteTarget: Panel | null = null;
  form = { name: '', latitude: 48.8566, longitude: 2.3522 };

  constructor(private panelService: PanelService) {}

  ngOnInit(): void {
    this.loadPanels();
  }

  loadPanels(): void {
    this.loading = true;
    this.panelService.getAll().subscribe({
      next: (data) => { this.panels = data; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  onSubmit(): void {
    if (this.editingId) {
      this.saving = true;
      this.panelService.update(this.editingId, this.form).subscribe({
        next: (updated) => {
          const i = this.panels.findIndex((p) => p.id === updated.id);
          if (i !== -1) this.panels[i] = updated;
          this.cancelEdit();
          this.saving = false;
        },
        error: () => { this.saving = false; },
      });
    } else {
      this.saving = true;
      this.panelService.create(this.form).subscribe({
        next: (created) => {
          this.panels = [created, ...this.panels];
          this.form = { name: '', latitude: 48.8566, longitude: 2.3522 };
          this.saving = false;
        },
        error: () => { this.saving = false; },
      });
    }
  }

  startEdit(p: Panel): void {
    this.editingId = p.id;
    this.form = { name: p.name, latitude: p.latitude, longitude: p.longitude };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form = { name: '', latitude: 48.8566, longitude: 2.3522 };
  }

  confirmDelete(p: Panel): void {
    this.deleteTarget = p;
  }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.panelService.delete(this.deleteTarget.id).subscribe({
      next: () => {
        this.panels = this.panels.filter((x) => x.id !== this.deleteTarget!.id);
        this.deleteTarget = null;
      },
    });
  }
}
