import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface MelLocalisation {
  lat: number;
  lon: number;
}

export interface MelProperty {
  localisation: MelLocalisation;
  lastReport: string;
  naturalSpace: boolean;
  pointsValue: number;
  numberOfSigns: number;
  creator: number;
}

export interface MelSignType {
  signType: string;
}

export interface MelSign {
  signID: number;
  tagged: boolean;
  deterioratedInfo: boolean;
  hiddenByEnvironment: boolean;
  standing: boolean;
  present: boolean;
  componentTotal: number;
  signType: string;
  localisation: MelLocalisation;
}

export interface MelReport {
  userAccount: number;
  melProperty: MelLocalisation;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class MelService {
  private readonly baseUrl = `${environment.apiUrl}/mel`;

  constructor(private http: HttpClient) {}

  // ——— Propriétés
  getProperties(): Observable<MelProperty[]> {
    return this.http
      .get<ApiResponse<MelProperty[]>>(`${this.baseUrl}/properties`)
      .pipe(map((res) => res.data));
  }

  getProperty(lat: number, lon: number): Observable<MelProperty> {
    return this.http
      .get<ApiResponse<MelProperty>>(`${this.baseUrl}/properties/${lat}/${lon}`)
      .pipe(map((res) => res.data));
  }

  createProperty(data: {
    lat: number;
    lon: number;
    naturalSpace: boolean;
    pointsValue: number;
    numberOfSigns: number;
  }): Observable<MelProperty> {
    return this.http
      .post<ApiResponse<MelProperty>>(`${this.baseUrl}/properties`, data)
      .pipe(map((res) => res.data));
  }

  updateProperty(
    lat: number,
    lon: number,
    data: Partial<{ naturalSpace: boolean; pointsValue: number; numberOfSigns: number }>
  ): Observable<MelProperty> {
    return this.http
      .patch<ApiResponse<MelProperty>>(`${this.baseUrl}/properties/${lat}/${lon}`, data)
      .pipe(map((res) => res.data));
  }

  deleteProperty(lat: number, lon: number): Observable<void> {
    return this.http
      .delete(`${this.baseUrl}/properties/${lat}/${lon}`)
      .pipe(map(() => undefined));
  }

  // ——— Signes
  getSigns(lat?: number, lon?: number): Observable<MelSign[]> {
    const options =
      lat != null && lon != null
        ? { params: { lat: String(lat), lon: String(lon) } as Record<string, string> }
        : {};
    return this.http
      .get<ApiResponse<MelSign[]>>(`${this.baseUrl}/signs`, options)
      .pipe(map((res) => res.data));
  }

  getSign(id: number): Observable<MelSign> {
    return this.http
      .get<ApiResponse<MelSign>>(`${this.baseUrl}/signs/${id}`)
      .pipe(map((res) => res.data));
  }

  createSign(data: {
    lat: number;
    lon: number;
    signType: string;
    tagged?: boolean;
    deterioratedInfo?: boolean;
    hiddenByEnvironment?: boolean;
    standing?: boolean;
    present?: boolean;
    componentTotal?: number;
  }): Observable<MelSign> {
    return this.http
      .post<ApiResponse<MelSign>>(`${this.baseUrl}/signs`, data)
      .pipe(map((res) => res.data));
  }

  updateSign(
    id: number,
    data: Partial<{
      signType: string;
      tagged: boolean;
      deterioratedInfo: boolean;
      hiddenByEnvironment: boolean;
      standing: boolean;
      present: boolean;
      componentTotal: number;
    }>
  ): Observable<MelSign> {
    return this.http
      .patch<ApiResponse<MelSign>>(`${this.baseUrl}/signs/${id}`, data)
      .pipe(map((res) => res.data));
  }

  deleteSign(id: number): Observable<void> {
    return this.http.delete(`${this.baseUrl}/signs/${id}`).pipe(map(() => undefined));
  }

  // ——— Types de signes
  getSignTypes(): Observable<MelSignType[]> {
    return this.http
      .get<ApiResponse<MelSignType[]>>(`${this.baseUrl}/sign-types`)
      .pipe(map((res) => res.data));
  }

  createSignType(signType: string): Observable<MelSignType> {
    return this.http
      .post<ApiResponse<MelSignType>>(`${this.baseUrl}/sign-types`, { signType })
      .pipe(map((res) => res.data));
  }

  deleteSignType(signType: string): Observable<void> {
    return this.http
      .delete(`${this.baseUrl}/sign-types/${encodeURIComponent(signType)}`)
      .pipe(map(() => undefined));
  }

  // ——— Signalements
  reportProperty(lat: number, lon: number): Observable<MelReport> {
    return this.http
      .post<ApiResponse<MelReport>>(`${this.baseUrl}/reports`, { lat, lon })
      .pipe(map((res) => res.data));
  }

  getMyReports(): Observable<MelReport[]> {
    return this.http
      .get<ApiResponse<MelReport[]>>(`${this.baseUrl}/reports/my`)
      .pipe(map((res) => res.data));
  }

  getAllReports(): Observable<MelReport[]> {
    return this.http
      .get<ApiResponse<MelReport[]>>(`${this.baseUrl}/reports`)
      .pipe(map((res) => res.data));
  }
}
