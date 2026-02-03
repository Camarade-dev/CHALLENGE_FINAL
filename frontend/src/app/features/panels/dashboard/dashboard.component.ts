import { Component, OnInit } from '@angular/core';
import { PanelService, Panel } from '../../../core/services/panel.service';
import { AuthService } from '../../../core/services/auth.service';
import { MapComponent } from '../map/map.component';
import { PanelListComponent } from '../panel-list/panel-list.component';
import { CheckFormModalComponent, type CheckFormValue } from '../check-form-modal/check-form-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MapComponent, PanelListComponent, CheckFormModalComponent],
  template: `
    <div class="dashboard">
      <section class="map-section">
        <app-map [panels]="panels" [center]="mapCenter" [zoom]="12" />
      </section>
      <aside class="list-section">
        <app-panel-list
          [panels]="panels"
          [loading]="loading"
          [isAdmin]="auth.isAdmin()"
          [pendingPanelIds]="pendingPanelIds"
          (check)="openCheckForm($event)"
        />
      </aside>
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
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 1rem;
      padding: 1rem;
      height: calc(100vh - 56px);
      box-sizing: border-box;
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
    @media (max-width: 768px) {
      .dashboard {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr auto;
      }
    }
  `],
})
export class DashboardComponent implements OnInit {
  panels: Panel[] = [];
  loading = true;
  checkSending = false;
  panelToCheck: Panel | null = null;
  pendingPanelIds: string[] = [];
  mapCenter: [number, number] = [48.8566, 2.3522];

  constructor(
    private panelService: PanelService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPanels();
    if (!this.auth.isAdmin()) {
      this.panelService.getMyPendingPanelIds().subscribe({
        next: (ids) => (this.pendingPanelIds = ids),
      });
    }
  }

  loadPanels(): void {
    this.loading = true;
    this.panelService.getAll().subscribe({
      next: (data) => {
        this.panels = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
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
