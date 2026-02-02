import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Panel } from '../../../core/services/panel.service';

@Component({
  selector: 'app-map',
  standalone: true,
  template: `<div class="map-container" #mapContainer></div>`,
  styles: [`
    .map-container {
      width: 100%;
      height: 100%;
      min-height: 320px;
      border-radius: 8px;
      overflow: hidden;
    }
  `],
})
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;
  @Input() panels: Panel[] = [];
  @Input() center: [number, number] = [48.8566, 2.3522];
  @Input() zoom = 12;

  private map: import('leaflet').Map | null = null;
  private markers: import('leaflet').Marker[] = [];
  private L: typeof import('leaflet') | null = null;

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;
    import('leaflet').then((L) => {
      this.L = L.default;
      this.initMap();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map && this.L && (changes['panels'] || changes['center'])) {
      this.updateMarkers();
    }
  }

  ngOnDestroy(): void {
    this.destroyMap();
  }

  private initMap(): void {
    if (!this.L || !this.mapContainer?.nativeElement) return;
    this.map = this.L.map(this.mapContainer.nativeElement).setView(this.center, this.zoom);
    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(this.map);
    this.updateMarkers();
  }

  private updateMarkers(): void {
    if (!this.map || !this.L) return;
    this.markers.forEach((m) => m.remove());
    this.markers = [];
    this.panels.forEach((p) => {
      const marker = this.L!.marker([p.latitude, p.longitude])
        .addTo(this.map!)
        .bindPopup(`<strong>${this.escapeHtml(p.name)}</strong>`);
      this.markers.push(marker);
    });
  }

  private escapeHtml(s: string): string {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  private destroyMap(): void {
    this.markers.forEach((m) => m.remove());
    this.markers = [];
    this.map?.remove();
    this.map = null;
  }
}
