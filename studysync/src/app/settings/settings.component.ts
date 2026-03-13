import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page animate-fade-in">
      <div class="page-header">
        <h1>Account <span class="gradient-text">Settings</span></h1>
        <p>Manage your profile information and security preferences.</p>
      </div>

      <div class="settings-container mt-8">
        <!-- Profile Card -->
        <div class="settings-card glass">
          <div class="card-header">
            <span class="material-icons-round icon purple">person</span>
            <div class="title">
              <h3>Profile Information</h3>
              <p>Update your name and email address.</p>
            </div>
          </div>
          
          <div class="card-body">
            <div class="form-row">
              <div class="form-group-v2">
                <label>Full Name</label>
                <input type="text" [(ngModel)]="profile.name" placeholder="Enter your name">
              </div>
              <div class="form-group-v2">
                <label>Email Address</label>
                <input type="email" [(ngModel)]="profile.email" placeholder="Enter your email">
              </div>
            </div>
            <div class="actions">
              <button class="primary-btn" (click)="updateProfile()" [disabled]="loading">
                <span class="material-icons-round" *ngIf="!loading">save</span>
                {{ loading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Google Calendar Integration -->
        <div class="settings-card glass mt-8">
          <div class="card-header">
            <span class="material-icons-round icon google-icon">calendar_month</span>
            <div class="title">
              <h3>Google Calendar</h3>
              <p>Sync your study sessions with your personal Google Calendar.</p>
            </div>
            <div class="status-badge" [class.connected]="googleConnected">
              {{ googleConnected ? 'Connected' : 'Not Connected' }}
            </div>
          </div>
          
          <div class="card-body">
            <div class="integration-content">
              <p class="description">
                When connected, StudySync will automatically create events in your Google Calendar for every scheduled study session.
              </p>
              
              <div class="integration-actions mt-4">
                <button *ngIf="!googleConnected" class="google-btn" (click)="connectGoogle()">
                  <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" width="20">
                  Connect Google Calendar
                </button>
                
                <button *ngIf="googleConnected" class="outline-btn danger" (click)="disconnectGoogle()">
                  <span class="material-icons-round">link_off</span>
                  Disconnect Google Calendar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Password Card -->
        <div class="settings-card glass mt-8">
          <div class="card-header">
            <span class="material-icons-round icon blue">lock</span>
            <div class="title">
              <h3>Security</h3>
              <p>Change your password to keep your account secure.</p>
            </div>
          </div>
          
          <div class="card-body">
            <div class="form-group-v2">
              <label>Current Password</label>
              <input type="password" [(ngModel)]="passwordData.currentPassword" placeholder="••••••••">
            </div>
            <div class="form-row">
              <div class="form-group-v2">
                <label>New Password</label>
                <input type="password" [(ngModel)]="passwordData.newPassword" placeholder="••••••••">
              </div>
              <div class="form-group-v2">
                <label>Confirm New Password</label>
                <input type="password" [(ngModel)]="passwordData.confirmPassword" placeholder="••••••••">
              </div>
            </div>
            <div class="actions">
              <button class="primary-btn" (click)="updatePassword()" [disabled]="passLoading">
                <span class="material-icons-round" *ngIf="!passLoading">key</span>
                {{ passLoading ? 'Updating...' : 'Update Password' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page { padding: 1rem; }
    .page-header h1 { font-size: 2.25rem; font-weight: 800; letter-spacing: -0.05em; margin-bottom: 0.25rem; }
    .page-header p { color: #64748B; font-size: 1rem; }
    .gradient-text { background: linear-gradient(135deg, #6366F1, #8B5CF6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

    .settings-container { max-width: 800px; }
    .settings-card { border-radius: 24px; padding: 2rem; overflow: hidden; }
    
    .card-header { display: flex; align-items: center; gap: 1.25rem; margin-bottom: 2rem; }
    .card-header .icon { font-size: 2.5rem; padding: 0.75rem; border-radius: 16px; background: rgba(255,255,255,0.5); }
    .card-header .icon.purple { color: #8B5CF6; }
    .card-header .icon.blue { color: #3B82F6; }
    .card-header .icon.google-icon { color: #4285F4; }
    .card-header .title h3 { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }
    .card-header .title p { font-size: 0.875rem; color: #64748B; margin: 0.25rem 0 0 0; }

    .status-badge { margin-left: auto; padding: 0.5rem 1rem; border-radius: 100px; font-size: 0.75rem; font-weight: 700; background: #F1F5F9; color: #64748B; }
    .status-badge.connected { background: #DCFCE7; color: #166534; }

    .description { color: #64748B; line-height: 1.6; }

    .google-btn { 
      display: flex; align-items: center; gap: 0.75rem; background: white; 
      border: 1px solid #E2E8F0; padding: 0.75rem 1.5rem; border-radius: 12px;
      font-weight: 600; color: #1E293B; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      transition: all 0.2s ease; cursor: pointer;
    }
    .google-btn:hover { background: #F8FAFC; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }

    .outline-btn.danger { border: 1px solid #FEE2E2; color: #EF4444; background: white; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
    .outline-btn.danger:hover { background: #FEF2F2; border-color: #FECACA; }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
    .form-group-v2 { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
    .form-group-v2 label { font-size: 0.875rem; font-weight: 600; color: #475569; padding-left: 0.25rem; }
    .form-group-v2 input { 
      background: #F8FAFC; border: 2px solid #F1F5F9; border-radius: 12px; 
      padding: 0.875rem 1rem; font-size: 0.9375rem; transition: all 0.2s ease; 
      width: 100%; box-sizing: border-box;
    }
    .form-group-v2 input:focus { 
      outline: none; border-color: var(--primary); background: white; 
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); 
    }

    .actions { display: flex; justify-content: flex-end; }
    .primary-btn { 
      display: flex; align-items: center; gap: 0.5rem; background: linear-gradient(135deg, #6366F1, #8B5CF6);
      color: white; border: none; padding: 0.75rem 1.75rem; border-radius: 12px;
      font-weight: 600; cursor: pointer; transition: all 0.2s ease;
    }
    .primary-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); }

    .glass { background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.5); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04); }
    .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 640px) {
      .form-row { grid-template-columns: 1fr; gap: 0; }
    }
  `]
})
export class SettingsComponent implements OnInit {
  profile = { name: '', email: '' };
  passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
  googleConnected = false;
  loading = false;
  passLoading = false;

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    from(this.api.get<{ success: boolean; data: any }>('/users/me')).pipe(
      map(res => res.data)
    ).subscribe(res => {
      if (res.success) {
        this.profile.name = res.data.name;
        this.profile.email = res.data.email;
        this.googleConnected = res.data.googleConnected;
      }
    });
  }

  connectGoogle() {
    const token = localStorage.getItem('token');
    window.location.href = `http://localhost:3000/api/google/connect?token=${token}`;
  }

  disconnectGoogle() {
    if (confirm('Are you sure you want to disconnect Google Calendar?')) {
      from(this.api.delete<{ success: boolean }>('/api/google/disconnect')).pipe(
        map(res => res.data)
      ).subscribe({
        next: (res) => {
          if (res.success) {
            this.googleConnected = false;
            this.toast.success('Google Calendar disconnected');
          }
        },
        error: () => this.toast.error('Failed to disconnect Google Calendar')
      });
    }
  }

  updateProfile() {
    if (!this.profile.name || !this.profile.email) {
      this.toast.error('Name and email are required');
      return;
    }

    this.loading = true;
    from(this.api.put<{ success: boolean; data: any }>('/users/profile', this.profile)).pipe(
      map(res => res.data)
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success('Profile updated successfully');
        }
        this.loading = false;
      },
      error: (err) => {
        this.toast.error(err.response?.data?.error || 'Failed to update profile');
        this.loading = false;
      }
    });
  }

  updatePassword() {
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword) {
      this.toast.error('All password fields are required');
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.toast.error('New passwords do not match');
      return;
    }

    this.passLoading = true;
    from(this.api.put<{ success: boolean; message: string }>('/users/password', {
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    })).pipe(
      map(res => res.data)
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast.success('Password updated successfully');
          this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
        }
        this.passLoading = false;
      },
      error: (err) => {
        this.toast.error(err.response?.data?.error || 'Failed to update password');
        this.passLoading = false;
      }
    });
  }
}
