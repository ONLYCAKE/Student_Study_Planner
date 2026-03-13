import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { from, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SubjectService {
    constructor(private api: ApiService) { }

    getSubjects() {
        return from(this.api.get<{ success: boolean; data: any[] }>('/subjects')).pipe(
            map((res: any) => res.data.data)
        );
    }

    createSubject(subject: any) {
        return from(this.api.post('/subjects', subject));
    }

    updateSubject(id: number, subject: any) {
        return from(this.api.put(`/subjects/${id}`, subject));
    }

    deleteSubject(id: number) {
        return from(this.api.delete(`/subjects/${id}`));
    }
}
