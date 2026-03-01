import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SkillService } from '../../../core/services/skill.service';
import { LearningSessionService } from '../../../core/services/learning-session.service';
import { Skill } from '../../../core/models/skill.model';

@Component({
  selector: 'app-session-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="session-container">
      <div class="session-header">
        <h2>⏱️ Enregistrer une session</h2>
        <p class="subtitle">Enregistrez rapidement votre temps d'apprentissage</p>
      </div>

      @if (successMessage()) {
        <div class="success-message">
          <span class="success-icon">✓</span>
          {{ successMessage() }}
        </div>
      }

      @if (errorMessage()) {
        <div class="error-message-banner">
          <span class="error-icon">✗</span>
          {{ errorMessage() }}
        </div>
      }

      <div class="form-card">
        <form [formGroup]="sessionForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="skillId">Compétence *</label>
            <select
              id="skillId"
              formControlName="skillId"
              [class.error]="isFieldInvalid('skillId')"
            >
              <option value="">Sélectionner une compétence...</option>
              @for (skill of skills(); track skill.id) {
                <option [value]="skill.id">{{ skill.name }} ({{ skill.category }})</option>
              }
            </select>
            @if (isFieldInvalid('skillId')) {
              <span class="error-text">Veuillez sélectionner une compétence</span>
            }
            @if (skills().length === 0 && !skillService.loading()) {
              <span class="hint-text">Aucune compétence trouvée. <a (click)="goToDashboard()">Créez-en une d'abord</a>.</span>
            }
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="sessionDate">Date *</label>
              <input
                id="sessionDate"
                type="date"
                formControlName="sessionDate"
                [class.error]="isFieldInvalid('sessionDate')"
              />
              @if (isFieldInvalid('sessionDate')) {
                <span class="error-text">La date est obligatoire</span>
              }
            </div>

            <div class="form-group">
              <label for="durationMinutes">Durée (minutes) *</label>
              <input
                id="durationMinutes"
                type="number"
                formControlName="durationMinutes"
                placeholder="Ex: 45"
                min="1"
                [class.error]="isFieldInvalid('durationMinutes')"
              />
              @if (isFieldInvalid('durationMinutes')) {
                <span class="error-text">Durée minimale : 1 minute</span>
              }
            </div>
          </div>

          <div class="form-group">
            <label for="notes">Notes <span class="optional">(optionnel)</span></label>
            <textarea
              id="notes"
              formControlName="notes"
              rows="4"
              placeholder="Qu'avez-vous appris ? Des ressources utilisées ?"
            ></textarea>
          </div>

          <div class="form-actions">
            <button
              type="button"
              class="cancel-btn"
              (click)="goToDashboard()"
            >
              Retour
            </button>
            <button
              type="submit"
              class="submit-btn"
              [disabled]="sessionForm.invalid || submitting()"
            >
              {{ submitting() ? 'Enregistrement...' : '✓ Enregistrer la session' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .session-container {
      max-width: 700px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }

    .session-header {
      margin-bottom: 1.5rem;
    }

    .session-header h2 {
      font-size: 1.8rem;
      color: #2d3748;
      margin: 0 0 0.25rem 0;
    }

    .subtitle {
      color: #718096;
      margin: 0;
      font-size: 1rem;
    }

    .form-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #4a5568;
      font-size: 0.95rem;
    }

    .optional {
      font-weight: 400;
      color: #a0aec0;
      font-size: 0.85rem;
    }

    input, select, textarea {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
      background: #f7fafc;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
      background: white;
    }

    input.error, select.error {
      border-color: #f56565;
    }

    .error-text {
      color: #f56565;
      font-size: 0.85rem;
      margin-top: 0.25rem;
      display: block;
    }

    .hint-text {
      color: #718096;
      font-size: 0.85rem;
      margin-top: 0.25rem;
      display: block;
    }

    .hint-text a {
      color: #667eea;
      cursor: pointer;
      text-decoration: underline;
    }

    textarea {
      resize: vertical;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .submit-btn {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: opacity 0.2s, transform 0.1s;
    }

    .submit-btn:hover:not(:disabled) {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .cancel-btn {
      padding: 0.75rem 1.5rem;
      background: #edf2f7;
      color: #4a5568;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: background 0.2s;
    }

    .cancel-btn:hover {
      background: #e2e8f0;
    }

    .success-message {
      background: #f0fff4;
      border: 1px solid #c6f6d5;
      color: #276749;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }

    .success-icon {
      font-size: 1.2rem;
    }

    .error-message-banner {
      background: #fff5f5;
      border: 1px solid #fed7d7;
      color: #c53030;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }

    .error-icon {
      font-size: 1.2rem;
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }

      .session-container {
        padding: 0 1rem;
      }

      .form-card {
        padding: 1.25rem;
      }
    }
  `]
})
export class SessionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  skillService = inject(SkillService);
  private sessionService = inject(LearningSessionService);

  skills = this.skillService.skills;
  submitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  sessionForm: FormGroup = this.fb.group({
    skillId: ['', Validators.required],
    sessionDate: [this.todayISO(), Validators.required],
    durationMinutes: [null, [Validators.required, Validators.min(1)]],
    notes: ['']
  });

  ngOnInit(): void {
    if (this.skills().length === 0) {
      this.skillService.loadSkills().subscribe();
    }
  }

  onSubmit(): void {
    if (this.sessionForm.invalid) return;

    this.submitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formValue = this.sessionForm.value;

    this.sessionService.createSession({
      skillId: formValue.skillId,
      sessionDate: formValue.sessionDate + 'T00:00:00',
      durationMinutes: formValue.durationMinutes,
      notes: formValue.notes || undefined
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set('Session enregistrée avec succès !');
        this.sessionForm.reset({
          skillId: '',
          sessionDate: this.todayISO(),
          durationMinutes: null,
          notes: ''
        });
        setTimeout(() => this.successMessage.set(''), 4000);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set('Erreur lors de l\'enregistrement. Veuillez réessayer.');
        console.error('Session creation error:', err);
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.sessionForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  private todayISO(): string {
    return new Date().toISOString().split('T')[0];
  }
}
