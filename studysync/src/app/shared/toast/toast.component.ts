import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts; let i = index" 
           class="toast-card animate-toast" 
           [ngClass]="'toast-' + toast.type"
           (click)="removeToast(i)">
        <span class="material-icons-round toast-icon">{{ getIcon(toast.type) }}</span>
        <div class="toast-content">
          <h4>{{ getTitle(toast.type) }}</h4>
          <p>{{ toast.message }}</p>
        </div>
        <button class="toast-close" (click)="removeToast(i); $event.stopPropagation()">
          <span class="material-icons-round">close</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 2rem;
      right: 2rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      pointer-events: none; /* Let clicks pass through container */
    }

    .toast-card {
      pointer-events: auto; /* Re-enable clicks on the cards themselves */
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(16px);
      padding: 1.25rem 1.5rem;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      border-left: 6px solid;
      min-width: 320px;
      max-width: 400px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .toast-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
    }

    .toast-icon {
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 0.125rem;
    }

    .toast-content {
      flex: 1;
    }

    .toast-content h4 {
      margin: 0 0 0.25rem 0;
      font-size: 0.9375rem;
      font-weight: 700;
      color: #1e293b;
    }

    .toast-content p {
      margin: 0;
      font-size: 0.8125rem;
      color: #64748B;
      line-height: 1.4;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: #94A3B8;
      cursor: pointer;
      padding: 0;
      display: flex;
      border-radius: 50%;
      transition: all 0.2s;
    }
    
    .toast-close:hover {
      color: #1e293b;
      background: #F1F5F9;
    }

    .toast-close .material-icons-round {
      font-size: 1.25rem;
    }

    /* Type variations */
    .toast-success { border-color: #10B981; }
    .toast-success .toast-icon { color: #10B981; }
    
    .toast-error { border-color: #EF4444; }
    .toast-error .toast-icon { color: #EF4444; }
    
    .toast-warning { border-color: #F59E0B; }
    .toast-warning .toast-icon { color: #F59E0B; }
    
    .toast-info { border-color: #3B82F6; }
    .toast-info .toast-icon { color: #3B82F6; }

    /* Animation */
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(50px) scale(0.9); }
      to { opacity: 1; transform: translateX(0) scale(1); }
    }

    .animate-toast {
      animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    
    @media (max-width: 640px) {
      .toast-container {
        top: auto;
        bottom: 2rem;
        left: 1rem;
        right: 1rem;
        align-items: center;
      }
      .toast-card {
        min-width: 100%;
        max-width: 100%;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private subscription!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toastState$.subscribe(toast => {
      this.toasts.push(toast);
      
      // Auto dismiss after 4 seconds
      setTimeout(() => {
        this.removeToast(0);
      }, 4000);
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeToast(index: number) {
    if (index >= 0 && index < this.toasts.length) {
      this.toasts.splice(index, 1);
    }
  }

  getIcon(type: string): string {
    switch(type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  getTitle(type: string): string {
    switch(type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Notice';
      default: return 'Information';
    }
  }
}
