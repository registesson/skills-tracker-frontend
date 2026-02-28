import { Injectable, signal } from "@angular/core";
import { AuthRequest, AuthResponse, RegisterRequest, User } from "../models/auth.model";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, tap } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AuthService { 
    private readonly API_URL = '/api/auth';
    private readonly TOKEN_KEY = 'auth_token';
    private readonly USER_KEY = 'auth_user';

    currentUser = signal<User | null>(null);
    isAuthenticated = signal<boolean>(false);

    constructor(private http: HttpClient, private router: Router) {
        this.checkAuthStatus()
    }

    login (request: AuthRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API_URL}/login`, request).pipe(
            tap(response => this.handleAuthResponse(response))
        );
    }

    register(request: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.API_URL}/register`, request).pipe(
            tap(response => this.handleAuthResponse(response))
        );
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    private handleAuthResponse(response: AuthResponse): void {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        const user: User = {
            id: response.userId,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName
        };
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
    }

    private checkAuthStatus(): void {
        const token = this.getToken();
        if (token) {
            this.isAuthenticated.set(true);
            // Restaurer les informations de l'utilisateur depuis le localStorage
            const userJson = localStorage.getItem(this.USER_KEY);
            if (userJson) {
                try {
                    const user = JSON.parse(userJson) as User;
                    this.currentUser.set(user);
                } catch (e) {
                    console.error('Erreur lors de la restauration de l\'utilisateur', e);
                }
            }
        }
    }
}