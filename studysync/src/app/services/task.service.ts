import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { from, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    constructor(private api: ApiService) { }

    getTasks() {
        return from(this.api.get<{ success: boolean; data: any[] }>('/tasks')).pipe(
            map((res: any) => res.data.data)
        );
    }

    createTask(task: any) {
        return from(this.api.post('/tasks', task));
    }

    updateTask(id: number, task: any) {
        return from(this.api.put(`/tasks/${id}`, task));
    }

    deleteTask(id: number) {
        return from(this.api.delete(`/tasks/${id}`));
    }
}
