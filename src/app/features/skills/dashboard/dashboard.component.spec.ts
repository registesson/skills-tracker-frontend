import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { SkillService } from '../../../core/services/skill.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { SkillCategory, SkillLevel, Skill } from '../../../core/models/skill.model';
import { signal } from '@angular/core';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let skillService: jasmine.SpyObj<SkillService>;

  const mockSkills: Skill[] = [
    {
      id: '1',
      name: 'Angular',
      description: 'Framework frontend',
      category: SkillCategory.FRAMEWORK,
      currentLevel: SkillLevel.INTERMEDIATE,
      targetLevel: SkillLevel.EXPERT,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      totalLearningSessions: 5,
      totalLearningHours: 20
    }
  ];

  beforeEach(async () => {
    const skillServiceSpy = jasmine.createSpyObj('SkillService', [
      'loadSkills',
      'createSkill',
      'deleteSkill'
    ], {
      skills: signal<Skill[]>([]),
      loading: signal(false)
    });

    skillServiceSpy.loadSkills.and.returnValue(of(mockSkills));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        { provide: SkillService, useValue: skillServiceSpy }
      ]
    })
    .compileComponents();

    skillService = TestBed.inject(SkillService) as jasmine.SpyObj<SkillService>;

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  describe('Initialisation du composant', () => {
    it('devrait créer le composant', () => {
      expect(component).toBeTruthy();
    });

    it('devrait initialiser le formulaire avec les bons contrôles', () => {
      expect(component.skillForm.get('name')).toBeTruthy();
      expect(component.skillForm.get('description')).toBeTruthy();
      expect(component.skillForm.get('category')).toBeTruthy();
      expect(component.skillForm.get('currentLevel')).toBeTruthy();
      expect(component.skillForm.get('targetLevel')).toBeTruthy();
    });

    it('devrait charger les compétences au démarrage', () => {
      fixture.detectChanges();
      expect(skillService.loadSkills).toHaveBeenCalled();
    });

    it('devrait avoir le formulaire masqué par défaut', () => {
      expect(component.showAddForm()).toBe(false);
    });
  });

  describe('Affichage du formulaire', () => {
    it('devrait afficher le formulaire quand on clique sur "Ajouter"', () => {
      component.toggleAddForm();
      expect(component.showAddForm()).toBe(true);
    });

    it('devrait masquer le formulaire quand on clique sur "Annuler"', () => {
      component.toggleAddForm();
      component.toggleAddForm();
      expect(component.showAddForm()).toBe(false);
    });

    it('devrait réinitialiser le formulaire lors de l\'annulation', () => {
      component.showAddForm.set(true);
      component.skillForm.patchValue({ name: 'Test' });
      component.toggleAddForm(); // Ferme le formulaire et réinitialise
      expect(component.skillForm.get('name')?.value).toBeNull();
    });

    it('devrait masquer le message de succès lors du toggle', () => {
      component.successMessage.set('Test message');
      component.toggleAddForm();
      expect(component.successMessage()).toBe('');
    });
  });

  describe('Validation du formulaire', () => {
    it('devrait être invalide si le nom est vide', () => {
      component.skillForm.patchValue({
        name: '',
        category: SkillCategory.PROGRAMMING,
        currentLevel: SkillLevel.BEGINNER
      });
      expect(component.skillForm.valid).toBe(false);
    });

    it('devrait être invalide si la catégorie est vide', () => {
      component.skillForm.patchValue({
        name: 'Angular',
        category: '',
        currentLevel: SkillLevel.BEGINNER
      });
      expect(component.skillForm.valid).toBe(false);
    });

    it('devrait être invalide si le niveau actuel est vide', () => {
      component.skillForm.patchValue({
        name: 'Angular',
        category: SkillCategory.FRAMEWORK,
        currentLevel: ''
      });
      expect(component.skillForm.valid).toBe(false);
    });

    it('devrait être valide avec les champs obligatoires remplis', () => {
      component.skillForm.patchValue({
        name: 'Angular',
        category: SkillCategory.FRAMEWORK,
        currentLevel: SkillLevel.INTERMEDIATE
      });
      expect(component.skillForm.valid).toBe(true);
    });

    it('devrait être valide même si description et targetLevel sont vides', () => {
      component.skillForm.patchValue({
        name: 'Angular',
        category: SkillCategory.FRAMEWORK,
        currentLevel: SkillLevel.INTERMEDIATE,
        description: '',
        targetLevel: ''
      });
      expect(component.skillForm.valid).toBe(true);
    });
  });

  describe('Validation temps réel', () => {
    it('devrait retourner false pour un champ non touché', () => {
      expect(component.isFieldInvalid('name')).toBe(false);
    });

    it('devrait retourner true pour un champ invalide et touché', () => {
      const nameControl = component.skillForm.get('name');
      nameControl?.markAsTouched();
      nameControl?.setValue('');
      expect(component.isFieldInvalid('name')).toBe(true);
    });

    it('devrait retourner false pour un champ valide et touché', () => {
      const nameControl = component.skillForm.get('name');
      nameControl?.markAsTouched();
      nameControl?.setValue('Angular');
      expect(component.isFieldInvalid('name')).toBe(false);
    });

    it('devrait retourner true pour un champ invalide et dirty', () => {
      const nameControl = component.skillForm.get('name');
      nameControl?.markAsDirty();
      nameControl?.setValue('');
      expect(component.isFieldInvalid('name')).toBe(true);
    });
  });

  describe('Soumission du formulaire', () => {
    it('devrait créer une compétence avec les bonnes données', () => {
      const newSkill = { ...mockSkills[0], id: '2', name: 'React' };
      skillService.createSkill.and.returnValue(of(newSkill));

      component.skillForm.patchValue({
        name: 'React',
        description: 'Framework frontend',
        category: SkillCategory.FRAMEWORK,
        currentLevel: SkillLevel.INTERMEDIATE,
        targetLevel: SkillLevel.EXPERT
      });

      component.onSubmit();

      expect(skillService.createSkill).toHaveBeenCalledWith({
        name: 'React',
        description: 'Framework frontend',
        category: SkillCategory.FRAMEWORK,
        currentLevel: SkillLevel.INTERMEDIATE,
        targetLevel: SkillLevel.EXPERT
      });
    });

    it('devrait convertir targetLevel vide en undefined', () => {
      const newSkill = mockSkills[0];
      skillService.createSkill.and.returnValue(of(newSkill));

      component.skillForm.patchValue({
        name: 'Angular',
        category: SkillCategory.FRAMEWORK,
        currentLevel: SkillLevel.INTERMEDIATE,
        targetLevel: ''
      });

      component.onSubmit();

      const callArgs = skillService.createSkill.calls.mostRecent().args[0];
      expect(callArgs.targetLevel).toBeUndefined();
    });

    it('devrait afficher un message de succès après création', () => {
      const newSkill = { ...mockSkills[0], name: 'React' };
      skillService.createSkill.and.returnValue(of(newSkill));

      component.skillForm.patchValue({
        name: 'React',
        category: SkillCategory.FRAMEWORK,
        currentLevel: SkillLevel.INTERMEDIATE
      });

      component.onSubmit();

      expect(component.successMessage()).toContain('React');
      expect(component.successMessage()).toContain('créée avec succès');
    });

    it('devrait réinitialiser et fermer le formulaire après création', () => {
      skillService.createSkill.and.returnValue(of(mockSkills[0]));
      component.showAddForm.set(true);

      component.skillForm.patchValue({
        name: 'Angular',
        category: SkillCategory.FRAMEWORK,
        currentLevel: SkillLevel.INTERMEDIATE
      });

      component.onSubmit();

      expect(component.showAddForm()).toBe(false);
      expect(component.skillForm.get('name')?.value).toBeNull();
    });

    it('devrait arrêter le chargement après création', () => {
      skillService.createSkill.and.returnValue(of(mockSkills[0]));
      component.submitting.set(true);

      component.skillForm.patchValue({
        name: 'Angular',
        category: SkillCategory.FRAMEWORK,
        currentLevel: SkillLevel.INTERMEDIATE
      });

      component.onSubmit();

      expect(component.submitting()).toBe(false);
    });

    it('ne devrait pas soumettre si le formulaire est invalide', () => {
      component.skillForm.patchValue({
        name: '',
        category: '',
        currentLevel: ''
      });

      component.onSubmit();

      expect(skillService.createSkill).not.toHaveBeenCalled();
    });

    it('devrait marquer tous les champs comme touchés si soumission invalide', () => {
      component.skillForm.patchValue({
        name: '',
        category: '',
        currentLevel: ''
      });

      component.onSubmit();

      expect(component.skillForm.get('name')?.touched).toBe(true);
      expect(component.skillForm.get('category')?.touched).toBe(true);
      expect(component.skillForm.get('currentLevel')?.touched).toBe(true);
    });

    it('devrait gérer les erreurs de création', () => {
      spyOn(window, 'alert');
      skillService.createSkill.and.returnValue(throwError(() => new Error('Erreur API')));

      component.skillForm.patchValue({
        name: 'Angular',
        category: SkillCategory.FRAMEWORK,
        currentLevel: SkillLevel.INTERMEDIATE
      });

      component.onSubmit();

      expect(component.submitting()).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('Erreur lors de la création de la compétence');
    });
  });

  describe('Suppression de compétence', () => {
    it('devrait supprimer une compétence après confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      skillService.deleteSkill.and.returnValue(of(void 0));

      component.deleteSkill('1');

      expect(window.confirm).toHaveBeenCalled();
      expect(skillService.deleteSkill).toHaveBeenCalledWith('1');
    });

    it('ne devrait pas supprimer sans confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteSkill('1');

      expect(skillService.deleteSkill).not.toHaveBeenCalled();
    });

    it('devrait gérer les erreurs de suppression', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');
      skillService.deleteSkill.and.returnValue(throwError(() => new Error('Erreur API')));

      component.deleteSkill('1');

      expect(window.alert).toHaveBeenCalledWith('Erreur lors de la suppression');
    });
  });

  describe('Helpers', () => {
    it('devrait retourner le label de la catégorie', () => {
      const label = component.getCategoryLabel(SkillCategory.PROGRAMMING);
      expect(label).toBe('Programmation');
    });

    it('devrait retourner la valeur brute si catégorie inconnue', () => {
      const unknownCategory = 'UNKNOWN' as SkillCategory;
      const label = component.getCategoryLabel(unknownCategory);
      expect(label).toBe('UNKNOWN');
    });

    it('devrait retourner le label du niveau', () => {
      const label = component.getLevelLabel(SkillLevel.INTERMEDIATE);
      expect(label).toBe('Intermédiaire');
    });

    it('devrait retourner la valeur brute si niveau inconnu', () => {
      const unknownLevel = 'UNKNOWN' as SkillLevel;
      const label = component.getLevelLabel(unknownLevel);
      expect(label).toBe('UNKNOWN');
    });
  });

  describe('Données des dropdowns', () => {
    it('devrait avoir toutes les catégories', () => {
      expect(component.categories.length).toBe(9);
      expect(component.categories.map(c => c.value)).toContain(SkillCategory.PROGRAMMING);
      expect(component.categories.map(c => c.value)).toContain(SkillCategory.FRAMEWORK);
    });

    it('devrait avoir tous les niveaux', () => {
      expect(component.levels.length).toBe(5);
      expect(component.levels.map(l => l.value)).toContain(SkillLevel.BEGINNER);
      expect(component.levels.map(l => l.value)).toContain(SkillLevel.EXPERT);
    });
  });
});
