import { Component, OnInit, signal, inject, computed, DestroyRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { SkillService } from "../../../core/services/skill.service";
import { Skill, SkillCategory, SkillLevel } from "../../../core/models/skill.model";
import { HeaderComponent } from "../../../shared/components/header/header.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { PdfExportService } from "../../../core/services/pdf-export.service";
import { AuthService } from "../../../core/services/auth.service";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, HeaderComponent],
    template: `
    <app-header></app-header>
    
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h2>Mes Compétences</h2>
        <div class="header-actions">
          <div class="view-toggle">
            <button 
              class="toggle-btn" 
              [class.active]="viewMode() === 'grid'" 
              (click)="setViewMode('grid')"
              title="Vue grille"
            >
              <span class="toggle-icon">▦</span>
            </button>
            <button 
              class="toggle-btn" 
              [class.active]="viewMode() === 'list'" 
              (click)="setViewMode('list')"
              title="Vue liste"
            >
              <span class="toggle-icon">☰</span>
            </button>
          </div>
          <button class="export-btn" (click)="exportToPDF()" [disabled]="exportingPdf() || skillService.skills().length === 0" title="Exporter en PDF">
            {{ exportingPdf() ? '⏳ Export...' : '📄 Exporter PDF' }}
          </button>
          <button class="add-btn" (click)="toggleAddForm()">
            {{ showAddForm() ? 'Annuler' : '+ Ajouter une compétence' }}
          </button>
        </div>
      </div>
      
      @if (successMessage()) {
        <div class="success-message">
          <span class="success-icon">✓</span>
          {{ successMessage() }}
        </div>
      }
      
      <form class="filters" [formGroup]="filterForm">
        <div class="filter-group">
          <label for="search">Rechercher</label>
          <input
            id="search"
            type="text"
            placeholder="Nom de compétence..."
            formControlName="search"
          />
        </div>
        <div class="filter-group">
          <label for="filterCategory">Catégorie</label>
          <select id="filterCategory" formControlName="category">
            <option value="">Toutes</option>
            @for (cat of categories; track cat.value) {
              <option [value]="cat.value">{{ cat.label }}</option>
            }
          </select>
        </div>
        <div class="filter-group">
          <label for="filterLevel">Niveau</label>
          <select id="filterLevel" formControlName="level">
            <option value="">Tous</option>
            @for (level of levels; track level.value) {
              <option [value]="level.value">{{ level.label }}</option>
            }
          </select>
        </div>
        <button
          type="button"
          class="reset-filters"
          (click)="clearFilters()"
          [disabled]="!hasActiveFilters()"
        >
          Réinitialiser
        </button>
      </form>

      @if (hasActiveFilters()) {
        <div class="filter-summary">
          {{ filteredSkills().length }} résultat(s) sur {{ skillService.skills().length }}
        </div>
      }

      @if (showAddForm()) {
        <div class="add-skill-form">
          <h3>Nouvelle Compétence</h3>
          <form [formGroup]="skillForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label for="name">Nom *</label>
                <input 
                  id="name" 
                  type="text" 
                  formControlName="name"
                  placeholder="Ex: Angular"
                  [class.error]="isFieldInvalid('name')"
                />
                @if (isFieldInvalid('name')) {
                  <span class="error-message">Le nom est obligatoire</span>
                }
              </div>
              
              <div class="form-group">
                <label for="category">Catégorie *</label>
                <select id="category" formControlName="category" [class.error]="isFieldInvalid('category')">
                  <option value="">Sélectionner...</option>
                  @for (cat of categories; track cat.value) {
                    <option [value]="cat.value">{{ cat.label }}</option>
                  }
                </select>
                @if (isFieldInvalid('category')) {
                  <span class="error-message">La catégorie est obligatoire</span>
                }
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="currentLevel">Niveau actuel *</label>
                <select id="currentLevel" formControlName="currentLevel" [class.error]="isFieldInvalid('currentLevel')">
                  <option value="">Sélectionner...</option>
                  @for (level of levels; track level.value) {
                    <option [value]="level.value">{{ level.label }}</option>
                  }
                </select>
                @if (isFieldInvalid('currentLevel')) {
                  <span class="error-message">Le niveau actuel est obligatoire</span>
                }
              </div>
              
              <div class="form-group">
                <label for="targetLevel">Niveau cible</label>
                <select id="targetLevel" formControlName="targetLevel">
                  <option value="">Aucun</option>
                  @for (level of levels; track level.value) {
                    <option [value]="level.value">{{ level.label }}</option>
                  }
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label for="description">Description</label>
              <textarea 
                id="description" 
                formControlName="description"
                rows="3"
                placeholder="Décrivez votre expérience avec cette compétence..."
              ></textarea>
            </div>
            
            <button type="submit" class="submit-btn" [disabled]="skillForm.invalid || submitting()">
              {{ submitting() ? 'Création...' : 'Créer la compétence' }}
            </button>
          </form>
        </div>
      }
      
      <div class="skills-container" [class.list-view]="viewMode() === 'list'">
        @if (skillService.loading()) {
          <div class="loading">Chargement des compétences...</div>
        } @else if (skillService.skills().length === 0) {
          <div class="empty-state">
            <p>Aucune compétence pour le moment.</p>
            <p>Commencez par en ajouter une !</p>
          </div>
        } @else if (filteredSkills().length === 0) {
          <div class="empty-state">
            <p>Aucune compétence ne correspond aux filtres.</p>
            <p>Essayez d'élargir votre recherche.</p>
          </div>
        } @else {
          @for (skill of filteredSkills(); track skill.id) {
            <div class="skill-card" [class.editing]="editingSkillId() === skill.id">
              
              @if (editingSkillId() === skill.id) {
                <!-- Mode édition -->
                <form [formGroup]="editForm" (ngSubmit)="onSubmitEdit()" class="edit-form">
                  <h3 class="edit-title">Modifier la compétence</h3>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Nom *</label>
                      <input type="text" formControlName="name" [class.error]="isEditFieldInvalid('name')" />
                    </div>
                    <div class="form-group">
                      <label>Catégorie *</label>
                      <select formControlName="category" [class.error]="isEditFieldInvalid('category')">
                        @for (cat of categories; track cat.value) {
                          <option [value]="cat.value">{{ cat.label }}</option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-group">
                      <label>Niveau actuel *</label>
                      <select formControlName="currentLevel" [class.error]="isEditFieldInvalid('currentLevel')">
                        @for (level of levels; track level.value) {
                          <option [value]="level.value">{{ level.label }}</option>
                        }
                      </select>
                    </div>
                    <div class="form-group">
                      <label>Niveau cible</label>
                      <select formControlName="targetLevel">
                        <option value="">Aucun</option>
                        @for (level of levels; track level.value) {
                          <option [value]="level.value">{{ level.label }}</option>
                        }
                      </select>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Description</label>
                    <textarea formControlName="description" rows="2"></textarea>
                  </div>
                  <div class="edit-actions">
                    <button type="submit" class="save-btn" [disabled]="editForm.invalid || submitting()">
                      {{ submitting() ? 'Sauvegarde...' : '✓ Sauvegarder' }}
                    </button>
                    <button type="button" class="cancel-btn" (click)="cancelEdit()">
                      ✕ Annuler
                    </button>
                  </div>
                </form>
              } @else {
                <!-- Mode affichage -->
                <div class="skill-header">
                  <h3>{{ skill.name }}</h3>
                  <span class="category-badge" [attr.data-category]="skill.category">
                    {{ getCategoryLabel(skill.category) }}
                  </span>
                </div>
                
                @if (skill.description) {
                  <p class="description">{{ skill.description }}</p>
                }
                
                <div class="skill-levels">
                  <div class="level-info">
                    <span class="label">Niveau actuel:</span>
                    <span class="level-badge" [attr.data-level]="skill.currentLevel">
                      {{ getLevelLabel(skill.currentLevel) }}
                    </span>
                  </div>
                  
                  @if (skill.targetLevel) {
                    <div class="level-info">
                      <span class="label">Objectif:</span>
                      <span class="level-badge target" [attr.data-level]="skill.targetLevel">
                        {{ getLevelLabel(skill.targetLevel) }}
                      </span>
                    </div>
                  }
                </div>
                
                <div class="skill-stats">
                  <div class="stat">
                    <span class="stat-value">{{ skill.totalLearningSessions }}</span>
                    <span class="stat-label">Sessions</span>
                  </div>
                  <div class="stat">
                    <span class="stat-value">{{ skill.totalLearningHours }}h</span>
                    <span class="stat-label">Total</span>
                  </div>
                </div>
                
                <div class="skill-actions">
                  <button class="edit-btn" (click)="startEdit(skill)">
                    ✏️ Modifier
                  </button>
                  <button class="delete-btn" (click)="deleteSkill(skill.id)">
                    🗑️ Supprimer
                  </button>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
    styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    
    .dashboard-header h2 {
      font-size: 2rem;
      color: #2d3748;
      margin: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .view-toggle {
      display: flex;
      background: #edf2f7;
      border-radius: 6px;
      overflow: hidden;
    }

    .toggle-btn {
      padding: 0.5rem 0.75rem;
      border: none;
      background: transparent;
      cursor: pointer;
      color: #718096;
      font-size: 1.1rem;
      transition: all 0.2s;
    }

    .toggle-btn.active {
      background: #667eea;
      color: white;
    }

    .toggle-btn:hover:not(.active) {
      background: #e2e8f0;
    }

    .toggle-icon {
      font-size: 1rem;
    }
    
    .export-btn {
      padding: 0.75rem 1.5rem;
      background: #48bb78;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .export-btn:hover:not(:disabled) {
      background: #38a169;
    }

    .export-btn:disabled {
      background: #cbd5e0;
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    .add-btn {
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
    }
    
    .add-btn:hover {
      background: #5a67d8;
    }

    .filters {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr auto;
      gap: 1rem;
      align-items: end;
      background: #f7fafc;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .filter-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #4a5568;
      font-weight: 500;
    }

    .filter-group input,
    .filter-group select {
      width: 100%;
      padding: 0.65rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      font-size: 0.95rem;
      box-sizing: border-box;
    }

    .filter-group input:focus,
    .filter-group select:focus {
      outline: none;
      border-color: #667eea;
    }

    .reset-filters {
      padding: 0.65rem 1rem;
      background: #edf2f7;
      color: #4a5568;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      height: 42px;
    }

    .reset-filters:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .reset-filters:hover:not(:disabled) {
      background: #e2e8f0;
    }

    .filter-summary {
      color: #718096;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }
    
    .add-skill-form {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }
    
    .add-skill-form h3 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      color: #2d3748;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #4a5568;
      font-weight: 500;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .form-group input.error,
    .form-group select.error {
      border-color: #f56565;
    }
    
    .error-message {
      display: block;
      color: #f56565;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    
    .submit-btn {
      width: 100%;
      padding: 0.75rem;
      background: #48bb78;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
    }
    
    .submit-btn:hover:not(:disabled) {
      background: #38a169;
    }
    
    .submit-btn:disabled {
      background: #cbd5e0;
      cursor: not-allowed;
    }

    /* Grid view (default) */
    .skills-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.5rem;
    }

    /* List view */
    .skills-container.list-view {
      grid-template-columns: 1fr;
    }

    .skills-container.list-view .skill-card {
      display: grid;
      grid-template-columns: 1fr auto auto auto;
      grid-template-rows: auto;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
    }

    .skills-container.list-view .skill-header {
      margin-bottom: 0;
    }

    .skills-container.list-view .skill-levels {
      margin-bottom: 0;
    }

    .skills-container.list-view .skill-stats {
      border-top: none;
      border-bottom: none;
      margin-bottom: 0;
      padding: 0;
    }

    .skills-container.list-view .skill-actions {
      flex-direction: row;
    }

    .skills-container.list-view .description {
      display: none;
    }
    
    .skill-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .skill-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .skill-card.editing {
      border: 2px solid #667eea;
    }

    .skill-card.editing:hover {
      transform: none;
    }
    
    .skill-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
    }
    
    .skill-header h3 {
      margin: 0;
      color: #2d3748;
      font-size: 1.25rem;
    }
    
    .category-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }
    
    .category-badge[data-category="PROGRAMMING"] {
      background: #bee3f8;
      color: #2c5282;
    }
    
    .category-badge[data-category="FRAMEWORK"] {
      background: #c6f6d5;
      color: #22543d;
    }
    
    .category-badge[data-category="DATABASE"] {
      background: #fed7d7;
      color: #742a2a;
    }
    
    .category-badge[data-category="DEVOPS"] {
      background: #feebc8;
      color: #7c2d12;
    }

    .category-badge[data-category="ARCHITECTURE"] {
      background: #e9d8fd;
      color: #44337a;
    }

    .category-badge[data-category="SOFT_SKILLS"] {
      background: #fefcbf;
      color: #744210;
    }

    .category-badge[data-category="TOOLS"] {
      background: #b2f5ea;
      color: #234e52;
    }

    .category-badge[data-category="LANGUAGE"] {
      background: #fed7e2;
      color: #702459;
    }

    .category-badge[data-category="OTHER"] {
      background: #e2e8f0;
      color: #4a5568;
    }
    
    .description {
      color: #718096;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }
    
    .skill-levels {
      margin-bottom: 1rem;
    }
    
    .level-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .level-info .label {
      color: #718096;
      font-size: 0.875rem;
    }
    
    .level-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .level-badge[data-level="BEGINNER"] {
      background: #e6fffa;
      color: #234e52;
    }
    
    .level-badge[data-level="ELEMENTARY"] {
      background: #c6f6d5;
      color: #22543d;
    }
    
    .level-badge[data-level="INTERMEDIATE"] {
      background: #feebc8;
      color: #7c2d12;
    }
    
    .level-badge[data-level="ADVANCED"] {
      background: #fed7d7;
      color: #742a2a;
    }
    
    .level-badge[data-level="EXPERT"] {
      background: #e9d8fd;
      color: #44337a;
    }
    
    .skill-stats {
      display: flex;
      gap: 1.5rem;
      padding: 1rem 0;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 1rem;
    }
    
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #667eea;
    }
    
    .stat-label {
      font-size: 0.75rem;
      color: #718096;
      text-transform: uppercase;
    }
    
    .skill-actions {
      display: flex;
      gap: 0.5rem;
    }

    .edit-btn {
      flex: 1;
      padding: 0.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background 0.2s;
    }

    .edit-btn:hover {
      background: #5a67d8;
    }
    
    .delete-btn {
      flex: 1;
      padding: 0.5rem;
      background: #f56565;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background 0.2s;
    }
    
    .delete-btn:hover {
      background: #e53e3e;
    }

    /* Edit form inline */
    .edit-form {
      width: 100%;
    }

    .edit-title {
      margin: 0 0 1rem 0;
      color: #667eea;
      font-size: 1.1rem;
    }

    .edit-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .save-btn {
      flex: 1;
      padding: 0.6rem;
      background: #48bb78;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .save-btn:hover:not(:disabled) {
      background: #38a169;
    }

    .save-btn:disabled {
      background: #cbd5e0;
      cursor: not-allowed;
    }

    .cancel-btn {
      flex: 1;
      padding: 0.6rem;
      background: #a0aec0;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .cancel-btn:hover {
      background: #718096;
    }
    
    .loading, .empty-state {
      text-align: center;
      padding: 3rem;
      color: #718096;
      grid-column: 1 / -1;
    }
    
    .empty-state p {
      margin: 0.5rem 0;
    }
    
    .success-message {
      background: #c6f6d5;
      color: #22543d;
      padding: 1rem 1.5rem;
      border-radius: 4px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 500;
      animation: slideDown 0.3s ease-out;
    }
    
    .success-icon {
      background: #48bb78;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: stretch;
      }

      .dashboard-header h2 {
        font-size: 1.5rem;
      }

      .header-actions {
        justify-content: space-between;
      }

      .add-btn {
        padding: 0.6rem 1rem;
        font-size: 0.875rem;
      }

      .skills-container {
        grid-template-columns: 1fr;
      }

      .skills-container.list-view .skill-card {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .filters {
        grid-template-columns: 1fr;
        align-items: stretch;
      }

      .reset-filters {
        width: 100%;
      }

      .add-skill-form {
        padding: 1.5rem;
      }

      .skill-card {
        padding: 1rem;
      }

      .skill-header h3 {
        font-size: 1.1rem;
      }

      .stat-value {
        font-size: 1.25rem;
      }
    }

    @media (max-width: 480px) {
      .dashboard-container {
        padding: 0.75rem;
      }

      .skill-actions {
        flex-direction: column;
      }

      .header-actions {
        flex-direction: column;
        gap: 0.5rem;
      }

      .add-btn {
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
    skillService = inject(SkillService);
    private fb = inject(FormBuilder);
    private destroyRef = inject(DestroyRef);
    private pdfExportService = inject(PdfExportService);
    private authService = inject(AuthService);

    skillForm: FormGroup;
    editForm: FormGroup;
    filterForm: FormGroup;
    showAddForm = signal(false);
    submitting = signal(false);
    successMessage = signal<string>('');
    viewMode = signal<'grid' | 'list'>('grid');
    editingSkillId = signal<string | null>(null);
    exportingPdf = signal(false);
    private filterState = signal({ search: '', category: '', level: '' });
    filteredSkills = computed(() => {
      const skills = this.skillService.skills();
      const { search, category, level } = this.filterState();
      const normalizedSearch = search.toLowerCase();

      return skills.filter(skill => {
        if (category && skill.category !== category) {
          return false;
        }
        if (level && skill.currentLevel !== level) {
          return false;
        }
        if (normalizedSearch && !skill.name.toLowerCase().includes(normalizedSearch)) {
          return false;
        }
        return true;
      });
    });
    hasActiveFilters = computed(() => {
      const { search, category, level } = this.filterState();
      return !!(search || category || level);
    });

    categories = [
        { value: SkillCategory.PROGRAMMING, label: 'Programmation' },
        { value: SkillCategory.FRAMEWORK, label: 'Framework' },
        { value: SkillCategory.DATABASE, label: 'Base de données' },
        { value: SkillCategory.DEVOPS, label: 'DevOps' },
        { value: SkillCategory.ARCHITECTURE, label: 'Architecture' },
        { value: SkillCategory.SOFT_SKILLS, label: 'Soft Skills' },
        { value: SkillCategory.TOOLS, label: 'Outils' },
        { value: SkillCategory.LANGUAGE, label: 'Langage' },
        { value: SkillCategory.OTHER, label: 'Autre' },
    ];

    levels = [
        { value: SkillLevel.BEGINNER, label: 'Débutant' },
        { value: SkillLevel.ELEMENTARY, label: 'Élémentaire' },
        { value: SkillLevel.INTERMEDIATE, label: 'Intermédiaire' },
        { value: SkillLevel.ADVANCED, label: 'Avancé' },
        { value: SkillLevel.EXPERT, label: 'Expert' },
    ];

    constructor() {
        this.skillForm = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            category: ['', Validators.required],
            currentLevel: ['', Validators.required],
            targetLevel: [''],
        });

        this.editForm = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            category: ['', Validators.required],
            currentLevel: ['', Validators.required],
            targetLevel: [''],
        });

        this.filterForm = this.fb.group({
          search: [''],
          category: [''],
          level: [''],
        });

        this.filterState.set(this.normalizeFilterValue(this.filterForm.value));
        this.filterForm.valueChanges
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(value => {
            this.filterState.set(this.normalizeFilterValue(value));
          });
    }

    ngOnInit() {
        this.skillService.loadSkills().subscribe();
    }

    setViewMode(mode: 'grid' | 'list') {
        this.viewMode.set(mode);
    }

    toggleAddForm() {
        this.showAddForm.update(v => !v);
        if (!this.showAddForm()) {
            this.skillForm.reset();
        }
        this.successMessage.set('');
    }

    clearFilters() {
      this.filterForm.reset({ search: '', category: '', level: '' });
    }
    
    isFieldInvalid(fieldName: string): boolean {
        const field = this.skillForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    isEditFieldInvalid(fieldName: string): boolean {
        const field = this.editForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    onSubmit() {
        if (this.skillForm.valid) {
            this.submitting.set(true);
            const formValue = this.skillForm.value;
            
            // Convertir la chaîne vide en null pour targetLevel
            const request = {
                ...formValue,
                targetLevel: formValue.targetLevel || undefined
            };

            this.skillService.createSkill(request).subscribe({
                next: (skill) => {
                    this.skillForm.reset();
                    this.showAddForm.set(false);
                    this.submitting.set(false);
                    this.successMessage.set(`✨ La compétence "${skill.name}" a été créée avec succès !`);
                    
                    // Masquer le message après 5 secondes
                    setTimeout(() => {
                        this.successMessage.set('');
                    }, 5000);
                },
                error: () => {
                    this.submitting.set(false);
                    alert('Erreur lors de la création de la compétence');
                }
            });
        } else {
            // Marquer tous les champs comme touchés pour afficher les erreurs
            Object.keys(this.skillForm.controls).forEach(key => {
                this.skillForm.get(key)?.markAsTouched();
            });
        }
    }

    startEdit(skill: Skill) {
        this.editingSkillId.set(skill.id);
        this.editForm.patchValue({
            name: skill.name,
            description: skill.description || '',
            category: skill.category,
            currentLevel: skill.currentLevel,
            targetLevel: skill.targetLevel || '',
        });
    }

    cancelEdit() {
        this.editingSkillId.set(null);
        this.editForm.reset();
    }

    onSubmitEdit() {
        if (this.editForm.valid && this.editingSkillId()) {
            this.submitting.set(true);
            const formValue = this.editForm.value;
            const request = {
                ...formValue,
                targetLevel: formValue.targetLevel || undefined
            };

            this.skillService.updateSkill(this.editingSkillId()!, request).subscribe({
                next: (skill) => {
                    this.editingSkillId.set(null);
                    this.editForm.reset();
                    this.submitting.set(false);
                    this.successMessage.set(`✨ La compétence "${skill.name}" a été modifiée avec succès !`);

                    setTimeout(() => {
                        this.successMessage.set('');
                    }, 5000);
                },
                error: () => {
                    this.submitting.set(false);
                    alert('Erreur lors de la modification de la compétence');
                }
            });
        } else {
            Object.keys(this.editForm.controls).forEach(key => {
                this.editForm.get(key)?.markAsTouched();
            });
        }
    }

    deleteSkill(skillId: string) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette compétence ?')) {
            this.skillService.deleteSkill(skillId).subscribe({
                error: () => {
                    alert('Erreur lors de la suppression');
                }
            });
        }
    }

    getCategoryLabel(category: SkillCategory): string {
        return this.categories.find(c => c.value === category)?.label || category;
    }

    getLevelLabel(level: SkillLevel): string {
        return this.levels.find(l => l.value === level)?.label || level;
    }

    private normalizeFilterValue(value: { search?: string | null; category?: string | null; level?: string | null }) {
      return {
        search: (value.search ?? '').trim(),
        category: value.category ?? '',
        level: value.level ?? ''
      };
    }

    async exportToPDF() {
        let user = this.authService.currentUser();
        if (!user) {
            alert('Utilisateur non connecté');
            return;
        }

        // Si les informations sont incomplètes, utiliser des valeurs par défaut
        if (!user.firstName || !user.lastName) {
            user = {
                ...user,
                firstName: user.firstName || 'Utilisateur',
                lastName: user.lastName || 'Skills Tracker'
            };
        }

        const skills = this.skillService.skills();
        if (skills.length === 0) {
            alert('Aucune compétence à exporter');
            return;
        }

        this.exportingPdf.set(true);
        try {
            await this.pdfExportService.exportProfileToPDF(user, skills);
            this.successMessage.set('✨ Votre profil a été exporté en PDF avec succès !');
            setTimeout(() => {
                this.successMessage.set('');
            }, 5000);
        } catch (error) {
            console.error('Erreur lors de l\'export PDF:', error);
            alert('Erreur lors de l\'export du PDF');
        } finally {
            this.exportingPdf.set(false);
        }
    }
}
