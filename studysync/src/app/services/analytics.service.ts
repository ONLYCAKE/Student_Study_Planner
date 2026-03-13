import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { from, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    constructor(private api: ApiService) { }

    getDashboardStats() {
        return from(this.api.get<{ success: boolean; data: any }>('/dashboard/stats')).pipe(
            map((res: any) => res.data.data)
        );
    }

    getPlannerRecommendations() {
        return from(this.api.get<{ success: boolean; data: any[] }>('/planner/recommendations')).pipe(
            map((res: any) => res.data.data)
        );
    }
}
