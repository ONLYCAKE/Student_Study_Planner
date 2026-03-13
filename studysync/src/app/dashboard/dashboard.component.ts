import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../services/analytics.service';
import { AuthService } from '../services/auth.service';
import { PomodoroTimerComponent } from '../shared/pomodoro-timer/pomodoro-timer.component';
import { Chart, registerables } from 'chart.js';
import { Subject, takeUntil } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PomodoroTimerComponent],
  template: `
    <div class="dashboard-container">
      <!-- Header Section -->
      <header class="dashboard-header animate-fade-in">
        <div class="user-welcome">
          <h1>Welcome back, <span class="gradient-text">{{ userName }}</span> 👋</h1>
          <p>You're on a <span class="streak-count">{{ stats?.studyStreak || 0 }} day</span> streak! Keep it up.</p>
        </div>
        <div class="quick-stats">
          <div class="mini-stat">
            <span class="label">Focus Score</span>
            <span class="value">{{ stats?.focusScore || 0 }}</span>
            <div class="mini-progress"><div class="fill" [style.width.%]="stats?.focusScore || 0"></div></div>
          </div>
        </div>
      </header>

      <!-- Main Metrics Grid -->
      <div class="metrics-grid">
        <div class="metric-card glass animate-slide-up" style="--delay: 0.1s">
          <div class="icon-box purple"><span class="material-icons-round">menu_book</span></div>
          <div class="metric-info">
            <h3>{{ stats?.totalSubjects || 0 }}</h3>
            <p>Total Subjects</p>
          </div>
          <div class="metric-chart-peek">
             <span class="material-icons-round">trending_up</span>
          </div>
        </div>

        <div class="metric-card glass animate-slide-up" style="--delay: 0.2s">
          <div class="icon-box blue"><span class="material-icons-round">schedule</span></div>
          <div class="metric-info">
            <h3>{{ stats?.weeklyStudyHours || 0 }}h</h3>
            <p>Weekly Hours</p>
          </div>
        </div>

        <div class="metric-card glass animate-slide-up" style="--delay: 0.3s">
          <div class="icon-box green"><span class="material-icons-round">check_circle</span></div>
          <div class="metric-info">
            <h3>{{ stats?.completedTasks || 0 }}</h3>
            <p>Tasks Done</p>
          </div>
        </div>

        <div class="metric-card glass animate-slide-up" style="--delay: 0.4s">
          <div class="icon-box orange"><span class="material-icons-round">timer</span></div>
          <div class="metric-info">
            <h3>{{ stats?.avgDailyHours || 0 }}h</h3>
            <p>Daily Average</p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="dashboard-content">
        <!-- Weekly Trends Chart -->
        <div class="content-card glass chart-section animate-fade-in" style="--delay: 0.5s">
          <div class="card-header">
            <h3>Weekly Study Trends</h3>
            <span class="text-muted text-sm">Last 7 Days</span>
          </div>
          <div class="chart-wrapper">
            <canvas #weeklyChart></canvas>
          </div>
        </div>

        <!-- Sidebar Activities -->
        <div class="sidebar-column">
          <!-- Pomodoro Timer -->
          <app-pomodoro-timer class="mb-6 block"></app-pomodoro-timer>

          <!-- Upcoming Sessions -->
          <div class="content-card glass sessions-section animate-fade-in" style="--delay: 0.6s">
            <div class="card-header">
              <h3>Upcoming Sessions</h3>
              <button class="btn-link">View All</button>
            </div>
          <div class="sessions-list" *ngIf="stats?.upcomingSessions?.length; else noSessions">
            <div *ngFor="let session of stats.upcomingSessions" class="session-item">
              <div class="subject-tag" [style.border-left-color]="'var(--primary)'">
                <h4>{{ session.subject.name }}</h4>
                <p>{{ session.startTime }} - {{ session.endTime }}</p>
              </div>
              <div class="session-status">
                <span class="badge" [class.badge-primary]="session.status === 'scheduled'" [class.badge-success]="session.status === 'active'">
                  {{ session.status }}
                </span>
              </div>
            </div>
          </div>
          <ng-template #noSessions>
            <div class="empty-state-v2">
              <span class="material-icons-round">calendar_today</span>
              <p>No upcoming study sessions. Time to schedule some focus time!</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 1rem; display: flex; flex-direction: column; gap: 2rem; }
    .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; }
    .user-welcome h1 { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.05em; }
    .gradient-text { background: linear-gradient(135deg, #6366F1, #8B5CF6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .streak-count { font-weight: 700; color: #F59E0B; }
    .mini-stat { background: white; padding: 1rem 1.5rem; border-radius: 16px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 0.25rem; min-width: 160px; }
    .mini-stat .label { font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; }
    .mini-stat .value { font-size: 1.5rem; font-weight: 800; color: var(--primary); }
    .mini-progress { height: 4px; background: #EEF2FF; border-radius: 99px; overflow: hidden; }
    .mini-progress .fill { height: 100%; background: var(--primary); border-radius: 99px; }

    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
    .metric-card { display: flex; align-items: center; gap: 1.25rem; padding: 1.5rem; position: relative; overflow: hidden; }
    .icon-box { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
    .icon-box .material-icons-round { font-size: 1.5rem; color: white; }
    .icon-box.purple { background: linear-gradient(135deg, #6366F1, #4F46E5); }
    .icon-box.blue { background: linear-gradient(135deg, #3B82F6, #2563EB); }
    .icon-box.green { background: linear-gradient(135deg, #10B981, #059669); }
    .icon-box.orange { background: linear-gradient(135deg, #F59E0B, #D97706); }
    .metric-info h3 { font-size: 1.75rem; font-weight: 800; line-height: 1; margin-bottom: 0.25rem; }
    .metric-info p { font-size: 0.875rem; color: var(--text-secondary); font-weight: 500; }
    .metric-chart-peek { position: absolute; right: -10px; bottom: -10px; opacity: 0.1; transform: scale(3); }

    .dashboard-content { display: grid; grid-template-columns: 1.6fr 1fr; gap: 1.5rem; }
    .content-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; min-height: 400px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .card-header h3 { font-size: 1.125rem; font-weight: 700; }
    .chart-wrapper { flex: 1; position: relative; }
    .sessions-list { display: flex; flex-direction: column; gap: 1rem; }
    .session-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(248, 250, 252, 0.8); border-radius: 12px; transition: all 0.2s ease; cursor: pointer; }
    .session-item:hover { background: #EEF2FF; transform: translateX(4px); }
    .subject-tag { border-left: 4px solid #CBD5E1; padding-left: 1rem; }
    .subject-tag h4 { font-size: 0.9375rem; font-weight: 600; }
    .subject-tag p { font-size: 0.8125rem; color: var(--text-secondary); }
    .btn-link { background: none; border: none; color: var(--primary); font-weight: 600; font-size: 0.875rem; cursor: pointer; }

    .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05); border-radius: 24px; }
    .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
    .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; animation-delay: var(--delay); }

    .empty-state-v2 { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: var(--text-muted); gap: 1rem; }
    .empty-state-v2 .material-icons-round { font-size: 3rem; opacity: 0.2; }
    .empty-state-v2 p { max-width: 200px; font-size: 0.875rem; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 1024px) { .dashboard-content { grid-template-columns: 1fr; } .dashboard-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; } }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('weeklyChart') weeklyChartRef!: ElementRef;
  stats: any;
  userName: string = 'Student';
  private destroy$ = new Subject<void>();
  private chart: Chart | null = null;

  constructor(private analyticsService: AnalyticsService, private authService: AuthService) {
    const user = this.authService.getUser;
    this.userName = user?.name || 'Student';
  }

  ngOnInit() {
    this.analyticsService.getDashboardStats().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.stats = data;
      if (this.chart && this.stats?.weeklyTrends) {
        this.updateChart();
      }
    });
  }

  ngAfterViewInit() {
    this.initChart();
  }

  initChart() {
    const ctx = this.weeklyChartRef.nativeElement.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Study Hours',
          data: [0, 0, 0, 0, 0, 0, 0],
          borderColor: '#6366F1',
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#6366F1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(226, 232, 240, 0.5)' }, ticks: { font: { family: 'Inter', size: 12 }, color: '#94A3B8', callback: (value) => value + 'h' } },
          x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 12 }, color: '#64748B' } }
        }
      }
    });

    if (this.stats?.weeklyTrends) {
      this.updateChart();
    }
  }

  updateChart() {
    if (!this.chart || !this.stats.weeklyTrends) return;

    this.chart.data.labels = this.stats.weeklyTrends.map((t: any) => t.day);
    this.chart.data.datasets[0].data = this.stats.weeklyTrends.map((t: any) => t.hours);
    this.chart.update();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
