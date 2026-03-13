import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, CommonModule],
    template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Create Account</h1>
        <p class="subtitle">Join StudySync and start planning smarter.</p>
        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" formControlName="name" placeholder="Your name">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="Email address">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" formControlName="password" placeholder="••••••••">
          </div>
          <button type="submit" class="btn btn-primary w-full" [disabled]="signupForm.invalid">Sign Up</button>
          <div *ngIf="error" class="error-msg">{{ error }}</div>
        </form>
        <p class="footer-text">Already have an account? <a routerLink="/login">Sign in</a></p>
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
export class SignupComponent {
    signupForm: FormGroup;
    error: string | null = null;

    constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
        this.signupForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    onSubmit() {
        if (this.signupForm.valid) {
            this.auth.signup(this.signupForm.value).subscribe({
                next: () => this.router.navigate(['/login']),
                error: (err) => this.error = err.error.error || 'Signup failed'
            });
        }
    }
}
