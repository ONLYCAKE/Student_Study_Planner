import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SubjectListComponent } from './subjects/subject-list/subject-list.component';
import { ScheduleListComponent } from './schedule/schedule-list/schedule-list.component';
import { TaskListComponent } from './tasks/task-list/task-list.component';
import { ProgressComponent } from './progress/progress.component';
import { SettingsComponent } from './settings/settings.component';
import { PlannerComponent } from './planner/planner.component';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard]
    },
    {
        path: 'subjects',
        component: SubjectListComponent,
        canActivate: [authGuard]
    },
    {
        path: 'schedule',
        component: ScheduleListComponent,
        canActivate: [authGuard]
    },
    {
        path: 'tasks',
        component: TaskListComponent,
        canActivate: [authGuard]
    },
    {
        path: 'planner',
        component: PlannerComponent,
        canActivate: [authGuard]
    },
    {
        path: 'progress',
        component: ProgressComponent,
        canActivate: [authGuard]
    },
    {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [authGuard]
    },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: '/dashboard' }
];
