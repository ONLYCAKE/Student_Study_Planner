import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService, Notification } from '../../services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <div class="search-container">
          <span class="material-icons-round search-icon">search</span>
          <input type="text" placeholder="Search anything..." class="search-input">
        </div>
      </div>
      <div class="topbar-right">
        <!-- Notification Dropdown -->
        <div class="dropdown-container">
          <button class="topbar-icon-btn" (click)="toggleNotifs($event)">
            <span class="material-icons-round">notifications_none</span>
            <span class="notif-badge" *ngIf="(unreadCount$ | async) || 0 > 0">{{ unreadCount$ | async }}</span>
          </button>
          
          <div class="dropdown-menu notif-dropdown glass" *ngIf="showNotifs">
            <div class="dropdown-header">
              <h3>Notifications</h3>
              <span class="badge">{{ unreadCount$ | async }} New</span>
            </div>
            <div class="dropdown-body custom-scrollbar">
              <div *ngIf="(notifications$ | async)?.length === 0" class="empty-notif">
                <span class="material-icons-round">notifications_off</span>
                <p>No new notifications</p>
              </div>
              <div *ngFor="let n of notifications$ | async" class="notif-item" [class.unread]="!n.isRead" (click)="markAsRead(n)">
                <div class="notif-icon" [ngClass]="n.type">
                  <span class="material-icons-round">{{ getNotifIcon(n.type) }}</span>
                </div>
                <div class="notif-content">
                  <h4>{{ n.title }}</h4>
                  <p>{{ n.message }}</p>
                  <span class="time">{{ n.createdAt | date:'shortTime' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Dropdown -->
        <div class="dropdown-container">
          <div class="user-pill" (click)="toggleProfile($event)">
            <div class="avatar">{{ getInitials() }}</div>
            <div class="user-meta">
              <span class="user-name">{{ user?.name || 'Student' }}</span>
              <span class="user-role">Student</span>
            </div>
            <span class="material-icons-round arrow">expand_more</span>
          </div>

          <div class="dropdown-menu profile-dropdown glass" *ngIf="showProfile">
            <div class="profile-header">
              <div class="avatar-large">{{ getInitials() }}</div>
              <div class="info">
                <h4>{{ user?.name }}</h4>
                <p>{{ user?.email }}</p>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <a routerLink="/settings" class="dropdown-item" (click)="showProfile = false">
              <span class="material-icons-round">person_outline</span>
              Account Settings
            </a>
            <a routerLink="/planner" class="dropdown-item" (click)="showProfile = false">
              <span class="material-icons-round">auto_awesome</span>
              Weekly Planner
            </a>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item logout" (click)="logout()">
              <span class="material-icons-round">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: 72px; padding: 0 2rem;
      background: rgba(255,255,255,0.8); backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(226, 232, 240, 0.5);
      display: flex; justify-content: space-between; align-items: center;
      position: sticky; top: 0; z-index: 1000;
    }

    .topbar-left { flex: 1; max-width: 400px; }
    .search-container { position: relative; display: flex; align-items: center; }
    .search-icon { position: absolute; left: 1rem; color: #94A3B8; }
    .search-input {
      width: 100%; padding: 0.625rem 1rem 0.625rem 2.75rem;
      border: 1px solid #E2E8F0; border-radius: 12px;
      background: #F8FAFC; font-size: 0.875rem; transition: all 0.2s;
    }
    .search-input:focus { background: white; border-color: #6366F1; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); outline: none; }

    .topbar-right { display: flex; align-items: center; gap: 1.25rem; }
    
    .dropdown-container { position: relative; }

    .topbar-icon-btn {
      position: relative; width: 42px; height: 42px; border-radius: 12px;
      border: 1px solid #E2E8F0; background: white; cursor: pointer;
      color: #64748B; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
    }
    .topbar-icon-btn:hover { background: #F1F5F9; color: #1e293b; transform: translateY(-1px); }

    .notif-badge {
      position: absolute; top: -5px; right: -5px;
      background: #EF4444; color: white; font-size: 0.6875rem; font-weight: 700;
      min-width: 18px; height: 18px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid white; padding: 0 4px;
    }

    .user-pill {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.5rem 0.875rem 0.5rem 0.5rem;
      border-radius: 14px; border: 1px solid #E2E8F0;
      background: white; cursor: pointer; transition: all 0.2s;
    }
    .user-pill:hover { border-color: #CBD5E1; background: #F8FAFC; }
    .user-pill .arrow { font-size: 1.25rem; color: #94A3B8; }

    .avatar {
      width: 32px; height: 32px; border-radius: 10px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 0.8125rem; font-weight: 700;
    }

    .user-meta { display: flex; flex-direction: column; }
    .user-name { font-size: 0.875rem; font-weight: 700; color: #1e293b; line-height: 1.2; }
    .user-role { font-size: 0.6875rem; color: #64748B; font-weight: 500; }

    /* Dropdown Shared Styles */
    .dropdown-menu {
      position: absolute; top: calc(100% + 12px); right: 0;
      width: 320px; border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12);
      animation: slideUp 0.3s ease-out; z-index: 1001;
      overflow: hidden;
    }
    .glass { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.5); }

    .dropdown-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
    .dropdown-header h3 { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
    .dropdown-header .badge { background: rgba(99, 102, 241, 0.1); color: #6366F1; padding: 0.25rem 0.625rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; }

    .dropdown-body { max-height: 400px; overflow-y: auto; }
    .notif-item {
      padding: 1.25rem 1.5rem; display: flex; gap: 1rem;
      border-bottom: 1px solid rgba(0,0,0,0.03); cursor: pointer; transition: all 0.2s;
    }
    .notif-item:hover { background: rgba(99, 102, 241, 0.03); }
    .notif-item.unread { background: rgba(99, 102, 241, 0.05); }

    .notif-icon {
      width: 40px; height: 40px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .notif-icon .material-icons-round { font-size: 1.25rem; }
    .notif-icon.study_reminder { background: #E0F2FE; color: #0369A1; }
    .notif-icon.exam_alert { background: #FEF2F2; color: #B91C1C; }
    .notif-icon.task_due { background: #F0FDF4; color: #15803D; }

    .notif-content h4 { font-size: 0.875rem; font-weight: 700; color: #1e293b; margin: 0 0 0.25rem 0; }
    .notif-content p { font-size: 0.8125rem; color: #64748B; margin: 0 0 0.5rem 0; line-height: 1.4; }
    .notif-content .time { font-size: 0.75rem; color: #94A3B8; font-weight: 500; }

    .empty-notif { padding: 3rem 2rem; text-align: center; color: #94A3B8; }
    .empty-notif .material-icons-round { font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; }

    /* Profile Dropdown Specifics */
    .profile-dropdown { width: 280px; }
    .profile-header { padding: 1.5rem; display: flex; align-items: center; gap: 1rem; }
    .avatar-large {
      width: 48px; height: 48px; border-radius: 14px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 1.25rem; font-weight: 700;
    }
    .profile-header .info h4 { font-size: 0.9375rem; font-weight: 700; color: #1e293b; margin: 0; }
    .profile-header .info p { font-size: 0.75rem; color: #64748B; margin: 0.125rem 0 0 0; }

    .dropdown-divider { height: 1px; background: rgba(0,0,0,0.05); margin: 0.5rem 0; }
    .dropdown-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.875rem 1.5rem; font-size: 0.875rem; font-weight: 600;
      color: #475569; text-decoration: none; cursor: pointer; border: none; background: none; width: 100%; transition: all 0.2s;
    }
    .dropdown-item:hover { background: #F8FAFC; color: #6366F1; }
    .dropdown-item.logout { color: #EF4444; }
    .dropdown-item.logout:hover { background: #FEF2F2; }
    .dropdown-item .material-icons-round { font-size: 1.25rem; }

    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 768px) {
      .topbar { padding: 0 1rem; }
      .search-container { display: none; }
      .user-meta, .arrow { display: none; }
      .user-pill { padding: 0.375rem; }
    }
  `]
})
export class NavbarComponent implements OnInit {
  user: any;
  showNotifs = false;
  showProfile = false;

  notifications$: Observable<Notification[]>;
  unreadCount$: Observable<number>;

  constructor(
    private authService: AuthService,
    private notifService: NotificationService,
    private router: Router
  ) {
    this.user = this.authService.getUser;
    this.notifications$ = this.notifService.notifications$;
    this.unreadCount$ = this.notifService.unreadCount$;
  }

  ngOnInit() {
    // Listen for clicks outside to close dropdowns
    window.onclick = () => {
      this.showNotifs = false;
      this.showProfile = false;
    };
  }

  toggleNotifs(event: Event) {
    event.stopPropagation();
    this.showProfile = false;
    this.showNotifs = !this.showNotifs;
  }

  toggleProfile(event: Event) {
    event.stopPropagation();
    this.showNotifs = false;
    this.showProfile = !this.showProfile;
  }

  getInitials(): string {
    if (!this.user?.name) return 'S';
    return this.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getNotifIcon(type: string): string {
    switch (type) {
      case 'study_reminder': return 'auto_stories';
      case 'exam_alert': return 'event_upcoming';
      case 'task_due': return 'assignment';
      case 'planner_update': return 'auto_awesome';
      default: return 'notifications';
    }
  }

  markAsRead(n: Notification) {
    if (!n.isRead) {
      this.notifService.markAsRead(n.id).subscribe();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
