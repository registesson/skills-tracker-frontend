import { HttpClient } from "@angular/common/http";
import { Injectable, signal } from "@angular/core";
import { CreateLearningSessionRequest, LearningSession } from "../models/learning-session.model";
import { Observable, tap } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class LearningSessionService {
    private readonly API_URL = '/api/learning-sessions';

    sessions = signal<LearningSession[]>([]);
    loading = signal<boolean>(false);

    constructor(private http: HttpClient) { }

    loadSessions(): Observable<LearningSession[]> {
        this.loading.set(true);
        return this.http.get<LearningSession[]>(this.API_URL).pipe(
            tap(sessions => {
                this.sessions.set(sessions);
                this.loading.set(false);
            })
        );
    }

    createSession(request: CreateLearningSessionRequest): Observable<LearningSession> {
        return this.http.post<LearningSession>(this.API_URL, request).pipe(
            tap(session => this.sessions.update(sessions => [session, ...sessions]))
        );
    }

    getSessionsBySkill(skillId: string): Observable<LearningSession[]> {
        return this.http.get<LearningSession[]>(`${this.API_URL}/skill/${skillId}`);
    }
}