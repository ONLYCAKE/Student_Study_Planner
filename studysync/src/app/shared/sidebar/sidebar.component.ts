import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon material-icons-round">auto_awesome</span>
          <span class="logo-text">StudySync</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="material-icons-round">dashboard</span>
          <span class="nav-label">Dashboard</span>
        </a>
        <a routerLink="/subjects" routerLinkActive="active" class="nav-item">
          <span class="material-icons-round">menu_book</span>
          <span class="nav-label">Subjects</span>
        </a>
        <a routerLink="/schedule" routerLinkActive="active" class="nav-item">
          <span class="material-icons-round">calendar_today</span>
          <span class="nav-label">Schedule</span>
        </a>
        <a routerLink="/tasks" routerLinkActive="active" class="nav-item">
          <span class="material-icons-round">check_circle</span>
          <span class="nav-label">Tasks</span>
        </a>
        <a routerLink="/planner" routerLinkActive="active" class="nav-item">
          <span class="material-icons-round">auto_awesome</span>
          <span class="nav-label">Planner</span>
        </a>
        <a routerLink="/progress" routerLinkActive="active" class="nav-item">
          <span class="material-icons-round">insights</span>
          <span class="nav-label">Progress</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <button (click)="logout()" class="logout-btn">
          <span class="material-icons-round">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar { width: 260px; height: 100vh; background: #111827; display: flex; flex-direction: column; position: fixed; left: 0; top: 0; z-index: 200; border-right: 1px solid rgba(255,255,255,0.06); }
    .sidebar-header { padding: 1.5rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .logo { display: flex; align-items: center; gap: 0.75rem; }
    .logo-icon { font-size: 1.75rem; background: linear-gradient(135deg, #6366F1, #8B5CF6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .logo-text { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.03em; background: linear-gradient(135deg, #6366F1, #A78BFA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .sidebar-nav { flex: 1; padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
    .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.7rem 1rem; color: #9CA3AF; text-decoration: none; border-radius: 10px; transition: all 0.2s ease; font-size: 0.875rem; font-weight: 500; position: relative; }
    .nav-item .material-icons-round { font-size: 1.25rem; transition: color 0.2s ease; }
    .nav-item:hover { background: rgba(99, 102, 241, 0.08); color: #E0E7FF; }
    .nav-item:hover .material-icons-round { color: #818CF8; }
    .nav-item.active { background: rgba(99, 102, 241, 0.15); color: #C7D2FE; }
    .nav-item.active .material-icons-round { color: #818CF8; }
    .nav-item.active::before { content: ''; position: absolute; left: -0.75rem; top: 50%; transform: translateY(-50%); width: 3px; height: 24px; background: linear-gradient(180deg, #6366F1, #8B5CF6); border-radius: 0 4px 4px 0; }
    .sidebar-footer { padding: 1rem 0.75rem; border-top: 1px solid rgba(255,255,255,0.06); }
    .logout-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.625rem; background: transparent; color: #9CA3AF; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 0.8125rem; font-weight: 500; transition: all 0.2s ease; }
    .logout-btn .material-icons-round { font-size: 1.125rem; }
    .logout-btn:hover { background: rgba(239, 68, 68, 0.1); color: #FCA5A5; border-color: rgba(239, 68, 68, 0.2); }
    @media (max-width: 768px) { .sidebar { transform: translateX(-100%); } }
  `]
})
export class SidebarComponent {
  constructor(private authService: AuthService) { }
  logout() { this.authService.logout(); }
}
