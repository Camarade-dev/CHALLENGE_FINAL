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
import type { MelProperty, MelSign } from '../../../core/services/mel.service';

@Component({
  selector: 'app-mel-map',
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
export class MelMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;
  @Input() properties: MelProperty[] = [];
  @Input() signs: MelSign[] = [];
  @Input() center: [number, number] = [50.6292, 3.0573];
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
    if (this.map && this.L && (changes['properties'] || changes['signs'] || changes['center'])) {
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
    const greenIcon = this.L.divIcon({
      className: 'mel-property-marker',
      html: '<span style="background:#22c55e;width:12px;height:12px;border-radius:50%;display:inline-block;border:2px solid #fff;"></span>',
      iconSize: [16, 16],
    });
    const blueIcon = this.L.divIcon({
      className: 'mel-sign-marker',
      html: '<span style="background:#3b82f6;width:10px;height:10px;border-radius:50%;display:inline-block;border:2px solid #fff;"></span>',
      iconSize: [14, 14],
    });
    this.properties.forEach((p) => {
      const loc = p.localisation;
      const popup = `<strong>Propriété MEL</strong><br/>
        Espace naturel: ${p.naturalSpace ? 'Oui' : 'Non'}<br/>
        Points: ${p.pointsValue} · Signes: ${p.numberOfSigns}<br/>
        Dernier signalement: ${p.lastReport}`;
      const marker = this.L!.marker([loc.lat, loc.lon], { icon: greenIcon })
        .addTo(this.map!)
        .bindPopup(popup);
      this.markers.push(marker);
    });
    this.signs.forEach((s) => {
      const loc = s.localisation;
      const popup = `<strong>Panneau #${s.signID}</strong><br/>Type: ${this.escapeHtml(s.signType)}<br/>
        Présent: ${s.present ? 'Oui' : 'Non'} · Dégradé: ${s.deterioratedInfo ? 'Oui' : 'Non'}`;
      const marker = this.L!.marker([loc.lat, loc.lon], { icon: blueIcon })
        .addTo(this.map!)
        .bindPopup(popup);
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
