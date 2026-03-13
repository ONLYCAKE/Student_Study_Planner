import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pomodoro-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pomodoro-card glass animate-fade-in">
      <div class="timer-header">
        <h3><span class="material-icons-round">timer</span> Pomodoro Focus</h3>
        <span class="mode-badge" [class.mode-break]="isBreak">{{ isBreak ? 'Break' : 'Focus' }}</span>
      </div>

      <div class="timer-display">
        <div class="timer-circle">
          <svg viewBox="0 0 100 100">
            <circle class="bg" cx="50" cy="50" r="45"></circle>
            <circle class="progress" cx="50" cy="50" r="45"
              [style.stroke-dashoffset]="calculateOffset()"></circle>
          </svg>
          <div class="time">{{ formatTime(timeLeft) }}</div>
        </div>
      </div>

      <div class="timer-controls">
        <button class="icon-btn-v2" (click)="resetTimer()" title="Reset">
          <span class="material-icons-round">refresh</span>
        </button>
        <button class="play-btn" (click)="toggleTimer()" [class.active]="isActive">
          <span class="material-icons-round">{{ isActive ? 'pause' : 'play_arrow' }}</span>
        </button>
        <button class="icon-btn-v2" (click)="skipMode()" title="Skip">
          <span class="material-icons-round">skip_next</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pomodoro-card { padding: 1.5rem; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; max-width: 320px; border-radius: 24px; }
    .timer-header { display: flex; justify-content: space-between; align-items: center; width: 100%; }
    .timer-header h3 { font-size: 0.9375rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; color: #1e293b; }
    .mode-badge { font-size: 0.6875rem; padding: 0.25rem 0.625rem; border-radius: 99px; background: #EEF2FF; color: #6366F1; font-weight: 700; text-transform: uppercase; }
    .mode-badge.mode-break { background: #DCFCE7; color: #15803D; }

    .timer-display { position: relative; width: 180px; height: 180px; }
    .timer-circle { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative; }
    svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
    circle { fill: none; stroke-width: 6; stroke-linecap: round; }
    circle.bg { stroke: #F1F5F9; }
    circle.progress { stroke: #6366F1; stroke-dasharray: 283; transition: stroke-dashoffset 0.1s linear, stroke 0.3s ease; }
    .timer-circle .time { font-size: 2.25rem; font-weight: 800; font-variant-numeric: tabular-nums; color: #1e293b; letter-spacing: -0.05em; }

    .timer-controls { display: flex; align-items: center; gap: 1.5rem; }
    .play-btn { width: 56px; height: 56px; border-radius: 50%; background: #6366F1; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3); transition: all 0.2s ease; }
    .play-btn:hover { transform: scale(1.05); box-shadow: 0 12px 24px rgba(99, 102, 241, 0.4); }
    .play-btn.active { background: #FACC15; color: #854D0E; box-shadow: 0 8px 16px rgba(250, 204, 21, 0.3); }
    .play-btn .material-icons-round { font-size: 2rem; }

    .icon-btn-v2 { width: 40px; height: 40px; border-radius: 50%; background: #F8FAFC; border: 1px solid #E2E8F0; color: #64748B; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
    .icon-btn-v2:hover { background: #F1F5F9; color: #1e293b; border-color: #CBD5E1; }

    @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class PomodoroTimerComponent implements OnDestroy {
  isActive = false;
  isBreak = false;
  timeLeft = 25 * 60;
  totalTime = 25 * 60;
  timerInterval: any;

  toggleTimer() {
    if (this.isActive) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.isActive = true;
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.switchMode();
      }
    }, 1000);
  }

  pauseTimer() {
    this.isActive = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  resetTimer() {
    this.pauseTimer();
    this.timeLeft = this.totalTime;
  }

  skipMode() {
    this.switchMode();
  }

  switchMode() {
    this.pauseTimer();
    this.isBreak = !this.isBreak;
    this.totalTime = (this.isBreak ? 5 : 25) * 60;
    this.timeLeft = this.totalTime;
    this.startTimer();
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  calculateOffset(): number {
    return 283 * (1 - this.timeLeft / this.totalTime);
  }

  ngOnDestroy() {
    this.pauseTimer();
  }
}
