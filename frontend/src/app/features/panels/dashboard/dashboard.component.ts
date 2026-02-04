import { Component, OnInit } from '@angular/core';
import { MelService, MelProperty, MelSign, MelReport } from '../../../core/services/mel.service';
import { PanelService, Panel } from '../../../core/services/panel.service';
import { AuthService } from '../../../core/services/auth.service';
import { MelMapComponent } from '../../mel/mel-map/mel-map.component';
import { MapComponent } from '../map/map.component';
import { PanelListComponent } from '../panel-list/panel-list.component';
import { CheckFormModalComponent, type CheckFormValue } from '../check-form-modal/check-form-modal.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MelMapComponent,
    MapComponent,
    PanelListComponent,
    CheckFormModalComponent,
    RouterLink,
  ],
  template: `
    <div class="dashboard">
      <div class="tabs">
        <button type="button" [class.active]="activeTab === 'mel'" (click)="activeTab = 'mel'">
          Signalisation MEL
        </button>
        <button type="button" [class.active]="activeTab === 'panels'" (click)="activeTab = 'panels'">
          Panneaux à contrôler
        </button>
      </div>

      @if (activeTab === 'mel') {
        <div class="tab-content">
          <section class="map-section">
            <app-mel-map
              [properties]="properties"
              [signs]="signs"
              [center]="melCenter"
              [zoom]="11"
            />
          </section>
          <aside class="list-section">
            <h2>Propriétés MEL</h2>
            @if (isAdmin) {
              <p class="admin-hint">
                <a routerLink="/admin">Gérer les propriétés, signes et signalements</a>
              </p>
            }
            @if (loadingMel) {
              <p>Chargement…</p>
            } @else if (properties.length === 0) {
              <p>Aucune propriété MEL enregistrée.</p>
            } @else {
              <ul class="property-list">
                @for (p of properties; track locKey(p)) {
                  <li class="property-item">
                    <span class="loc">{{ p.localisation.lat.toFixed(5) }}, {{ p.localisation.lon.toFixed(5) }}</span>
                    <span class="meta">Espace naturel: {{ p.naturalSpace ? 'Oui' : 'Non' }} · {{ p.numberOfSigns }} signe(s)</span>
                    @if (!isAdmin) {
                      @if (hasReported(p)) {
                        <span class="badge">Déjà signalé</span>
                      } @else {
                        <button type="button" class="btn-report" (click)="reportProperty(p)" [disabled]="reportSending">
                          Signaler
                        </button>
                      }
                    }
                  </li>
                }
              </ul>
            }
          </aside>
        </div>
      }

      @if (activeTab === 'panels') {
        <div class="tab-content">
          <section class="map-section">
            <app-map [panels]="panels" [center]="panelsCenter" [zoom]="12" />
          </section>
          <aside class="list-section">
            <app-panel-list
              [panels]="panels"
              [loading]="loadingPanels"
              [isAdmin]="isAdmin"
              [pendingPanelIds]="pendingPanelIds"
              (check)="openCheckForm($event)"
            />
          </aside>
        </div>
      }

      <app-check-form-modal
        [panel]="panelToCheck"
        [sending]="checkSending"
        (submitCheck)="onSubmitCheck($event)"
        (cancelClick)="panelToCheck = null"
      />
    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      height: calc(100vh - 56px);
      box-sizing: border-box;
    }
    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .tabs button {
      padding: 0.5rem 1rem;
      border: 1px solid #e5e7eb;
      background: #fff;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.95rem;
    }
    .tabs button.active {
      background: #2563eb;
      color: #fff;
      border-color: #2563eb;
    }
    .tab-content {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 1rem;
      flex: 1;
      min-height: 0;
    }
    .map-section {
      min-height: 0;
      background: #f0f0f0;
      border-radius: 8px;
      padding: 0.5rem;
    }
    .list-section {
      min-height: 0;
      overflow: auto;
    }
    .list-section h2 { margin: 0 0 0.5rem 0; font-size: 1.1rem; }
    .admin-hint { margin-bottom: 0.75rem; font-size: 0.9rem; }
    .admin-hint a { color: #2563eb; }
    .property-list { list-style: none; margin: 0; padding: 0; }
    .property-item {
      padding: 0.6rem;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      margin-bottom: 0.5rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }
    .property-item .loc { font-family: monospace; font-size: 0.85rem; }
    .property-item .meta { font-size: 0.85rem; color: #6b7280; }
    .property-item .badge { font-size: 0.75rem; color: #059669; }
    .btn-report {
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-report:disabled { opacity: 0.6; cursor: not-allowed; }
    @media (max-width: 768px) {
      .tab-content { grid-template-columns: 1fr; grid-template-rows: 1fr auto; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  activeTab: 'mel' | 'panels' = 'panels';

  // MEL
  properties: MelProperty[] = [];
  signs: MelSign[] = [];
  myReports: MelReport[] = [];
  loadingMel = true;
  reportSending = false;
  melCenter: [number, number] = [50.6292, 3.0573];

  // Panneaux
  panels: Panel[] = [];
  loadingPanels = true;
  pendingPanelIds: string[] = [];
  panelToCheck: Panel | null = null;
  checkSending = false;
  panelsCenter: [number, number] = [50.6292, 3.0573];

  isAdmin = false;

  constructor(
    private melService: MelService,
    private panelService: PanelService,
    public auth: AuthService
  ) {
    this.isAdmin = this.auth.isAdmin();
  }

  ngOnInit(): void {
    this.loadMel();
    this.loadPanels();
    if (!this.isAdmin) {
      this.melService.getMyReports().subscribe({
        next: (list) => (this.myReports = list),
      });
      this.panelService.getMyPendingPanelIds().subscribe({
        next: (ids) => (this.pendingPanelIds = ids),
      });
    }
  }

  loadMel(): void {
    this.loadingMel = true;
    this.melService.getProperties().subscribe({
      next: (data) => {
        this.properties = data;
        this.loadingMel = false;
      },
      error: () => {
        this.loadingMel = false;
      },
    });
    this.melService.getSigns().subscribe({
      next: (data) => (this.signs = data),
    });
  }

  loadPanels(): void {
    this.loadingPanels = true;
    this.panelService.getAll().subscribe({
      next: (data) => {
        this.panels = data;
        this.loadingPanels = false;
      },
      error: () => {
        this.loadingPanels = false;
      },
    });
  }

  locKey(p: MelProperty): string {
    return `${p.localisation.lat},${p.localisation.lon}`;
  }

  hasReported(p: MelProperty): boolean {
    return this.myReports.some(
      (r) =>
        r.melProperty.lat === p.localisation.lat &&
        r.melProperty.lon === p.localisation.lon
    );
  }

  reportProperty(p: MelProperty): void {
    this.reportSending = true;
    this.melService.reportProperty(p.localisation.lat, p.localisation.lon).subscribe({
      next: () => {
        this.myReports = [
          ...this.myReports,
          { userAccount: 0, melProperty: p.localisation },
        ];
        this.reportSending = false;
      },
      error: () => {
        this.reportSending = false;
      },
    });
  }

  openCheckForm(panel: Panel): void {
    this.panelToCheck = panel;
  }

  onSubmitCheck(payload: CheckFormValue): void {
    if (!this.panelToCheck) return;
    this.checkSending = true;
    this.panelService.check(this.panelToCheck.id, {
      state: payload.state,
      comment: payload.comment,
      photoUrl: payload.photoUrl ?? undefined,
    }).subscribe({
      next: () => {
        this.pendingPanelIds = [...this.pendingPanelIds, this.panelToCheck!.id];
        this.panelToCheck = null;
        this.checkSending = false;
      },
      error: () => {
        this.checkSending = false;
      },
    });
  }
}
