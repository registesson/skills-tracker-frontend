import { Component, inject } from "@angular/core";
import { AuthService } from "../../../core/services/auth.service";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule],
    template: `
    <header class="header">
      <div class="container">
        <div class="logo">
          <h1>📚 Skills Tracker</h1>
        </div>
        
        @if (authService.isAuthenticated()) {
          <nav class="nav">
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
  `]
})
export class HeaderComponent {
    authService = inject(AuthService);
    private router = inject(Router);

    logout() {
        this.authService.logout();
    }
}
