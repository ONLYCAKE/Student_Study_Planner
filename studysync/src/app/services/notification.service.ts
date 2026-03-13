import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';

export interface Notification {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: 'study_reminder' | 'exam_alert' | 'task_due' | 'planner_update' | 'system';
  isRead: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private socket: Socket | null = null;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private api: ApiService, private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.initSocket(user.id);
        this.loadNotifications();
        this.loadUnreadCount();
      } else {
        this.disconnectSocket();
        this.notificationsSubject.next([]);
        this.unreadCountSubject.next(0);
      }
    });
  }

  private initSocket(userId: number) {
    this.disconnectSocket();
    this.socket = io('http://localhost:3000', {
      query: { userId: userId.toString() }
    });

    this.socket.on('notification:new', (notification: Notification) => {
      const current = this.notificationsSubject.value;
      this.notificationsSubject.next([notification, ...current]);
      this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
    });
  }

  private disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  loadNotifications() {
    from(this.api.get<{ success: boolean; data: Notification[] }>('/notifications')).pipe(
        map(res => res.data)
    ).subscribe(res => {
      if (res.success) {
        this.notificationsSubject.next(res.data);
      }
    });
  }

  loadUnreadCount() {
    from(this.api.get<{ success: boolean; count: number }>('/notifications/unread-count')).pipe(
        map(res => res.data)
    ).subscribe(res => {
      if (res.success) {
        this.unreadCountSubject.next(res.count);
      }
    });
  }

  markAsRead(id: string) {
    return from(this.api.patch<{ success: boolean }>(`/notifications/${id}/read`, {})).pipe(
      tap(() => {
        const updated = this.notificationsSubject.value.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        );
        this.notificationsSubject.next(updated);
        this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
      })
    );
  }
}
