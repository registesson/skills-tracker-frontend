import { Component, inject } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
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
    }
    
    .nav {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    
    .user-info {
      color: #4a5568;
      font-weight: 500;
    }
    
    .logout-btn {
      padding: 0.5rem 1rem;
      background: #f56565;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }
    
    .logout-btn:hover {
      background: #e53e3e;
    }

    .nav-link {
      color: #4a5568;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      transition: background 0.2s, color 0.2s;
    }

    .nav-link:hover {
      background: #edf2f7;
      color: #667eea;
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
    private router = inject(Router);

    logout() {
        this.authService.logout();
    }
}
