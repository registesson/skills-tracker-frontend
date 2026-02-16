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
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    private handleAuthResponse(response: AuthResponse): void {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        this.currentUser.set({
            id: response.userId,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName
        });
        this.isAuthenticated.set(true);
    }

    private checkAuthStatus(): void {
        const token = this.getToken();
        if (token) {
            this.isAuthenticated.set(true);
        }
    }
}