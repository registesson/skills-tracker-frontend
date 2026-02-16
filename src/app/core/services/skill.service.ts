import { Injectable, signal } from "@angular/core";
import { CreateSkillRequest, Skill, SkillCategory, SkillLevel } from "../models/skill.model";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SkillService {
    private readonly API_URL = '/api/skills';

    skills = signal<Skill[]>([]);
    loading = signal<boolean>(false);

    constructor(private http: HttpClient) { }

    loadSkills(): Observable<Skill[]> {
        this.loading.set(true);
        return this.http.get<Skill[]>(this.API_URL).pipe(
            tap(skills => {
                this.skills.set(skills);
                this.loading.set(false);
            })
        );
    }


    createSkill(request: CreateSkillRequest): Observable<Skill> {
        return this.http.post<Skill>(this.API_URL, request).pipe(
            tap(skill => {
                this.skills.update(prev => [...prev, skill]);
            })
        );
    }

    updateSkillLevel(skillId: string, level: SkillLevel): Observable<Skill> {
        return this.http.put<Skill>(`${this.API_URL}/${skillId}/level`, { level }).pipe(
            tap(updatedSkill => {
                this.skills.update(skills => skills.map(s => s.id === skillId ? updatedSkill : s));
            })
        );
    }

    deleteSkill(skillId: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${skillId}`).pipe(
          tap(() => {
            this.skills.update(skills => skills.filter(s => s.id !== skillId));
          })
        );
      }
      
      getSkillsByCategory(category: SkillCategory): Observable<Skill[]> {
        return this.http.get<Skill[]>(`${this.API_URL}/category/${category}`);
      }
}
