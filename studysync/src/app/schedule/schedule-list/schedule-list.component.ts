import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../services/session.service';
import { SubjectService } from '../../services/subject.service';
import { ToastService } from '../../services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-schedule-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="schedule-page animate-fade-in">
      <div class="page-header">
        <div class="page-title">
          <h1>Study <span class="gradient-text">Schedule</span></h1>
          <p>Plan and track your focused study intervals.</p>
        </div>
        <button class="primary-btn" (click)="showModal = true">
          <span class="material-icons-round">add</span>
          <span>New Session</span>
        </button>
      </div>

      <div *ngIf="sessions.length; else noSessions" class="timeline-v2">
        <div *ngFor="let session of sessions; let i = index" class="timeline-group" [style.--delay]="(i * 0.1) + 's'">
          <div class="timeline-marker">
            <div class="dot" [class.active]="session.status === 'active'" [class.completed]="session.status === 'completed'"></div>
            <div class="line"></div>
          </div>
          
          <div class="timeline-content card-v2 glass">
            <div class="session-main">
              <div class="session-time-box">
                <span class="start">{{ session.startTime }}</span>
                <span class="arrow">↓</span>
                <span class="end">{{ session.endTime }}</span>
              </div>
              
              <div class="session-details">
                <div class="header">
                   <span class="badge" [class.badge-primary]="session.status === 'scheduled'" 
                                       [class.badge-success]="session.status === 'active'"
                                       [class.badge-gold]="session.status === 'completed'">
                     {{ session.status }}
                   </span>
                   <span class="date">{{ session.date | date:'EEEE, MMM d' }}</span>
                </div>
                <h3>{{ session.subject?.name || 'Focused Study' }}</h3>
              </div>

              <div class="session-actions">
                <div class="status-controls" *ngIf="session.status !== 'completed'">
                  <button *ngIf="session.status === 'scheduled'" class="btn-action start" (click)="updateStatus(session, 'active')" title="Start Session">
                    <span class="material-icons-round">play_arrow</span>
                  </button>
                  <button *ngIf="session.status === 'active'" class="btn-action complete" (click)="updateStatus(session, 'completed')" title="Finish Session">
                    <span class="material-icons-round">done_all</span>
                  </button>
                </div>
                <button class="icon-btn-v2" (click)="deleteSession(session.id)" title="Delete">
                  <span class="material-icons-round">delete_outline</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #noSessions>
        <div class="empty-state-v2 glass">
          <div class="empty-icon-box">
             <span class="material-icons-round">event_note</span>
          </div>
          <h3>No study plans yet</h3>
          <p>Schedule your first study session to start building your focus streak.</p>
          <button class="primary-btn mt-6" (click)="showModal = true">
            <span class="material-icons-round">add</span> Schedule Now
          </button>
        </div>
      </ng-template>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
        <div class="modal-card-v2 glass" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Schedule Session</h2>
            <button class="close-btn" (click)="showModal = false">
              <span class="material-icons-round">close</span>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="form-group-v2">
              <label>Subject</label>
              <select [(ngModel)]="newSession.subjectId">
                <option *ngFor="let sub of subjects" [value]="sub.id">{{ sub.name }}</option>
              </select>
            </div>
            <div class="form-group-v2"><label>Date</label><input type="date" [(ngModel)]="newSession.date"></div>
            <div class="form-row">
              <div class="form-group-v2"><label>Start Time</label><input type="time" [(ngModel)]="newSession.startTime"></div>
              <div class="form-group-v2"><label>End Time</label><input type="time" [(ngModel)]="newSession.endTime"></div>
            </div>
            
            <!-- Google Sync Checkbox -->
            <div class="form-group-v2 mt-2">
              <label class="checkbox-label-v2">
                <input type="checkbox" [(ngModel)]="newSession.syncWithGoogle">
                <div class="custom-checkbox-v2">
                  <span class="material-icons-round" *ngIf="newSession.syncWithGoogle">check</span>
                </div>
                <span>Sync with Google Calendar</span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button class="secondary-btn" (click)="showModal = false">Cancel</button>
            <button class="primary-btn" (click)="addSession()">Schedule</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .schedule-page { padding: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem; }
    .page-title h1 { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.05em; margin-bottom: 0.25rem; }
    .gradient-text { background: linear-gradient(135deg, #6366F1, #8B5CF6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    
    .timeline-v2 { padding-left: 2rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .timeline-group { display: flex; gap: 2rem; position: relative; animation: slideIn 0.5s ease-out forwards; opacity: 0; animation-delay: var(--delay); }
    
    .timeline-marker { display: flex; flex-direction: column; align-items: center; width: 24px; }
    .timeline-marker .dot { width: 14px; height: 14px; border-radius: 50%; background: #CBD5E1; border: 3px solid white; box-shadow: 0 0 0 4px rgba(226, 232, 240, 0.5); z-index: 2; transition: all 0.3s ease; }
    .timeline-marker .dot.active { background: #10B981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); transform: scale(1.2); }
    .timeline-marker .dot.completed { background: #6366F1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2); }
    .timeline-marker .line { flex: 1; width: 2px; background: #EEF2FF; margin: 0.25rem 0; }
    .timeline-group:last-child .line { display: none; }

    .timeline-content { flex: 1; margin-bottom: 2rem; border-radius: 20px; transition: transform 0.3s ease; }
    .timeline-content:hover { transform: translateX(10px); }
    
    .session-main { display: flex; align-items: center; padding: 1.25rem 2rem; gap: 2rem; }
    .session-time-box { display: flex; flex-direction: column; align-items: center; min-width: 60px; font-weight: 800; font-variant-numeric: tabular-nums; color: var(--text-secondary); }
    .session-time-box .arrow { font-size: 0.75rem; color: #CBD5E1; margin: 0.125rem 0; }
    .session-time-box .start { color: #1e293b; font-size: 1.125rem; }
    .session-time-box .end { color: #94A3B8; font-size: 0.875rem; }

    .session-details { flex: 1; }
    .session-details .header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem; }
    .session-details .date { font-size: 0.75rem; color: #64748B; font-weight: 600; text-transform: uppercase; }
    .session-details h3 { font-size: 1.125rem; font-weight: 700; color: #1e293b; }

    .session-actions { display: flex; align-items: center; gap: 1rem; }
    .btn-action { width: 40px; height: 40px; border-radius: 12px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; }
    .btn-action.start { background: #DCFCE7; color: #15803D; }
    .btn-action.start:hover { background: #16A34A; color: white; }
    .btn-action.complete { background: #EEF2FF; color: #4F46E5; }
    .btn-action.complete:hover { background: #6366F1; color: white; }

    .badge-gold { background: #FEF3C7; color: #92400E; }

    .glass { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.5); }
    
    .modal-card-v2 { position: relative; width: 100%; max-width: 480px; border-radius: 28px; padding: 2.5rem; animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .close-btn { background: #F8FAFC; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    
    .form-group-v2 { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; width: 100%; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group-v2 label { font-size: 0.8125rem; font-weight: 600; color: #64748B; padding-left: 0.25rem; }
    .form-group-v2 input, .form-group-v2 select { background: #F8FAFC; border: 2px solid #F1F5F9; border-radius: 12px; padding: 0.75rem 1rem; font-size: 0.9375rem; transition: all 0.2s ease; appearance: none; }
    .form-group-v2 input:focus, .form-group-v2 select:focus { outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
    .form-group-v2 select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8.825L.35 3.175 1.4 2.125 6 6.725l4.6-4.6 1.05 1.05z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1rem center; padding-right: 2.5rem; }

    .checkbox-label-v2 { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; color: #475569; font-weight: 600; font-size: 0.875rem; }
    .checkbox-label-v2 input { display: none; }
    .custom-checkbox-v2 { width: 22px; height: 22px; border: 2px solid #E2E8F0; border-radius: 6px; display: flex; align-items: center; justify-content: center; background: white; transition: all 0.2s ease; }
    .custom-checkbox-v2 .material-icons-round { font-size: 16px; color: white; }
    input:checked + .custom-checkbox-v2 { background: var(--primary); border-color: var(--primary); }
    .mt-2 { margin-top: 0.5rem; }

    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }

    @keyframes slideIn { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes modalPop { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }

    @media (max-width: 768px) {
        .session-main { flex-direction: column; align-items: flex-start; gap: 1rem; }
        .session-time-box { flex-direction: row; gap: 0.5rem; }
        .session-time-box .arrow { transform: rotate(-90deg); }
        .session-actions { width: 100%; justify-content: space-between; border-top: 1px solid #F1F5F9; padding-top: 1rem; }
    }
  `]
})
export class ScheduleListComponent implements OnInit {
  sessions: any[] = [];
  subjects: any[] = [];
  showModal = false;
  newSession = { subjectId: null, date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '11:00', syncWithGoogle: false };

  constructor(private sessionService: SessionService, private subjectService: SubjectService, private toast: ToastService) { }

  ngOnInit() {
    this.loadSessions();
    this.subjectService.getSubjects().subscribe(data => this.subjects = data);
  }

  loadSessions() {
    this.sessionService.getSessions().subscribe(data => {
      this.sessions = data;
    });
  }

  addSession() {
    if (!this.newSession.subjectId || !this.newSession.date) return;
    this.sessionService.createSession(this.newSession).subscribe({
      next: () => {
        this.loadSessions();
        this.showModal = false;
        this.toast.success('Session successfully scheduled!');
      },
      error: (err) => {
        this.toast.error(err.response?.data?.error || 'Failed to schedule session. Check for overlaps.');
      }
    });
  }

  updateStatus(session: any, status: string) {
    this.sessionService.updateSession(session.id, { status }).subscribe(() => {
      this.loadSessions();
    });
  }

  deleteSession(id: number) {
    if (confirm('Delete this study session?')) {
      this.sessionService.deleteSession(id).subscribe(() => this.loadSessions());
    }
  }
}
