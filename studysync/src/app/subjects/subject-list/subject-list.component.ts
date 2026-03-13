import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubjectService } from '../../services/subject.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-subject-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="subjects-page animate-fade-in">
      <div class="page-header">
        <div class="page-title">
          <h1>My Learning <span class="gradient-text">Subjects</span></h1>
          <p>Track your academic goals and study progress in real-time.</p>
        </div>
        <button class="primary-btn" (click)="showModal = true">
          <span class="material-icons-round">add</span>
          <span>Add New Subject</span>
        </button>
      </div>

      <div class="subjects-grid" *ngIf="subjects.length; else noSubjects">
        <div *ngFor="let subject of subjects; let i = index" class="subject-card-v2 glass animate-slide-up" [style.--delay]="(i * 0.1) + 's'">
          <div class="card-glow" [style.background]="getColor(i)"></div>
          
          <div class="card-main">
            <div class="card-header-v2">
              <div class="subject-icon" [style.background]="getColor(i, 0.1)" [style.color]="getColor(i, 1)">
                <span class="material-icons-round">menu_book</span>
              </div>
              <div class="actions">
                <button class="icon-btn-v2" (click)="deleteSubject(subject.id)" title="Delete">
                  <span class="material-icons-round">delete_outline</span>
                </button>
              </div>
            </div>

            <div class="subject-body">
              <h3 class="subject-name">{{ subject.name }}</h3>
              <div class="exam-date" *ngIf="subject.examDate">
                <span class="material-icons-round">event</span>
                <span>Exam: {{ subject.examDate | date:'MMM d, yyyy' }}</span>
              </div>
            </div>

            <div class="progress-container">
              <div class="progress-labels">
                <span class="hours-info"><b>{{ subject.completedStudyHours || 0 }}h</b> / {{ subject.targetStudyHours }}h</span>
                <span class="perc-info">{{ subject.progressPercentage || 0 }}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" 
                     [style.width.%]="subject.progressPercentage || 0" 
                     [style.background]="getColor(i)">
                </div>
              </div>
              <div class="remaining-info" *ngIf="subject.remainingStudyHours > 0">
                 {{ subject.remainingStudyHours }} hours left to reach target
              </div>
              <div class="completed-badge" *ngIf="subject.remainingStudyHours <= 0">
                <span class="material-icons-round">verified</span> Target Reached
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #noSubjects>
        <div class="empty-state-v2 glass">
          <div class="empty-icon-box">
             <span class="material-icons-round">library_books</span>
          </div>
          <h3>Start your journey</h3>
          <p>You haven't added any subjects yet. Break down your curriculum to start tracking progress.</p>
          <button class="primary-btn mt-6" (click)="showModal = true">
            <span class="material-icons-round">add</span> Add Your First Subject
          </button>
        </div>
      </ng-template>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
        <div class="modal-card-v2 glass" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Add New Subject</h2>
            <button class="close-btn" (click)="showModal = false">
              <span class="material-icons-round">close</span>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="form-group-v2">
              <label>Subject Name</label>
              <input type="text" [(ngModel)]="newSubject.name" placeholder="e.g. Advanced Calculus" required>
            </div>
            <div class="form-row">
              <div class="form-group-v2">
                <label>Target Hours</label>
                <input type="number" [(ngModel)]="newSubject.targetStudyHours" min="1" max="1000" required>
              </div>
              <div class="form-group-v2">
                <label>Exam Date</label>
                <input type="date" [(ngModel)]="newSubject.examDate">
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="secondary-btn" (click)="showModal = false">Cancel</button>
            <button class="primary-btn" (click)="addSubject()">Create Subject</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subjects-page { padding: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
    .page-title h1 { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.05em; margin-bottom: 0.25rem; }
    .gradient-text { background: linear-gradient(135deg, #6366F1, #8B5CF6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    
    .btn-premium { background: var(--primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 14px; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; box-shadow: 0 10px 20px -10px rgba(99, 102, 241, 0.5); transition: all 0.3s ease; }
    .btn-premium:hover { transform: translateY(-2px); box-shadow: 0 15px 30px -10px rgba(99, 102, 241, 0.6); }

    .subjects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
    
    .subject-card-v2 { position: relative; border-radius: 24px; padding: 1.5rem; overflow: hidden; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .subject-card-v2:hover { transform: translateY(-8px) scale(1.02); }
    
    .card-glow { position: absolute; top: -50px; right: -50px; width: 120px; height: 120px; filter: blur(40px); opacity: 0.15; border-radius: 50%; }
    
    .card-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .subject-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
    
    .subject-body { margin-bottom: 1.5rem; }
    .subject-name { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; }
    .exam-date { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: #64748B; font-weight: 500; }
    .exam-date .material-icons-round { font-size: 1rem; color: #94A3B8; }

    .progress-container { display: flex; flex-direction: column; gap: 0.75rem; }
    .progress-labels { display: flex; justify-content: space-between; align-items: center; }
    .hours-info { font-size: 0.875rem; color: #475569; }
    .perc-info { font-size: 0.875rem; font-weight: 700; color: #1e293b; }
    
    .progress-track { height: 8px; background: #EEF2FF; border-radius: 99px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 99px; transition: width 1s cubic-bezier(0.22, 1, 0.36, 1); }
    
    .remaining-info { font-size: 0.75rem; color: #94A3B8; font-weight: 500; font-style: italic; }
    .completed-badge { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; color: #059669; font-weight: 700; background: #ECFDF5; padding: 0.25rem 0.625rem; border-radius: 99px; align-self: flex-start; }
    .completed-badge .material-icons-round { font-size: 0.875rem; }

    .empty-state-v2 { padding: 4rem 2rem; display: flex; flex-direction: column; align-items: center; text-align: center; border-radius: 32px; }
    .empty-icon-box { width: 80px; height: 80px; background: #EEF2FF; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin-bottom: 2rem; color: var(--primary); }
    .empty-icon-box .material-icons-round { font-size: 2.5rem; }
    .empty-state-v2 h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
    .empty-state-v2 p { color: #64748B; max-width: 320px; }

    .modal-card-v2 { position: relative; width: 100%; max-width: 480px; border-radius: 28px; padding: 2.5rem; animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .close-btn { background: #F8FAFC; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    
    .form-group-v2 { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; width: 100%; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group-v2 label { font-size: 0.8125rem; font-weight: 600; color: #64748B; padding-left: 0.25rem; }
    .form-group-v2 input { background: #F8FAFC; border: 2px solid #F1F5F9; border-radius: 12px; padding: 0.75rem 1rem; font-size: 0.9375rem; transition: all 0.2s ease; }
    .form-group-v2 input:focus { outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }

    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
    .btn-secondary { background: #F1F5F9; color: #475569; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; }
    .btn-primary { background: var(--primary); color: white; border: none; padding: 0.75rem 1.75rem; border-radius: 12px; font-weight: 600; cursor: pointer; }

    .glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 10px 40px rgba(0,0,0,0.05); }
    .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
    .animate-slide-up { animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; animation-delay: var(--delay); }

    @keyframes modalPop { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 640px) { .subjects-grid { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class SubjectListComponent implements OnInit {
  subjects: any[] = [];
  showModal = false;
  newSubject = { name: '', targetStudyHours: 10, examDate: '' };

  private colors = [
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#3B82F6', // Blue
  ];

  constructor(private subjectService: SubjectService, private toast: ToastService) { }

  ngOnInit() {
    this.loadSubjects();
  }

  getColor(i: number, opacity: number = 1): string {
    const color = this.colors[i % this.colors.length];
    if (opacity === 1) return color;
    
    // Simple hex to rgba conversion for the icon background
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  loadSubjects() {
    this.subjectService.getSubjects().subscribe(data => {
      this.subjects = data;
    });
  }

  addSubject() {
    // Validate form data
    if (!this.newSubject.name || this.newSubject.name.trim() === '') {
      this.toast.error('Please enter a subject name');
      return;
    }
    
    if (!this.newSubject.targetStudyHours || this.newSubject.targetStudyHours <= 0) {
      this.toast.error('Please enter a valid target hours (greater than 0)');
      return;
    }
    
    const subjectData = {
      name: this.newSubject.name.trim(),
      targetHours: this.newSubject.targetStudyHours,
      examDate: this.newSubject.examDate ? new Date(this.newSubject.examDate).toISOString() : null
    };
    
    console.log('Sending subject data:', subjectData); // Debug log
    
    this.subjectService.createSubject(subjectData).subscribe({
      next: (response) => {
        console.log('Subject created successfully:', response);
        this.loadSubjects();
        this.showModal = false;
        this.toast.success('Subject created successfully!');
        this.newSubject = { name: '', targetStudyHours: 10, examDate: '' };
      },
      error: (error) => {
        console.error('Error creating subject:', error);
        console.error('Error response:', error.response?.data);
        this.toast.error('Failed to create subject: ' + (error.response?.data?.error || error.message));
      }
    });
  }

  deleteSubject(id: number) {
    if (confirm('Are you sure you want to delete this subject and all related study sessions?')) {
      this.subjectService.deleteSubject(id).subscribe(() => this.loadSubjects());
    }
  }
}
