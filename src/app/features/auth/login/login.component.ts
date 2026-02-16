import { Component, signal } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../core/services/auth.service";
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-login',
    standalone: true,   
    imports: [ReactiveFormsModule, CommonModule, RouterLink],
    template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Skills Tracker</h1>
        <h2>Connexion</h2>
        
        @if (errorMessage()) {
          <div class="error-message">
            {{ errorMessage() }}
          </div>
        }
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              id="email" 
              type="email" 
              formControlName="email"
              placeholder="votre@email.com"
            />
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <span class="error">Email invalide</span>
            }
          </div>
          
          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input 
              id="password" 
              type="password" 
              formControlName="password"
              placeholder="••••••••"
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <span class="error">Mot de passe requis</span>
            }
          </div>
          
          <button type="submit" [disabled]="loginForm.invalid || loading()">
            @if (loading()) {
              Connexion en cours...
            } @else {
              Se connecter
            }
          </button>
        </form>
        
        <p class="register-link">
          Pas encore de compte ? <a routerLink="/register">S'inscrire</a>
        </p>
      </div>
    </div>
  `,
    styles: [`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .login-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }
        
        h1 {
          text-align: center;
          color: #667eea;
          margin-bottom: 0.5rem;
        }
        
        h2 {
          text-align: center;
          color: #4a5568;
          margin-bottom: 2rem;
          font-size: 1.5rem;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #4a5568;
          font-weight: 500;
        }
        
        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 1rem;
        }
        
        input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        button {
          width: 100%;
          padding: 0.75rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
        }
        
        button:hover:not(:disabled) {
          background: #5a67d8;
        }
        
        button:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
        }
        
        .error {
          color: #e53e3e;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        
        .error-message {
          background: #fed7d7;
          color: #c53030;
          padding: 0.75rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        
        .register-link {
          text-align: center;
          margin-top: 1.5rem;
          color: #718096;
        }
        
        .register-link a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }
      `],
})
export class LoginComponent {
    loginForm: FormGroup;
    loading = signal(false);
    errorMessage = signal('');

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
    ) {

        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]],
        });
    }


    onSubmit() {
        if (this.loginForm.valid) {
            this.loading.set(true);
            this.errorMessage.set('');

            this.authService.login(this.loginForm.value).subscribe({
                next: () => {   this.router.navigate(['/dashboard']); },
                error: (error) => {
                    this.errorMessage.set('Email ou mot de passe incorrect');
                    this.loading.set(false);
                }
            });

        }
    }
}