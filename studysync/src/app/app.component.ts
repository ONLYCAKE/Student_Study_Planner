import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { ToastComponent } from './shared/toast/toast.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent, ToastComponent, CommonModule],
  template: `
    <div class="app-shell" [class.authenticated]="isLoggedIn()">
      <app-sidebar *ngIf="isLoggedIn()"></app-sidebar>
      <div class="main-area">
        <app-navbar *ngIf="isLoggedIn()"></app-navbar>
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
      <app-toast></app-toast>
    </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      min-height: 100vh;
      background: #F1F5F9;
    }
    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .app-shell.authenticated .main-area {
      margin-left: 260px;
    }
    .page-content {
      flex: 1;
      padding: 2rem 2.5rem;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 768px) {
      .app-shell.authenticated .main-area {
        margin-left: 0;
      }
      .page-content {
        padding: 1.25rem;
      }
    }
  `]
})
export class AppComponent {
  constructor(private authService: AuthService) { }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }
}
