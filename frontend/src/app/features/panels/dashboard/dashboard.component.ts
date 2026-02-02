import { Component, OnInit } from '@angular/core';
import { PanelService, Panel } from '../../../core/services/panel.service';
import { MapComponent } from '../map/map.component';
import { PanelListComponent } from '../panel-list/panel-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MapComponent, PanelListComponent],
  template: `
    <div class="dashboard">
      <section class="map-section">
        <app-map [panels]="panels" [center]="mapCenter" [zoom]="12" />
      </section>
      <aside class="list-section">
        <app-panel-list
          [panels]="panels"
          [loading]="loading"
          (check)="markAsChecked($event)"
        />
      </aside>
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
  mapCenter: [number, number] = [48.8566, 2.3522];

  constructor(private panelService: PanelService) {}

  ngOnInit(): void {
    this.loadPanels();
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

  markAsChecked(panel: Panel): void {
    this.panelService.check(panel.id).subscribe({
      next: (updated) => {
        const i = this.panels.findIndex((p) => p.id === updated.id);
        if (i !== -1) this.panels[i] = updated;
      },
    });
  }
}
