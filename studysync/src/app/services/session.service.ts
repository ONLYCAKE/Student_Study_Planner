import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { from, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    constructor(private api: ApiService) { }

    getSessions() {
        return from(this.api.get<{ success: boolean; data: any[] }>('/sessions')).pipe(
            map((res: any) => res.data.data)
        );
    }

    createSession(session: any) {
        return from(this.api.post('/sessions', session));
    }

    updateSession(id: number, session: any) {
        return from(this.api.put(`/sessions/${id}`, session));
    }

    deleteSession(id: number) {
        return from(this.api.delete(`/sessions/${id}`));
    }
}
