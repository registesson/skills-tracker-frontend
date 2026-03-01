import { Component, inject } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { ThemeService } from "../../../core/services/theme.service";
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <header class="header">
      <div class="container">
        <div class="logo">
          <h1>📚 Skills Tracker</h1>
        </div>
        
        @if (authService.isAuthenticated()) {
          <nav class="nav">
            <a class="nav-link" routerLink="/dashboard">Compétences</a>
            <a class="nav-link" routerLink="/sessions/history">📋 Historique</a>
            <a class="nav-link session-link" routerLink="/sessions/new">⏱️ Nouvelle session</a>
            <div class="user-info">
              <span>👤 {{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</span>
            </div>
            <button class="theme-toggle" (click)="toggleTheme()" [attr.aria-label]="themeService.isDarkMode() ? 'Passer au mode clair' : 'Passer au mode sombre'" title="Basculer le mode sombre">
              @if (themeService.isDarkMode()) {
                ☀️
              } @else {
                🌙
              }
            </button>
            <button class="logout-btn" (click)="logout()">
              Déconnexion
            </button>
          </nav>
        }
      </div>
    </header>
  `,
    styles: [`
    .header {
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
      transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }

    [data-theme="dark"] .header {
      background: #1a202c;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo h1 {
      font-size: 1.5rem;
      color: #667eea;
      margin: 0;
      transition: color 0.3s ease;
    }

    [data-theme="dark"] .logo h1 {
      color: #a0aec0;
    }
    
    .nav {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    
    .user-info {
      color: #4a5568;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    [data-theme="dark"] .user-info {
      color: #cbd5e0;
    }

    .theme-toggle {
      padding: 0.5rem;
      background: none;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1.2rem;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    [data-theme="dark"] .theme-toggle {
      border-color: #4a5568;
    }

    .theme-toggle:hover {
      background: #edf2f7;
      border-color: #cbd5e0;
    }

    [data-theme="dark"] .theme-toggle:hover {
      background: #2d3748;
      border-color: #718096;
    }
    
    .logout-btn {
      padding: 0.5rem 1rem;
      background: #f56565;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s ease;
    }
    
    .logout-btn:hover {
      background: #e53e3e;
    }

    [data-theme="dark"] .logout-btn {
      background: #c53030;
    }

    [data-theme="dark"] .logout-btn:hover {
      background: #9b2c2c;
    }

    .nav-link {
      color: #4a5568;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      transition: background 0.3s ease, color 0.3s ease;
    }

    [data-theme="dark"] .nav-link {
      color: #cbd5e0;
    }

    .nav-link:hover {
      background: #edf2f7;
      color: #667eea;
    }

    [data-theme="dark"] .nav-link:hover {
      background: #2d3748;
      color: #a0aec0;
    }

    .session-link {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
    }

    .session-link:hover {
      opacity: 0.9;
      color: white;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  `]
})
export class HeaderComponent {
    authService = inject(AuthService);
    themeService = inject(ThemeService);
    private router = inject(Router);

    toggleTheme(): void {
      this.themeService.toggleTheme();
    }

    logout() {
        this.authService.logout();
    }
}
