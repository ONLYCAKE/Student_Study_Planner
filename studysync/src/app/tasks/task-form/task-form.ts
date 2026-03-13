import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { SubjectService } from '../../services/subject.service';

@Component({
  selector: 'app-task-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
})
export class TaskForm {
  showModal = false;
  subjects: any[] = [];
  newTask = {
    title: '',
    description: '',
    subjectId: '',
    dueDate: '',
    priority: 'medium'
  };

  constructor(
    private taskService: TaskService,
    private subjectService: SubjectService
  ) {
    this.loadSubjects();
  }

  loadSubjects() {
    this.subjectService.getSubjects().subscribe(data => {
      this.subjects = data;
    });
  }

  createTask() {
    if (!this.newTask.title || !this.newTask.subjectId) return;
    
    const taskData = {
      ...this.newTask,
      subjectId: parseInt(this.newTask.subjectId),
      dueDate: this.newTask.dueDate ? new Date(this.newTask.dueDate).toISOString() : null
    };
    
    this.taskService.createTask(taskData).subscribe(() => {
      this.showModal = false;
      this.newTask = {
        title: '',
        description: '',
        subjectId: '',
        dueDate: '',
        priority: 'medium'
      };
    });
  }
}
