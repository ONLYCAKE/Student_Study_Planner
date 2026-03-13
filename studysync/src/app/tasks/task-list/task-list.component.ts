import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { SubjectService } from '../../services/subject.service';
import { ToastService } from '../../services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tasks-page animate-fade-in">
      <div class="page-header">
        <div class="page-title"><h1>Study Tasks</h1><p>Track your to-dos and stay productive.</p></div>
        <button class="primary-btn" (click)="showModal = true"><span class="material-icons-round">add</span> Add Task</button>
      </div>

      <div class="task-stats" *ngIf="tasks.length">
        <div class="stat-chip glass"><span class="material-icons-round">format_list_bulleted</span><span>{{ tasks.length }} Total</span></div>
        <div class="stat-chip glass sc-done"><span class="material-icons-round">check_circle</span><span>{{ completedCount }} Done</span></div>
        <div class="stat-chip glass sc-pending"><span class="material-icons-round">radio_button_unchecked</span><span>{{ tasks.length - completedCount }} Pending</span></div>
      </div>

      <div class="card no-hover glass tasks-card" *ngIf="tasks.length; else noTasks">
        <div *ngFor="let task of tasks" class="task-row" [class.done]="task.status === 'completed'" [class.overdue]="task.isOverdue">
          <div class="task-left">
            <label class="custom-checkbox">
              <input type="checkbox" [checked]="task.status === 'completed'" (change)="toggleTask(task)">
              <span class="checkmark"><span class="material-icons-round check-icon">check</span></span>
            </label>
            <div class="task-info">
              <div class="title-row">
                <span class="task-title">{{ task.title }}</span>
                <span class="badge" [class.badge-danger]="task.priority === 'high'" [class.badge-warning]="task.priority === 'medium'" [class.badge-primary]="task.priority === 'low'">
                  {{ task.priority }}
                </span>
                <span class="badge badge-error" *ngIf="task.isOverdue">OVERDUE</span>
              </div>
              <div class="task-meta">
                <span class="meta-item" *ngIf="task.subject?.name">
                   <span class="material-icons-round">menu_book</span> {{ task.subject.name }}
                </span>
                <span class="meta-item" *ngIf="task.dueDate">
                   <span class="material-icons-round">event</span> Due {{ task.dueDate | date:'mediumDate' }}
                </span>
              </div>
            </div>
          </div>
          <div class="task-actions">
            <button class="icon-btn delete" (click)="deleteTask(task.id)"><span class="material-icons-round">delete_outline</span></button>
          </div>
        </div>
      </div>

      <ng-template #noTasks>
        <div class="card no-hover glass empty-state"><div class="empty-icon">✅</div><p>No tasks yet. Add your first study task!</p>
          <button class="primary-btn mt-4" (click)="showModal = true"><span class="material-icons-round">add</span> Add Task</button>
        </div>
      </ng-template>

      <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
        <div class="modal-card-v2 glass" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h2>New Task</h2>
              <p class="text-muted text-sm mt-1">Create a task to keep your studies organized.</p>
            </div>
            <button class="close-btn" (click)="showModal = false">
              <span class="material-icons-round">close</span>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="form-group-v2"><label>Task Title</label><input type="text" [(ngModel)]="newTask.title" placeholder="e.g. Revise Chapter 1"></div>
            <div class="form-row">
              <div class="form-group-v2">
                <label>Priority</label>
                <select [(ngModel)]="newTask.priority">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div class="form-group-v2"><label>Due Date</label><input type="date" [(ngModel)]="newTask.dueDate"></div>
            </div>
            <div class="form-group-v2"><label>Subject</label><select [(ngModel)]="newTask.subjectId"><option *ngFor="let sub of subjects" [value]="sub.id">{{ sub.name }}</option></select></div>
          </div>
          
          <div class="modal-footer">
            <button class="secondary-btn" (click)="showModal = false">Cancel</button>
            <button class="primary-btn" (click)="addTask()">Add Task</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-stats { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .stat-chip { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; border-radius: 9999px; font-size: 0.8125rem; font-weight: 600; background: white; color: #64748B; border: 1px solid rgba(226, 232, 240, 0.5); }
    .stat-chip .material-icons-round { font-size: 1rem; }
    .sc-done { color: #16A34A; }
    .sc-pending { color: #D97706; }
    .tasks-card { padding: 0; overflow: hidden; border-radius: 20px; }
    .task-row { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(241, 245, 249, 0.5); transition: all 0.2s ease; }
    .task-row:last-child { border-bottom: none; }
    .task-row:hover { background: rgba(99, 102, 241, 0.05); transform: translateX(4px); }
    .task-row.done { opacity: 0.6; }
    .task-row.done .task-title { text-decoration: line-through; color: #94A3B8; }
    .task-row.overdue:not(.done) { border-left: 4px solid #EF4444; background: rgba(239, 68, 68, 0.02); }
    .badge-error { background: #FEE2E2; color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.2); }
    
    .task-left { display: flex; align-items: center; gap: 1.25rem; }
    .custom-checkbox { position: relative; display: flex; cursor: pointer; }
    .custom-checkbox input { display: none; }
    .checkmark { width: 24px; height: 24px; border: 2px solid #CBD5E1; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; background: white; }
    .check-icon { display: none; font-size: 1rem; color: white; }
    .custom-checkbox input:checked + .checkmark { background: #6366F1; border-color: #6366F1; }
    .custom-checkbox input:checked + .checkmark .check-icon { display: block; }
    
    .task-info { display: flex; flex-direction: column; gap: 0.375rem; }
    .title-row { display: flex; align-items: center; gap: 0.75rem; }
    .task-title { font-weight: 600; font-size: 1rem; color: #1e293b; }
    .task-meta { display: flex; align-items: center; gap: 1rem; }
    .meta-item { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; color: #64748B; font-weight: 500; }
    .meta-item .material-icons-round { font-size: 0.875rem; }

    .glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.5); }
    
    .modal-card-v2 { position: relative; width: 100%; max-width: 480px; border-radius: 28px; padding: 2.5rem; animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    .modal-header h2 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
    .close-btn { background: #F8FAFC; border: none; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    
    .form-group-v2 { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; width: 100%; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-group-v2 label { font-size: 0.8125rem; font-weight: 600; color: #64748B; padding-left: 0.25rem; }
    .form-group-v2 input, .form-group-v2 select { background: #F8FAFC; border: 2px solid #F1F5F9; border-radius: 12px; padding: 0.75rem 1rem; font-size: 0.9375rem; transition: all 0.2s ease; appearance: none; }
    .form-group-v2 input:focus, .form-group-v2 select:focus { outline: none; border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
    .form-group-v2 select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8.825L.35 3.175 1.4 2.125 6 6.725l4.6-4.6 1.05 1.05z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1rem center; padding-right: 2.5rem; }

    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes modalPop { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  `]
})
export class TaskListComponent implements OnInit {
  tasks: any[] = [];
  subjects: any[] = [];
  showModal = false;
  newTask = { title: '', subjectId: null, priority: 'medium', dueDate: '' };

  get completedCount(): number { return this.tasks.filter(t => t.status === 'completed').length; }

  constructor(private taskService: TaskService, private subjectService: SubjectService, private toast: ToastService) { }

  ngOnInit() {
    this.loadTasks();
    this.subjectService.getSubjects().subscribe(data => this.subjects = data);
  }

  loadTasks() { 
    this.taskService.getTasks().subscribe(data => {
      this.tasks = data;
    }); 
  }

  addTask() {
    this.taskService.createTask(this.newTask).subscribe({
      next: () => {
        this.loadTasks(); 
        this.showModal = false; 
        this.resetNewTask();
        this.toast.success('Task created successfully');
      },
      error: () => this.toast.error('Failed to create task')
    });
  }

  resetNewTask() {
    this.newTask = { title: '', subjectId: null, priority: 'medium', dueDate: '' };
  }

  toggleTask(task: any) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    this.taskService.updateTask(task.id, { status: newStatus }).subscribe(() => this.loadTasks());
  }

  deleteTask(id: number) { 
    if (confirm('Delete this task?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.loadTasks();
          this.toast.info('Task deleted');
        },
        error: () => this.toast.error('Failed to delete task')
      }); 
    }
  }
}
