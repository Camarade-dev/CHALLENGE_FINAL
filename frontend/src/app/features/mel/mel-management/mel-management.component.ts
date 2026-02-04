import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MelService,
  MelProperty,
  MelSign,
  MelSignType,
  MelReport,
} from '../../../core/services/mel.service';

type Tab = 'properties' | 'signs' | 'signTypes' | 'reports';

@Component({
  selector: 'app-mel-management',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="management">
      <div class="tabs">
        <button type="button" [class.active]="tab === 'properties'" (click)="tab = 'properties'">Propriétés</button>
        <button type="button" [class.active]="tab === 'signs'" (click)="tab = 'signs'">Signes</button>
        <button type="button" [class.active]="tab === 'signTypes'" (click)="tab = 'signTypes'">Types de signes</button>
        <button type="button" [class.active]="tab === 'reports'" (click)="tab = 'reports'">Signalements</button>
      </div>

      @switch (tab) {
        @case ('properties') {
          <section class="section">
            <h2>{{ editProp ? 'Modifier la propriété' : 'Ajouter une propriété MEL' }}</h2>
            <form (ngSubmit)="submitProperty()" #fp="ngForm">
              <div class="fields">
                <label>Lat <input type="number" step="any" name="lat" [(ngModel)]="propForm.lat" required /></label>
                <label>Lon <input type="number" step="any" name="lon" [(ngModel)]="propForm.lon" required /></label>
                <label>Espace naturel <input type="checkbox" name="naturalSpace" [(ngModel)]="propForm.naturalSpace" /></label>
                <label>Points <input type="number" name="pointsValue" [(ngModel)]="propForm.pointsValue" required /></label>
                <label>Nb signes <input type="number" name="numberOfSigns" [(ngModel)]="propForm.numberOfSigns" required /></label>
              </div>
              <div class="buttons">
                <button type="submit" [disabled]="fp.invalid || saving">{{ editProp ? 'Enregistrer' : 'Ajouter' }}</button>
                @if (editProp) {
                  <button type="button" class="cancel" (click)="cancelEditProperty()">Annuler</button>
                }
              </div>
            </form>
            <h3>Liste</h3>
            @if (loadingProps) { <p>Chargement…</p> }
            @else if (!properties.length) { <p class="empty">Aucune propriété.</p> }
            @else {
              <table class="table">
                <thead><tr><th>Lat</th><th>Lon</th><th>Naturel</th><th>Points</th><th>Signes</th><th></th></tr></thead>
                <tbody>
                  @for (p of properties; track locKey(p)) {
                    <tr>
                      <td>{{ p.localisation.lat }}</td><td>{{ p.localisation.lon }}</td>
                      <td>{{ p.naturalSpace ? 'Oui' : 'Non' }}</td><td>{{ p.pointsValue }}</td><td>{{ p.numberOfSigns }}</td>
                      <td class="actions">
                        <button type="button" class="btn-edit" (click)="startEditProperty(p)">Modifier</button>
                        <button type="button" class="btn-delete" (click)="confirmDeleteProperty(p)">Supprimer</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
            @if (deleteProp) {
              <div class="modal-overlay" (click)="deleteProp = null">
                <div class="modal" (click)="$event.stopPropagation()">
                  <p>Supprimer la propriété ({{ deleteProp.localisation.lat }}, {{ deleteProp.localisation.lon }}) ?</p>
                  <div class="modal-actions">
                    <button type="button" class="btn-delete" (click)="doDeleteProperty()">Supprimer</button>
                    <button type="button" class="cancel" (click)="deleteProp = null">Annuler</button>
                  </div>
                </div>
              </div>
            }
          </section>
        }
        @case ('signs') {
          <section class="section">
            <h2>Ajouter un signe</h2>
            <form (ngSubmit)="submitSign()" #fs="ngForm">
              <div class="fields">
                <label>Lat <input type="number" step="any" name="lat" [(ngModel)]="signForm.lat" required /></label>
                <label>Lon <input type="number" step="any" name="lon" [(ngModel)]="signForm.lon" required /></label>
                <label>Type <select name="signType" [(ngModel)]="signForm.signType" required>
                  @for (st of signTypes; track st.signType) {
                    <option [value]="st.signType">{{ st.signType }}</option>
                  }
                </select></label>
              </div>
              <button type="submit" [disabled]="fs.invalid || saving">Ajouter</button>
            </form>
            <h3>Liste des signes</h3>
            @if (loadingSigns) { <p>Chargement…</p> }
            @else if (!signs.length) { <p class="empty">Aucun signe.</p> }
            @else {
              <table class="table">
                <thead><tr><th>ID</th><th>Lat</th><th>Lon</th><th>Type</th><th>Présent</th><th></th></tr></thead>
                <tbody>
                  @for (s of signs; track s.signID) {
                    <tr>
                      <td>{{ s.signID }}</td><td>{{ s.localisation.lat }}</td><td>{{ s.localisation.lon }}</td>
                      <td>{{ s.signType }}</td><td>{{ s.present ? 'Oui' : 'Non' }}</td>
                      <td><button type="button" class="btn-delete" (click)="deleteSign(s)">Supprimer</button></td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </section>
        }
        @case ('signTypes') {
          <section class="section">
            <h2>Ajouter un type de signe</h2>
            <form (ngSubmit)="submitSignType()" #fst="ngForm">
              <label>Nom du type <input type="text" name="signType" [(ngModel)]="newSignTypeName" required /></label>
              <button type="submit" [disabled]="fst.invalid || saving">Ajouter</button>
            </form>
            <h3>Liste des types</h3>
            @if (loadingSignTypes) { <p>Chargement…</p> }
            @else if (!signTypes.length) { <p class="empty">Aucun type.</p> }
            @else {
              <ul class="sign-type-list">
                @for (st of signTypes; track st.signType) {
                  <li>
                    {{ st.signType }}
                    <button type="button" class="btn-delete small" (click)="deleteSignType(st.signType)">Supprimer</button>
                  </li>
                }
              </ul>
            }
          </section>
        }
        @case ('reports') {
          <section class="section">
            <h2>Signalements (tous)</h2>
            @if (loadingReports) { <p>Chargement…</p> }
            @else if (!reports.length) { <p class="empty">Aucun signalement.</p> }
            @else {
              <table class="table">
                <thead><tr><th>Compte utilisateur</th><th>Propriété (lat, lon)</th></tr></thead>
                <tbody>
                  @for (r of reports; track reportKey(r)) {
                    <tr>
                      <td>{{ r.userAccount }}</td>
                      <td>{{ r.melProperty.lat }}, {{ r.melProperty.lon }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </section>
        }
      }
    </div>
  `,
  styles: [`
    .management { max-width: 1000px; margin: 0 auto; padding: 1rem; }
    .top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .top h1 { margin: 0; font-size: 1.5rem; }
    .back { color: #2563eb; text-decoration: none; }
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .tabs button { padding: 0.5rem 1rem; border: 1px solid #e5e7eb; background: #fff; border-radius: 6px; cursor: pointer; }
    .tabs button.active { background: #2563eb; color: #fff; border-color: #2563eb; }
    .section { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 1rem; margin-bottom: 1rem; }
    .section h2, .section h3 { margin: 0 0 0.75rem; font-size: 1.1rem; }
    .fields { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
    .fields label { display: flex; flex-direction: column; gap: 0.25rem; }
    .fields input, .fields select { padding: 0.5rem; width: 120px; }
    .buttons { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
    button { padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; border: none; }
    button[type="submit"] { background: #2563eb; color: #fff; }
    .cancel { background: #e5e7eb; color: #374151; }
    .btn-edit { background: #3b82f6; color: #fff; font-size: 0.875rem; }
    .btn-delete { background: #dc2626; color: #fff; font-size: 0.875rem; }
    .btn-delete.small { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .actions { display: flex; gap: 0.5rem; }
    .empty { color: #666; margin: 0; }
    .sign-type-list { list-style: none; margin: 0; padding: 0; }
    .sign-type-list li { display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0; border-bottom: 1px solid #eee; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal { background: #fff; padding: 1.5rem; border-radius: 8px; min-width: 320px; }
    .modal p { margin: 0 0 1rem; }
    .modal-actions { display: flex; gap: 0.5rem; }
  `],
})
export class MelManagementComponent implements OnInit {
  tab: Tab = 'properties';
  properties: MelProperty[] = [];
  signs: MelSign[] = [];
  signTypes: MelSignType[] = [];
  reports: MelReport[] = [];
  loadingProps = true;
  loadingSigns = true;
  loadingSignTypes = true;
  loadingReports = true;
  saving = false;
  editProp: MelProperty | null = null;
  deleteProp: MelProperty | null = null;
  propForm = { lat: 50.63, lon: 3.06, naturalSpace: false, pointsValue: 0, numberOfSigns: 0 };
  signForm = { lat: 50.63, lon: 3.06, signType: '' };
  newSignTypeName = '';

  constructor(private melService: MelService) {}

  ngOnInit(): void {
    this.loadProperties();
    this.loadSigns();
    this.loadSignTypes();
    this.loadReports();
  }

  locKey(p: MelProperty): string {
    return `${p.localisation.lat},${p.localisation.lon}`;
  }

  reportKey(r: MelReport): string {
    return `${r.userAccount}-${r.melProperty.lat}-${r.melProperty.lon}`;
  }

  loadProperties(): void {
    this.loadingProps = true;
    this.melService.getProperties().subscribe({
      next: (data) => { this.properties = data; this.loadingProps = false; },
      error: () => { this.loadingProps = false; },
    });
  }

  loadSigns(): void {
    this.loadingSigns = true;
    this.melService.getSigns().subscribe({
      next: (data) => { this.signs = data; this.loadingSigns = false; },
      error: () => { this.loadingSigns = false; },
    });
  }

  loadSignTypes(): void {
    this.loadingSignTypes = true;
    this.melService.getSignTypes().subscribe({
      next: (data) => {
        this.signTypes = data;
        this.loadingSignTypes = false;
        if (data.length && !this.signForm.signType) this.signForm.signType = data[0].signType;
      },
      error: () => { this.loadingSignTypes = false; },
    });
  }

  loadReports(): void {
    this.loadingReports = true;
    this.melService.getAllReports().subscribe({
      next: (data) => { this.reports = data; this.loadingReports = false; },
      error: () => { this.loadingReports = false; },
    });
  }

  submitProperty(): void {
    if (this.editProp) {
      this.saving = true;
      const { lat, lon } = this.editProp.localisation;
      this.melService.updateProperty(lat, lon, {
        naturalSpace: this.propForm.naturalSpace,
        pointsValue: this.propForm.pointsValue,
        numberOfSigns: this.propForm.numberOfSigns,
      }).subscribe({
        next: (updated) => {
          const i = this.properties.findIndex((p) => this.locKey(p) === this.locKey(updated));
          if (i !== -1) this.properties[i] = updated;
          this.cancelEditProperty();
          this.saving = false;
        },
        error: () => { this.saving = false; },
      });
    } else {
      this.saving = true;
      this.melService.createProperty(this.propForm).subscribe({
        next: (created) => {
          this.properties = [created, ...this.properties];
          this.propForm = { lat: 50.63, lon: 3.06, naturalSpace: false, pointsValue: 0, numberOfSigns: 0 };
          this.saving = false;
        },
        error: () => { this.saving = false; },
      });
    }
  }

  startEditProperty(p: MelProperty): void {
    this.editProp = p;
    this.propForm = {
      lat: p.localisation.lat,
      lon: p.localisation.lon,
      naturalSpace: p.naturalSpace,
      pointsValue: p.pointsValue,
      numberOfSigns: p.numberOfSigns,
    };
  }

  cancelEditProperty(): void {
    this.editProp = null;
    this.propForm = { lat: 50.63, lon: 3.06, naturalSpace: false, pointsValue: 0, numberOfSigns: 0 };
  }

  confirmDeleteProperty(p: MelProperty): void {
    this.deleteProp = p;
  }

  doDeleteProperty(): void {
    if (!this.deleteProp) return;
    const { lat, lon } = this.deleteProp.localisation;
    this.melService.deleteProperty(lat, lon).subscribe({
      next: () => {
        this.properties = this.properties.filter((p) => this.locKey(p) !== this.locKey(this.deleteProp!));
        this.deleteProp = null;
      },
    });
  }

  submitSign(): void {
    this.saving = true;
    this.melService.createSign(this.signForm).subscribe({
      next: (created) => {
        this.signs = [created, ...this.signs];
        this.saving = false;
      },
      error: () => { this.saving = false; },
    });
  }

  deleteSign(s: MelSign): void {
    if (!confirm('Supprimer ce signe ?')) return;
    this.melService.deleteSign(s.signID).subscribe({
      next: () => {
        this.signs = this.signs.filter((x) => x.signID !== s.signID);
      },
    });
  }

  submitSignType(): void {
    this.saving = true;
    this.melService.createSignType(this.newSignTypeName.trim()).subscribe({
      next: (created) => {
        this.signTypes = [...this.signTypes, created];
        this.newSignTypeName = '';
        this.saving = false;
      },
      error: () => { this.saving = false; },
    });
  }

  deleteSignType(signType: string): void {
    if (!confirm('Supprimer ce type ?')) return;
    this.melService.deleteSignType(signType).subscribe({
      next: () => {
        this.signTypes = this.signTypes.filter((s) => s.signType !== signType);
      },
    });
  }
}
