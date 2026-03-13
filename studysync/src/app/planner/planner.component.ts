import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../services/analytics.service';
import { SessionService } from '../services/session.service';
import { PlannerEngineService, PlannerResponse, DailyPlanItem } from '../services/planner-engine.service';

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="planner-page animate-fade-in">
      <div class="page-header">
        <div class="page-title">
          <h1>Smart Study <span class="gradient-text">Planner</span></h1>
          <p>Personalized recommendations based on your goals and exam proximity.</p>
        </div>
        <div class="header-actions">
          <div class="info-badge glass">
            <span class="material-icons-round">auto_awesome</span>
            <span>AI Powered</span>
          </div>
        </div>
      </div>

      <div class="planner-grid" *ngIf="plan; else loading">
        
        <!-- Left Column: Timeline -->
        <div class="timeline-column">
          <div class="card glass no-hover">
            <h2 class="card-title"><span class="material-icons-round">auto_awesome</span> Today's AI Study Plan</h2>
            <div class="timeline-v2 mt-4" *ngIf="plan.todayPlan.length > 0; else noPlan">
              <div *ngFor="let item of plan.todayPlan; let i = index" class="timeline-group" [style.--delay]="(i * 0.1) + 's'">
                <div class="timeline-marker">
                  <div class="dot" [class.break]="item.type === 'break'"></div>
                  <div class="line"></div>
                </div>
                
                <div class="timeline-content card-v2" [class.is-break]="item.type === 'break'">
                  <div class="session-main">
                    <div class="session-time-box">
                      <span class="start">{{ item.start }}</span>
                      <span class="arrow">↓</span>
                      <span class="end">{{ item.end }}</span>
                    </div>
                    
                    <div class="session-details">
                      <div class="header">
                         <span class="badge" [class.badge-primary]="item.type === 'study'" [class.badge-warning]="item.type === 'break'">
                           {{ item.type === 'break' ? 'Break' : 'Focus Session' }}
                         </span>
                         <span class="date">{{ item.duration }} min</span>
                      </div>
                      <h3>{{ item.subject }}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ng-template #noPlan>
              <div class="empty-state">
                <p>No study sessions needed today. Enjoy your day!</p>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Right Column: Insights -->
        <div class="insights-column">
          <!-- Focus Recommendation -->
          <div class="insight-card focus glass">
            <span class="material-icons-round icon highlight">bolt</span>
            <h4>Focus Recommendation</h4>
            <p>{{ plan.insight }}</p>
          </div>

          <!-- Performance Insight -->
          <div class="insight-card performance glass mt-4">
            <span class="material-icons-round icon success">trending_up</span>
            <h4>Performance Insight</h4>
            <p>{{ plan.performanceInsight }}</p>
          </div>
          
          <!-- Weak Subject Warning -->
          <div class="insight-card warning glass mt-4" *ngIf="plan.weakSubjectAlert">
            <span class="material-icons-round icon danger">warning</span>
            <h4>Action Required</h4>
            <p>{{ plan.weakSubjectAlert }}</p>
          </div>

          <div class="stats-card glass mt-4">
            <div class="stat-value">{{ plan.recommendedHours }}h</div>
            <div class="stat-label">Total AI Recommended Study Time Today</div>
          </div>
        </div>
      </div>
      
      <ng-template #loading>
        <div class="loading-state">
           <span class="material-icons-round loading-icon">hourglass_empty</span>
           <p>Generating your intelligent study plan...</p>
        </div>
      </ng-template>


    </div>
  `,
  styles: [`
    .planner-page { padding: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
    .page-title h1 { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.05em; margin-bottom: 0.25rem; }
    .gradient-text { background: linear-gradient(135deg, #6366F1, #8B5CF6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    
    .info-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 99px; color: var(--primary); font-weight: 700; font-size: 0.8125rem; text-transform: uppercase; }
    
    .planner-grid { display: grid; grid-template-columns: 1fr 350px; gap: 2rem; align-items: start; }
    
    .card-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.25rem; font-weight: 700; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; }
    .card-title .material-icons-round { color: var(--primary); }

    /* Timeline Styles adapted from schedule list */
    .timeline-v2 { padding-left: 2rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .timeline-group { display: flex; gap: 2rem; position: relative; animation: slideIn 0.5s ease-out forwards; opacity: 0; animation-delay: var(--delay); }
    
    .timeline-marker { display: flex; flex-direction: column; align-items: center; width: 24px; }
    .timeline-marker .dot { width: 14px; height: 14px; border-radius: 50%; background: var(--primary); border: 3px solid white; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2); z-index: 2; }
    .timeline-marker .dot.break { background: #F59E0B; box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.2); }
    .timeline-marker .line { flex: 1; width: 2px; background: #EEF2FF; margin: 0.25rem 0; }
    .timeline-group:last-child .line { display: none; }

    .timeline-content { flex: 1; margin-bottom: 2rem; border-radius: 20px; transition: transform 0.3s ease; background: white; border: 1px solid var(--border-light); }
    .timeline-content:hover { transform: translateX(5px); }
    .timeline-content.is-break { background: rgba(245, 158, 11, 0.05); border-color: rgba(245, 158, 11, 0.2); }
    
    .session-main { display: flex; align-items: center; padding: 1.25rem 2rem; gap: 2rem; }
    .session-time-box { display: flex; flex-direction: column; align-items: center; min-width: 60px; font-weight: 800; font-variant-numeric: tabular-nums; color: var(--text-secondary); }
    .session-time-box .arrow { font-size: 0.75rem; color: #CBD5E1; margin: 0.125rem 0; }
    .session-time-box .start { color: #1e293b; font-size: 1.125rem; }
    .session-time-box .end { color: #94A3B8; font-size: 0.875rem; }

    .session-details { flex: 1; }
    .session-details .header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem; }
    .session-details .date { font-size: 0.75rem; color: #64748B; font-weight: 600; text-transform: uppercase; }
    .session-details h3 { font-size: 1.125rem; font-weight: 700; color: #1e293b; }

    /* Insight Cards */
    .insight-card { padding: 1.5rem; border-radius: 20px; border-left: 4px solid transparent; }
    .insight-card.focus { border-left-color: #8B5CF6; }
    .insight-card.performance { border-left-color: #10B981; }
    .insight-card.warning { border-left-color: #EF4444; }

    .insight-card .icon { font-size: 2rem; margin-bottom: 1rem; display: inline-block; }
    .insight-card .icon.highlight { color: #8B5CF6; }
    .insight-card .icon.success { color: #10B981; }
    .insight-card .icon.danger { color: #EF4444; }

    .insight-card h4 { font-size: 1rem; font-weight: 700; margin-bottom: 0.5rem; color: #1e293b; }
    .insight-card p { font-size: 0.875rem; color: #64748B; line-height: 1.6; }

    .stats-card { text-align: center; padding: 2rem; border-radius: 20px; }
    .stats-card .stat-value { font-size: 3rem; font-weight: 900; color: var(--primary); line-height: 1; margin-bottom: 0.5rem; }
    .stats-card .stat-label { font-size: 0.875rem; font-weight: 600; color: #64748B; text-transform: uppercase; }

    .loading-state { text-align: center; padding: 4rem; color: #64748B; font-weight: 500; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .loading-icon { font-size: 3rem; animation: pulse 1.5s infinite; color: var(--primary); }

    .glass { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04); }
    .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
    .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; animation-delay: var(--delay); }

    @keyframes slideIn { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }

    @media (max-width: 1024px) { 
        .planner-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
        .session-main { flex-direction: column; align-items: flex-start; gap: 1rem; }
        .session-time-box { flex-direction: row; gap: 0.5rem; }
        .session-time-box .arrow { transform: rotate(-90deg); }
    }
  `]
})
export class PlannerComponent implements OnInit {
  plan: PlannerResponse | null = null;

  constructor(private plannerEngine: PlannerEngineService) {}

  ngOnInit() {
    this.plannerEngine.getPlan().subscribe({
      next: (data) => {
        this.plan = data;
      },
      error: (err) => {
        console.error('Failed to load plan', err);
      }
    });
  }
}
