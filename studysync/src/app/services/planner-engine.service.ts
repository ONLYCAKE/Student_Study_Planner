import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DailyPlanItem {
  subject: string;
  start: string;
  end: string;
  duration: number;
  type: 'study' | 'break';
}

export interface PlannerResponse {
  todayPlan: DailyPlanItem[];
  focusSubject: string;
  recommendedHours: number;
  insight: string;
  performanceInsight: string;
  weakSubjectAlert: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PlannerEngineService {
  constructor(private api: ApiService) {}

  getPlan(): Observable<PlannerResponse> {
    return from(this.api.get<PlannerResponse>('/planner/generate')).pipe(
        map(res => res.data) 
    );
  }
}
