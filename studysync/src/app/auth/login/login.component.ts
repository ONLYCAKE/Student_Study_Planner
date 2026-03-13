import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, CommonModule],
    template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Welcome Back</h1>
        <p class="subtitle">Please enter your details to sign in.</p>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="Enter your email">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" formControlName="password" placeholder="••••••••">
          </div>
          <button type="submit" class="btn btn-primary w-full" [disabled]="loginForm.invalid">Sign In</button>
          <div *ngIf="error" class="error-msg">{{ error }}</div>
        </form>
        <p class="footer-text">Don't have an account? <a routerLink="/signup">Sign up</a></p>
      </div>
    </div>
  `,
    styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: #F8FAFC;
    }
    .auth-card {
      width: 400px;
      padding: 2.5rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #1E293B; }
    .subtitle { color: #64748B; margin-bottom: 2rem; font-size: 0.9rem }
    .form-group { text-align: left; margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem; }
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      outline: none;
      transition: border-color 0.2s;
      &:focus { border-color: #6366F1; }
    }
    .w-full { width: 100%; margin-top: 1rem; padding: 0.8rem }
    .error-msg { color: #EF4444; margin-top: 1rem; font-size: 0.85rem; }
    .footer-text { margin-top: 2rem; font-size: 0.9rem; color: #64748B }
    .footer-text a { color: #6366F1; text-decoration: none; font-weight: 600 }
  `]
})
export class LoginComponent {
    loginForm: FormGroup;
    error: string | null = null;

    constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.auth.login(this.loginForm.value).subscribe({
                next: () => this.router.navigate(['/dashboard']),
                error: (err) => this.error = err.error.error || 'Login failed'
            });
        }
    }
}
