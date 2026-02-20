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
    },
    {
      id: '2',
      name: 'TypeScript',
      description: 'Langage de programmation',
      category: SkillCategory.PROGRAMMING,
      currentLevel: SkillLevel.ADVANCED,
      targetLevel: SkillLevel.EXPERT,
      createdAt: '2026-01-02',
      updatedAt: '2026-01-02',
      totalLearningSessions: 10,
      totalLearningHours: 40
    }
  ];

  beforeEach(async () => {
    const skillServiceSpy = jasmine.createSpyObj('SkillService', [
      'loadSkills',
      'createSkill',
      'updateSkill',
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

    it('devrait initialiser le formulaire d\'édition avec les bons contrôles', () => {
      expect(component.editForm.get('name')).toBeTruthy();
      expect(component.editForm.get('description')).toBeTruthy();
      expect(component.editForm.get('category')).toBeTruthy();
      expect(component.editForm.get('currentLevel')).toBeTruthy();
      expect(component.editForm.get('targetLevel')).toBeTruthy();
    });

    it('devrait charger les compétences au démarrage', () => {
      fixture.detectChanges();
      expect(skillService.loadSkills).toHaveBeenCalled();
    });

    it('devrait avoir le formulaire masqué par défaut', () => {
      expect(component.showAddForm()).toBe(false);
    });

    it('devrait avoir la vue grille par défaut', () => {
      expect(component.viewMode()).toBe('grid');
    });

    it('devrait ne pas être en mode édition par défaut', () => {
      expect(component.editingSkillId()).toBeNull();
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

  describe('Toggle vue grille/liste', () => {
    it('devrait basculer en mode liste', () => {
      component.setViewMode('list');
      expect(component.viewMode()).toBe('list');
    });

    it('devrait basculer en mode grille', () => {
      component.setViewMode('list');
      component.setViewMode('grid');
      expect(component.viewMode()).toBe('grid');
    });
  });

  describe('Édition de compétence', () => {
    it('devrait activer le mode édition pour une compétence', () => {
      component.startEdit(mockSkills[0]);
      expect(component.editingSkillId()).toBe('1');
    });

    it('devrait pré-remplir le formulaire d\'édition avec les données de la compétence', () => {
      component.startEdit(mockSkills[0]);
      expect(component.editForm.get('name')?.value).toBe('Angular');
      expect(component.editForm.get('category')?.value).toBe(SkillCategory.FRAMEWORK);
      expect(component.editForm.get('currentLevel')?.value).toBe(SkillLevel.INTERMEDIATE);
      expect(component.editForm.get('targetLevel')?.value).toBe(SkillLevel.EXPERT);
      expect(component.editForm.get('description')?.value).toBe('Framework frontend');
    });

    it('devrait pré-remplir description vide si la compétence n\'a pas de description', () => {
      const skillSansDescription: Skill = {
        ...mockSkills[0],
        description: undefined
      };
      component.startEdit(skillSansDescription);
      expect(component.editForm.get('description')?.value).toBe('');
    });

    it('devrait pré-remplir targetLevel vide si la compétence n\'a pas de targetLevel', () => {
      const skillSansTarget: Skill = {
        ...mockSkills[0],
        targetLevel: undefined
      };
      component.startEdit(skillSansTarget);
      expect(component.editForm.get('targetLevel')?.value).toBe('');
    });

    it('devrait annuler l\'édition', () => {
      component.startEdit(mockSkills[0]);
      component.cancelEdit();
      expect(component.editingSkillId()).toBeNull();
    });

    it('devrait réinitialiser le formulaire d\'édition à l\'annulation', () => {
      component.startEdit(mockSkills[0]);
      component.cancelEdit();
      expect(component.editForm.get('name')?.value).toBeNull();
    });

    it('devrait soumettre la modification avec les bonnes données', () => {
      const updatedSkill = { ...mockSkills[0], name: 'Angular Updated' };
      skillService.updateSkill.and.returnValue(of(updatedSkill));

      component.startEdit(mockSkills[0]);
      component.editForm.patchValue({ name: 'Angular Updated' });

      component.onSubmitEdit();

      expect(skillService.updateSkill).toHaveBeenCalledWith('1', {
        name: 'Angular Updated',
        description: 'Framework frontend',
        category: SkillCategory.FRAMEWORK,
        currentLevel: SkillLevel.INTERMEDIATE,
        targetLevel: SkillLevel.EXPERT
      });
    });

    it('devrait convertir targetLevel vide en undefined lors de la modification', () => {
      const updatedSkill = mockSkills[0];
      skillService.updateSkill.and.returnValue(of(updatedSkill));

      component.startEdit(mockSkills[0]);
      component.editForm.patchValue({ targetLevel: '' });

      component.onSubmitEdit();

      const callArgs = skillService.updateSkill.calls.mostRecent().args[1];
      expect(callArgs.targetLevel).toBeUndefined();
    });

    it('devrait afficher un message de succès après modification', () => {
      const updatedSkill = { ...mockSkills[0], name: 'Angular Updated' };
      skillService.updateSkill.and.returnValue(of(updatedSkill));

      component.startEdit(mockSkills[0]);
      component.editForm.patchValue({ name: 'Angular Updated' });
      component.onSubmitEdit();

      expect(component.successMessage()).toContain('Angular Updated');
      expect(component.successMessage()).toContain('modifiée avec succès');
    });

    it('devrait quitter le mode édition après modification réussie', () => {
      skillService.updateSkill.and.returnValue(of(mockSkills[0]));

      component.startEdit(mockSkills[0]);
      component.onSubmitEdit();

      expect(component.editingSkillId()).toBeNull();
      expect(component.submitting()).toBe(false);
    });

    it('devrait gérer les erreurs de modification', () => {
      spyOn(window, 'alert');
      skillService.updateSkill.and.returnValue(throwError(() => new Error('Erreur API')));

      component.startEdit(mockSkills[0]);
      component.onSubmitEdit();

      expect(component.submitting()).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('Erreur lors de la modification de la compétence');
    });

    it('ne devrait pas soumettre la modification si le formulaire est invalide', () => {
      component.startEdit(mockSkills[0]);
      component.editForm.patchValue({ name: '', category: '', currentLevel: '' });

      component.onSubmitEdit();

      expect(skillService.updateSkill).not.toHaveBeenCalled();
    });

    it('devrait marquer les champs comme touchés si soumission édition invalide', () => {
      component.startEdit(mockSkills[0]);
      component.editForm.patchValue({ name: '', category: '', currentLevel: '' });

      component.onSubmitEdit();

      expect(component.editForm.get('name')?.touched).toBe(true);
      expect(component.editForm.get('category')?.touched).toBe(true);
      expect(component.editForm.get('currentLevel')?.touched).toBe(true);
    });

    it('devrait valider les champs d\'édition invalides', () => {
      component.startEdit(mockSkills[0]);
      const nameControl = component.editForm.get('name');
      nameControl?.markAsTouched();
      nameControl?.setValue('');
      expect(component.isEditFieldInvalid('name')).toBe(true);
    });

    it('devrait valider les champs d\'édition valides', () => {
      component.startEdit(mockSkills[0]);
      const nameControl = component.editForm.get('name');
      nameControl?.markAsTouched();
      expect(component.isEditFieldInvalid('name')).toBe(false);
    });
  });

  describe('Affichage des cards', () => {
    it('devrait afficher le nom de la compétence', () => {
      (skillService.skills as any).set(mockSkills);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const skillHeaders = compiled.querySelectorAll('.skill-header h3');
      expect(skillHeaders[0].textContent).toContain('Angular');
    });

    it('devrait afficher la catégorie', () => {
      (skillService.skills as any).set(mockSkills);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const badges = compiled.querySelectorAll('.category-badge');
      expect(badges[0].textContent).toContain('Framework');
    });

    it('devrait afficher le niveau actuel', () => {
      (skillService.skills as any).set(mockSkills);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const levelBadges = compiled.querySelectorAll('.level-badge:not(.target)');
      expect(levelBadges[0].textContent).toContain('Intermédiaire');
    });

    it('devrait afficher le temps total', () => {
      (skillService.skills as any).set(mockSkills);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const statValues = compiled.querySelectorAll('.stat-value');
      expect(statValues[1].textContent).toContain('20h');
    });

    it('devrait afficher les boutons modifier et supprimer', () => {
      (skillService.skills as any).set(mockSkills);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const editBtns = compiled.querySelectorAll('.edit-btn');
      const deleteBtns = compiled.querySelectorAll('.delete-btn');
      expect(editBtns.length).toBe(2);
      expect(deleteBtns.length).toBe(2);
    });

    it('devrait afficher le toggle grille/liste', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const toggleBtns = compiled.querySelectorAll('.toggle-btn');
      expect(toggleBtns.length).toBe(2);
    });

    it('devrait appliquer la classe list-view en mode liste', () => {
      component.setViewMode('list');
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const container = compiled.querySelector('.skills-container');
      expect(container?.classList.contains('list-view')).toBe(true);
    });

    it('devrait ne pas appliquer la classe list-view en mode grille', () => {
      component.setViewMode('grid');
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const container = compiled.querySelector('.skills-container');
      expect(container?.classList.contains('list-view')).toBe(false);
    });

    it('devrait afficher le formulaire d\'édition inline au clic sur modifier', () => {
      (skillService.skills as any).set(mockSkills);
      fixture.detectChanges();

      component.startEdit(mockSkills[0]);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const editForm = compiled.querySelector('.edit-form');
      expect(editForm).toBeTruthy();
    });

    it('devrait afficher l\'état vide quand il n\'y a pas de compétences', () => {
      (skillService.skills as any).set([]);
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      const emptyState = compiled.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState?.textContent).toContain('Aucune compétence');
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
