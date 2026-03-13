import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ScheduleService {
    private apiUrl = 'http://localhost:3000/sessions';

    constructor(private http: HttpClient, private auth: AuthService) { }

    private get headers() {
        return new HttpHeaders({
            'Authorization': `Bearer ${this.auth.getToken}`
        });
    }

    getSessions() {
        return this.http.get<any[]>(this.apiUrl, { headers: this.headers });
    }

    createSession(session: any) {
        return this.http.post(this.apiUrl, session, { headers: this.headers });
    }

    deleteSession(id: number) {
        return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.headers });
    }

    getDashboardStats() {
        return this.http.get<any>('http://localhost:3000/dashboard/stats', { headers: this.headers });
    }
}
