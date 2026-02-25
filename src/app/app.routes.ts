import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/skills/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'sessions/new', 
    loadComponent: () => import('./features/sessions/session-form/session-form.component').then(m => m.SessionFormComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'sessions/history', 
    loadComponent: () => import('./features/sessions/session-history/session-history.component').then(m => m.SessionHistoryComponent),
    canActivate: [authGuard]
  },
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/dashboard' 
  }
];
