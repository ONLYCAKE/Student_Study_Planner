import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { SubjectService } from '../services/subject.service';
import { AnalyticsService } from '../services/analytics.service';
import { Subject, takeUntil } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-page animate-fade-in">
      <div class="page-header">
        <div class="page-title">
          <h1>Learning <span class="gradient-text">Analytics</span></h1>
          <p>Deep dive into your study patterns and performance metrics.</p>
        </div>
      </div>

      <div class="analytics-grid">
        <div class="stat-card glass" *ngFor="let stat of stats; let i = index" [style.--delay]="(i * 0.1) + 's'">
          <div class="stat-icon" [style.background]="stat.bg">
            <span class="material-icons-round" [style.color]="stat.color">{{ stat.icon }}</span>
          </div>
          <div class="stat-info">
            <span class="label">{{ stat.label }}</span>
            <span class="value">{{ stat.value }}</span>
            <span class="trend" [class.up]="stat.trend > 0">{{ stat.trendText }}</span>
          </div>
        </div>
      </div>

      <div class="main-stats-row">
        <div class="card-v2 glass chart-card">
          <div class="card-header-v2">
            <h3><span class="material-icons-round">analytics</span> Study Activity</h3>
            <span class="text-sm text-muted">Weekly Distribution</span>
          </div>
          <div class="chart-wrapper">
             <canvas #hoursChart></canvas>
          </div>
        </div>

        <div class="card-v2 glass focus-card">
           <div class="focus-circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" class="bg"></circle>
                <circle cx="50" cy="50" r="45" class="fill" [style.stroke-dashoffset]="450 - (450 * (focusScore / 100))"></circle>
              </svg>
              <div class="focus-content">
                <span class="score">{{ focusScore }}%</span>
                <span class="label">Focus Score</span>
              </div>
           </div>
           <div class="focus-insights">
              <div class="insight-item">
                <span class="material-icons-round">bolt</span>
                <p>Your focus peaked on Wednesday during afternoon sessions.</p>
              </div>
           </div>
        </div>
      </div>

      <div class="subjects-analytics mt-8">
        <h2 class="section-title">Subject Performance</h2>
        <div class="subjects-stats-grid mt-4">
          <div *ngFor="let sub of subjects; let i = index" class="subject-stat-box glass">
             <div class="box-header">
                <span class="name">{{ sub.name }}</span>
                <span class="perc">{{ sub.progressPercentage }}%</span>
             </div>
             <div class="progress-track">
                <div class="progress-fill" [style.width.%]="sub.progressPercentage" [style.background]="getColor(i)"></div>
             </div>
             <div class="box-footer">
                <span>{{ sub.completedStudyHours }}h studied</span>
                <span>{{ sub.remainingStudyHours }}h remain</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .progress-page { padding: 1rem; }
    .page-header { margin-bottom: 2.5rem; }
    .page-title h1 { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.05em; margin-bottom: 0.25rem; }
    .gradient-text { background: linear-gradient(135deg, #6366F1, #8B5CF6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    .analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { display: flex; align-items: center; gap: 1.25rem; padding: 1.5rem; border-radius: 20px; animation: slideUp 0.5s ease-out forwards; opacity: 0; animation-delay: var(--delay); }
    .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .stat-icon .material-icons-round { font-size: 1.5rem; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-info .label { font-size: 0.8125rem; font-weight: 600; color: #64748B; margin-bottom: 0.125rem; }
    .stat-info .value { font-size: 1.5rem; font-weight: 800; color: #1e293b; }
    .stat-info .trend { font-size: 0.75rem; font-weight: 600; color: #94A3B8; }
    .stat-info .trend.up { color: #10B981; }

    .main-stats-row { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
    .chart-card { padding: 2rem; }
    .card-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .card-header-v2 h3 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.125rem; font-weight: 700; }
    .chart-wrapper { height: 320px; }

    .focus-card { padding: 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .focus-circle { position: relative; width: 180px; height: 180px; margin-bottom: 1.5rem; }
    .focus-circle svg { transform: rotate(-90deg); }
    .focus-circle circle { fill: none; stroke-width: 8; stroke-linecap: round; }
    .focus-circle .bg { stroke: #EEF2FF; }
    .focus-circle .fill { stroke: var(--primary); stroke-dasharray: 450; transition: stroke-dashoffset 1.5s ease-out; }
    .focus-content { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .focus-content .score { font-size: 2.25rem; font-weight: 900; color: #1e293b; line-height: 1; }
    .focus-content .label { font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase; margin-top: 0.25rem; }
    
    .focus-insights { width: 100%; }
    .insight-item { display: flex; gap: 0.75rem; background: rgba(99, 102, 241, 0.05); padding: 1rem; border-radius: 12px; }
    .insight-item .material-icons-round { color: var(--primary); font-size: 1.25rem; }
    .insight-item p { font-size: 0.8125rem; color: #475569; line-height: 1.5; font-weight: 500; }

    .section-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; }
    .subjects-stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }
    .subject-stat-box { padding: 1.5rem; border-radius: 20px; }
    .box-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
    .box-header .name { font-weight: 700; font-size: 1rem; color: #1e293b; }
    .box-header .perc { font-weight: 800; color: var(--primary); }
    .progress-track { height: 8px; background: #EEF2FF; border-radius: 99px; margin-bottom: 1rem; }
    .progress-fill { height: 100%; border-radius: 99px; }
    .box-footer { display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748B; font-weight: 600; }

    .glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.5); }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 1024px) { .main-stats-row { grid-template-columns: 1fr; } }
  `]
})
export class ProgressComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('hoursChart') hoursChartRef!: ElementRef;
  subjects: any[] = [];
  focusScore = 0;
  chart: Chart | null = null;
  private destroy$ = new Subject<void>();

  stats = [
    { label: 'Study Streak', value: '0 Days', icon: 'local_fire_department', bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', trend: 0, trendText: 'Top 10% this week' },
    { label: 'Completed Hours', value: '0h', icon: 'timer', bg: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', trend: 15, trendText: '+15% from last week' },
    { label: 'Daily Average', value: '0h', icon: 'date_range', bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981', trend: 0, trendText: 'Maintain consistency' },
    { label: 'Assignments Done', value: '0', icon: 'task_alt', bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', trend: 5, trendText: '5 tasks completed' }
  ];

  private colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

  constructor(
    private subjectService: SubjectService,
    private analyticsService: AnalyticsService
  ) { }

  getColor(i: number): string { return this.colors[i % this.colors.length]; }

  ngOnInit() {
    this.analyticsService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.updateStats(data);
        if (this.chart && data.weeklyTrends) {
          this.updateChart(data.weeklyTrends);
        }
      });

    this.subjectService.getSubjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.subjects = data);
  }

  updateStats(data: any) {
    this.stats[0].value = `${data.studyStreak || 0} Days`;
    this.stats[1].value = `${data.completedHours || 0}h`;
    this.stats[2].value = `${(data.weeklyHours / 7 || 0).toFixed(1)}h`;
    this.stats[3].value = `${data.tasksCompleted || 0}`;
    this.focusScore = data.focusScore || 0;
  }

  ngAfterViewInit() {
    this.initChart();
  }

  initChart() {
    const ctx = this.hoursChartRef.nativeElement.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Study Hours',
          data: [],
          borderColor: '#6366F1',
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#6366F1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { 
            beginAtZero: true, 
            grid: { color: 'rgba(241, 245, 249, 0.5)' },
            ticks: { font: { family: 'Inter', weight: 600, size: 11 }, color: '#94A3B8', callback: (val) => val + 'h' }
          },
          x: { 
            grid: { display: false },
            ticks: { font: { family: 'Inter', weight: 600, size: 11 }, color: '#64748B' }
          }
        }
      }
    });
  }

  updateChart(trends: any[]) {
    if (!this.chart) return;
    this.chart.data.labels = trends.map(t => t.day);
    this.chart.data.datasets[0].data = trends.map(t => t.hours);
    this.chart.update();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
