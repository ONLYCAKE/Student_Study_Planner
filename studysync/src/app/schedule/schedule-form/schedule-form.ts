import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../../services/session.service';
import { SubjectService } from '../../services/subject.service';

@Component({
  selector: 'app-schedule-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-form.html',
  styleUrl: './schedule-form.scss',
})
export class ScheduleForm {
  showModal = false;
  subjects: any[] = [];
  newSession = {
    subjectId: '',
    plannedDuration: 60,
    scheduledDate: '',
    notes: '',
    syncWithGoogle: false
  };

  constructor(
    private sessionService: SessionService,
    private subjectService: SubjectService
  ) {
    this.loadSubjects();
  }

  loadSubjects() {
    this.subjectService.getSubjects().subscribe(data => {
      this.subjects = data;
    });
  }

  scheduleSession() {
    if (!this.newSession.subjectId || !this.newSession.scheduledDate) return;
    
    const sessionData = {
      ...this.newSession,
      subjectId: parseInt(this.newSession.subjectId),
      scheduledDate: new Date(this.newSession.scheduledDate).toISOString()
    };
    
    this.sessionService.createSession(sessionData).subscribe(() => {
      this.showModal = false;
      this.newSession = {
        subjectId: '',
        plannedDuration: 60,
        scheduledDate: '',
        notes: '',
        syncWithGoogle: false
      };
    });
  }
}
