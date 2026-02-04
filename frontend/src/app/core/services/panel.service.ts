import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Panel {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  lastCheckedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class PanelService {
  private readonly baseUrl = `${environment.apiUrl}/panels`;
  private readonly uploadUrl = `${environment.apiUrl}/upload/check-photo`;

  constructor(private http: HttpClient) {}

  uploadCheckPhoto(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http
      .post<ApiResponse<{ url: string }>>(this.uploadUrl, formData)
      .pipe(map((res) => res.data));
  }

  getAll(): Observable<Panel[]> {
    return this.http
      .get<ApiResponse<Panel[]>>(this.baseUrl)
      .pipe(map((res) => res.data));
  }

  getById(id: string): Observable<Panel> {
    return this.http
      .get<ApiResponse<Panel>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  check(id: string, body: { state: string; comment?: string; photoUrl?: string | null }): Observable<Panel> {
    return this.http
      .post<ApiResponse<Panel>>(`${this.baseUrl}/${id}/check`, body)
      .pipe(map((res) => res.data));
  }

  create(panel: { name: string; latitude: number; longitude: number }): Observable<Panel> {
    return this.http
      .post<ApiResponse<Panel>>(this.baseUrl, panel)
      .pipe(map((res) => res.data));
  }

  update(id: string, data: Partial<{ name: string; latitude: number; longitude: number }>): Observable<Panel> {
    return this.http
      .patch<ApiResponse<Panel>>(`${this.baseUrl}/${id}`, data)
      .pipe(map((res) => res.data));
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(map(() => undefined));
  }

  getPendingChecks(): Observable<PendingCheck[]> {
    return this.http
      .get<ApiResponse<PendingCheck[]>>(`${this.baseUrl}/checks/pending`)
      .pipe(map((res) => res.data));
  }

  getMyPendingPanelIds(): Observable<string[]> {
    return this.http
      .get<ApiResponse<string[]>>(`${this.baseUrl}/checks/my-pending`)
      .pipe(map((res) => res.data));
  }

  validateCheck(checkId: string): Observable<Panel> {
    return this.http
      .patch<ApiResponse<Panel>>(`${this.baseUrl}/checks/${checkId}/validate`, {})
      .pipe(map((res) => res.data));
  }
}

export interface PendingCheck {
  id: string;
  panelId: string;
  userId: string;
  checkedAt: string;
  status: string;
  state: string;
  comment: string | null;
  photoUrl: string | null;
  panelName: string;
  userEmail: string;
}
