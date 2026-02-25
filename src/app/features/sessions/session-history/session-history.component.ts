import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LearningSessionService } from '../../../core/services/learning-session.service';
import { LearningSession } from '../../../core/models/learning-session.model';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-session-history',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  template: `
    <app-header></app-header>

    <div class="history-container">
      <div class="history-header">
        <h2>📋 Historique des sessions</h2>
        <p class="subtitle">Visualisez votre activité d'apprentissage</p>
      </div>

      <!-- Filtre par compétence -->
      <div class="filter-bar">
        <label for="skillFilter">Filtrer par compétence :</label>
        <select id="skillFilter" [ngModel]="selectedSkill()" (ngModelChange)="selectedSkill.set($event)">
          <option value="">Toutes les compétences</option>
          @for (name of skillNames(); track name) {
            <option [value]="name">{{ name }}</option>
          }
        </select>
      </div>

      <!-- Statistiques -->
      @if (filteredSessions().length > 0) {
        <div class="stats-bar">
          <div class="stat">
            <span class="stat-value">{{ filteredSessions().length }}</span>
            <span class="stat-label">sessions</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ totalHours() }}</span>
            <span class="stat-label">heures au total</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ avgDuration() }}</span>
            <span class="stat-label">min en moyenne</span>
          </div>
        </div>
      }

      <!-- Loading -->
      @if (loading()) {
        <div class="loading">
          <p>Chargement des sessions...</p>
        </div>
      }

      <!-- Liste vide -->
      @if (!loading() && filteredSessions().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">📭</span>
          <p>Aucune session trouvée</p>
          @if (selectedSkill()) {
            <p class="empty-hint">Essayez de retirer le filtre pour voir toutes les sessions.</p>
          } @else {
            <p class="empty-hint">Commencez par enregistrer une session d'apprentissage.</p>
          }
        </div>
      }

      <!-- Liste des sessions -->
      @if (!loading() && filteredSessions().length > 0) {
        <div class="sessions-list">
          @for (session of filteredSessions(); track session.id) {
            <div class="session-card">
              <div class="session-main">
                <div class="session-date">
                  <span class="date-day">{{ formatDay(session.date) }}</span>
                  <span class="date-month">{{ formatMonth(session.date) }}</span>
                  <span class="date-year">{{ formatYear(session.date) }}</span>
                </div>
                <div class="session-info">
                  <h3 class="session-skill">{{ session.skill }}</h3>
                  <div class="session-meta">
                    <span class="duration-badge">⏱️ {{ formatDuration(session.duration) }}</span>
                  </div>
                  @if (session.notes) {
                    <p class="session-notes">{{ session.notes }}</p>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .history-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem;
    }

    .history-header {
      margin-bottom: 1.5rem;
    }

    .history-header h2 {
      font-size: 1.8rem;
      color: #2d3748;
      margin: 0 0 0.25rem 0;
    }

    .subtitle {
      color: #718096;
      margin: 0;
    }

    /* Filtre */
    .filter-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding: 1rem 1.25rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .filter-bar label {
      font-weight: 600;
      color: #4a5568;
      white-space: nowrap;
    }

    .filter-bar select {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.95rem;
      color: #2d3748;
      background: #f7fafc;
      cursor: pointer;
    }

    .filter-bar select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
    }

    /* Statistiques */
    .stats-bar {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .stat {
      flex: 1;
      background: white;
      padding: 1rem 1.25rem;
      border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 1.5rem;
      font-weight: 700;
      color: #667eea;
    }

    .stat-label {
      color: #718096;
      font-size: 0.85rem;
    }

    /* Loading */
    .loading {
      text-align: center;
      padding: 3rem;
      color: #718096;
    }

    /* État vide */
    .empty-state {
      text-align: center;
      padding: 3rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .empty-icon {
      font-size: 3rem;
    }

    .empty-state p {
      color: #4a5568;
      font-size: 1.1rem;
      margin: 0.5rem 0;
    }

    .empty-hint {
      color: #a0aec0 !important;
      font-size: 0.9rem !important;
    }

    /* Liste des sessions */
    .sessions-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .session-card {
      background: white;
      border-radius: 10px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      transition: box-shadow 0.2s;
    }

    .session-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .session-main {
      display: flex;
      gap: 1.25rem;
      align-items: flex-start;
    }

    .session-date {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 60px;
      padding: 0.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      color: white;
    }

    .date-day {
      font-size: 1.4rem;
      font-weight: 700;
      line-height: 1;
    }

    .date-month {
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 600;
    }

    .date-year {
      font-size: 0.7rem;
      opacity: 0.8;
    }

    .session-info {
      flex: 1;
    }

    .session-skill {
      margin: 0 0 0.35rem 0;
      font-size: 1.1rem;
      color: #2d3748;
    }

    .session-meta {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .duration-badge {
      background: #edf2f7;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.85rem;
      color: #4a5568;
      font-weight: 500;
    }

    .session-notes {
      margin: 0;
      color: #718096;
      font-size: 0.9rem;
      line-height: 1.5;
      white-space: pre-line;
    }

    @media (max-width: 600px) {
      .history-container {
        padding: 1rem;
      }

      .stats-bar {
        flex-direction: column;
        gap: 0.75rem;
      }

      .filter-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .session-main {
        flex-direction: column;
        gap: 0.75rem;
      }

      .session-date {
        flex-direction: row;
        gap: 0.5rem;
        min-width: unset;
      }
    }
  `]
})
export class SessionHistoryComponent implements OnInit {
  private sessionService = inject(LearningSessionService);

  loading = this.sessionService.loading;

  selectedSkill = signal('');

  private allSessions = signal<LearningSession[]>([]);

  // Extraire les noms de compétences uniques à partir des sessions
  skillNames = computed(() => {
    const names = this.allSessions().map(s => s.skill);
    return [...new Set(names)].sort();
  });

  filteredSessions = computed(() => {
    const sessions = this.allSessions();
    const skill = this.selectedSkill();

    const filtered = skill
      ? sessions.filter(s => s.skill === skill)
      : sessions;

    // Tri chronologique inversé (plus récent en premier)
    return [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  totalHours = computed(() => {
    const total = this.filteredSessions().reduce((sum, s) => sum + s.duration, 0);
    return (total / 60).toFixed(1);
  });

  avgDuration = computed(() => {
    const sessions = this.filteredSessions();
    if (sessions.length === 0) return 0;
    return Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length);
  });

  ngOnInit(): void {
    this.sessionService.loadSessions().subscribe(sessions => {
      this.allSessions.set(sessions);
    });
  }

  formatDay(dateStr: string): string {
    return new Date(dateStr).getDate().toString().padStart(2, '0');
  }

  formatMonth(dateStr: string): string {
    const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];
    return months[new Date(dateStr).getMonth()];
  }

  formatYear(dateStr: string): string {
    return new Date(dateStr).getFullYear().toString();
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }
}
