import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Reward {
  id: string;
  name: string;
  partners: string | null;
  servicesMel: string | null;
  valueEur: number;
  pointsRequired: number;
}

export interface RewardClaim {
  id: string;
  rewardId: string;
  rewardName: string;
  claimedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class RewardService {
  private readonly baseUrl = `${environment.apiUrl}/rewards`;

  constructor(private http: HttpClient) {}

  getCatalog(): Observable<Reward[]> {
    return this.http
      .get<ApiResponse<Reward[]>>(`${this.baseUrl}/catalog`)
      .pipe(map((res) => res.data));
  }

  getMyPoints(): Observable<number> {
    return this.http
      .get<ApiResponse<{ points: number }>>(`${this.baseUrl}/me/points`)
      .pipe(map((res) => res.data.points));
  }

  getMyClaims(): Observable<RewardClaim[]> {
    return this.http
      .get<ApiResponse<RewardClaim[]>>(`${this.baseUrl}/me/claims`)
      .pipe(map((res) => res.data));
  }

  claimReward(rewardId: string): Observable<RewardClaim> {
    return this.http
      .post<ApiResponse<RewardClaim>>(`${this.baseUrl}/claim`, { rewardId })
      .pipe(map((res) => res.data));
  }
}
