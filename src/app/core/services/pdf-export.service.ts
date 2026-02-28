import { Injectable, inject } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Skill, SkillCategory, SkillLevel } from '../models/skill.model';
import { User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {
  
  private readonly categoryColors: Record<SkillCategory, string> = {
    [SkillCategory.PROGRAMMING]: '#3b82f6',
    [SkillCategory.FRAMEWORK]: '#8b5cf6',
    [SkillCategory.DATABASE]: '#10b981',
    [SkillCategory.DEVOPS]: '#f59e0b',
    [SkillCategory.ARCHITECTURE]: '#ef4444',
    [SkillCategory.SOFT_SKILLS]: '#ec4899',
    [SkillCategory.TOOLS]: '#06b6d4',
    [SkillCategory.LANGUAGE]: '#6366f1',
    [SkillCategory.OTHER]: '#6b7280'
  };

  private readonly levelColors: Record<SkillLevel, string> = {
    [SkillLevel.BEGINNER]: '#fbbf24',
    [SkillLevel.ELEMENTARY]: '#fb923c',
    [SkillLevel.INTERMEDIATE]: '#60a5fa',
    [SkillLevel.ADVANCED]: '#34d399',
    [SkillLevel.EXPERT]: '#a78bfa'
  };

  async exportProfileToPDF(user: User, skills: Skill[]): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    let yPosition = 20;

    // Header avec logo et nom de l'utilisateur
    this.addHeader(pdf, user, pageWidth, yPosition);
    yPosition += 35;

    // Date de génération
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 15, yPosition, { align: 'right' });
    yPosition += 10;

    // Résumé des compétences
    yPosition = this.addSummary(pdf, skills, pageWidth, yPosition);

    // Graphique par catégorie
    yPosition = await this.addCategoryChart(pdf, skills, pageWidth, yPosition, pageHeight);

    // Graphique par niveau
    yPosition = await this.addLevelChart(pdf, skills, pageWidth, yPosition, pageHeight);

    // Liste détaillée des compétences
    yPosition = this.addSkillsTable(pdf, skills, pageWidth, yPosition, pageHeight);

    // Footer
    this.addFooter(pdf, pageWidth, pageHeight);

    // Télécharger le PDF
    const sanitizeFilename = (str: string): string => {
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
        .replace(/[^a-zA-Z0-9]/g, '_') // Remplacer les caractères spéciaux par _
        .toLowerCase();
    };
    
    const firstName = sanitizeFilename(user.firstName || 'user');
    const lastName = sanitizeFilename(user.lastName || 'profile');
    const filename = `profil_${firstName}_${lastName}_${new Date().getTime()}.pdf`;
    
    pdf.save(filename);
  }

  private addHeader(pdf: jsPDF, user: User, pageWidth: number, yPosition: number): void {
    // Logo (cercle avec initiales)
    const firstName = user.firstName || 'U';
    const lastName = user.lastName || 'U';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    pdf.setFillColor(59, 130, 246);
    pdf.circle(25, yPosition + 5, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.text(initials, 25, yPosition + 7, { align: 'center' });

    // Nom et titre
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(24);
    pdf.setFont("helvetica", 'bold');
    pdf.text(`${firstName} ${lastName}`, 40, yPosition + 5);
    
    pdf.setFontSize(14);
    pdf.setFont("helvetica", 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Portfolio de Compétences', 40, yPosition + 12);
    
    pdf.setTextColor(59, 130, 246);
    pdf.text(user.email, 40, yPosition + 18);

    // Ligne de séparation
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(15, yPosition + 25, pageWidth - 15, yPosition + 25);
  }

  private addSummary(pdf: jsPDF, skills: Skill[], pageWidth: number, yPosition: number): number {
    pdf.setFontSize(16);
    pdf.setFont("helvetica", 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Résumé', 15, yPosition);
    yPosition += 8;

    const totalHours = skills.reduce((sum, skill) => sum + skill.totalLearningHours, 0);
    const totalSessions = skills.reduce((sum, skill) => sum + skill.totalLearningSessions, 0);

    // Cartes de statistiques
    const cardWidth = (pageWidth - 40) / 3;
    const cardHeight = 25;
    const startX = 15;

    // Carte 1: Nombre de compétences
    this.drawStatCard(pdf, startX, yPosition, cardWidth, cardHeight, skills.length.toString(), 'Compétences', '#3b82f6');
    
    // Carte 2: Heures totales
    this.drawStatCard(pdf, startX + cardWidth + 5, yPosition, cardWidth, cardHeight, `${totalHours}h`, 'Heures d\'apprentissage', '#10b981');
    
    // Carte 3: Sessions totales
    this.drawStatCard(pdf, startX + (cardWidth + 5) * 2, yPosition, cardWidth, cardHeight, totalSessions.toString(), 'Sessions', '#8b5cf6');

    return yPosition + cardHeight + 10;
  }

  private drawStatCard(pdf: jsPDF, x: number, y: number, width: number, height: number, value: string, label: string, color: string): void {
    // Convertir hex en RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Fond de la carte
    pdf.setFillColor(r, g, b, 0.1);
    pdf.roundedRect(x, y, width, height, 2, 2, 'F');

    // Bordure
    pdf.setDrawColor(r, g, b);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(x, y, width, height, 2, 2, 'S');

    // Valeur
    pdf.setFontSize(18);
    pdf.setFont("helvetica", 'bold');
    pdf.setTextColor(r, g, b);
    pdf.text(value, x + width / 2, y + height / 2 - 2, { align: 'center' });

    // Label
    pdf.setFontSize(9);
    pdf.setFont("helvetica", 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text(label, x + width / 2, y + height / 2 + 4, { align: 'center' });
  }

  private async addCategoryChart(pdf: jsPDF, skills: Skill[], pageWidth: number, yPosition: number, pageHeight: number): Promise<number> {
    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont("helvetica", 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Répartition par catégorie', 15, yPosition);
    yPosition += 8;

    // Compter les compétences par catégorie
    const categoryCounts = skills.reduce((acc, skill) => {
      acc[skill.category] = (acc[skill.category] || 0) + 1;
      return acc;
    }, {} as Record<SkillCategory, number>);

    // Dessiner le graphique à barres
    const chartX = 15;
    const chartWidth = pageWidth - 30;
    const barHeight = 8;
    const maxCount = Math.max(...Object.values(categoryCounts));

    Object.entries(categoryCounts).forEach(([category, count], index) => {
      const barY = yPosition + (index * (barHeight + 3));
      const barWidth = (count / maxCount) * (chartWidth - 80);

      // Couleur de la barre
      const color = this.categoryColors[category as SkillCategory];
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      // Label de la catégorie
      pdf.setFontSize(9);
      pdf.setTextColor(60, 60, 60);
      pdf.text(this.getCategoryLabel(category as SkillCategory), chartX, barY + 5);

      // Barre
      pdf.setFillColor(r, g, b);
      pdf.roundedRect(chartX + 70, barY, barWidth, barHeight, 1, 1, 'F');

      // Nombre
      pdf.setFontSize(10);
      pdf.setFont("helvetica", 'bold');
      pdf.setTextColor(r, g, b);
      pdf.text(count.toString(), chartX + 70 + barWidth + 3, barY + 5);
    });

    return yPosition + (Object.keys(categoryCounts).length * (barHeight + 3)) + 5;
  }

  private async addLevelChart(pdf: jsPDF, skills: Skill[], pageWidth: number, yPosition: number, pageHeight: number): Promise<number> {
    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont("helvetica", 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Répartition par niveau', 15, yPosition);
    yPosition += 8;

    // Compter les compétences par niveau
    const levelCounts = skills.reduce((acc, skill) => {
      acc[skill.currentLevel] = (acc[skill.currentLevel] || 0) + 1;
      return acc;
    }, {} as Record<SkillLevel, number>);

    // Dessiner le graphique à barres
    const chartX = 15;
    const chartWidth = pageWidth - 30;
    const barHeight = 8;
    const maxCount = Math.max(...Object.values(levelCounts));

    const orderedLevels = [
      SkillLevel.BEGINNER,
      SkillLevel.ELEMENTARY,
      SkillLevel.INTERMEDIATE,
      SkillLevel.ADVANCED,
      SkillLevel.EXPERT
    ];

    orderedLevels.forEach((level, index) => {
      const count = levelCounts[level] || 0;
      const barY = yPosition + (index * (barHeight + 3));
      const barWidth = count > 0 ? (count / maxCount) * (chartWidth - 80) : 0;

      // Couleur de la barre
      const color = this.levelColors[level];
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      // Label du niveau
      pdf.setFontSize(9);
      pdf.setTextColor(60, 60, 60);
      pdf.text(this.getLevelLabel(level), chartX, barY + 5);

      // Barre
      if (count > 0) {
        pdf.setFillColor(r, g, b);
        pdf.roundedRect(chartX + 70, barY, barWidth, barHeight, 1, 1, 'F');

        // Nombre
        pdf.setFontSize(10);
        pdf.setFont("helvetica", 'bold');
        pdf.setTextColor(r, g, b);
        pdf.text(count.toString(), chartX + 70 + barWidth + 3, barY + 5);
      }
    });

    return yPosition + (orderedLevels.length * (barHeight + 3)) + 10;
  }

  private addSkillsTable(pdf: jsPDF, skills: Skill[], pageWidth: number, yPosition: number, pageHeight: number): number {
    // Vérifier si on a besoin d'une nouvelle page
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont("helvetica", 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Liste détaillée des compétences', 15, yPosition);
    yPosition += 8;

    // Trier les compétences par catégorie puis par nom
    const sortedSkills = [...skills].sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });

    // En-tête du tableau
    pdf.setFillColor(59, 130, 246);
    pdf.rect(15, yPosition, pageWidth - 30, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", 'bold');
    pdf.text('Compétence', 18, yPosition + 5);
    pdf.text('Catégorie', 90, yPosition + 5);
    pdf.text('Niveau', 135, yPosition + 5);
    pdf.text('Sessions', 165, yPosition + 5);
    pdf.text('Heures', 182, yPosition + 5);
    yPosition += 10;

    // Lignes du tableau
    let currentCategory = '';
    sortedSkills.forEach((skill, index) => {
      // Vérifier si on a besoin d'une nouvelle page
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
        
        // Redessiner l'en-tête
        pdf.setFillColor(59, 130, 246);
        pdf.rect(15, yPosition, pageWidth - 30, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", 'bold');
        pdf.text('Compétence', 18, yPosition + 5);
        pdf.text('Catégorie', 90, yPosition + 5);
        pdf.text('Niveau', 135, yPosition + 5);
        pdf.text('Sessions', 165, yPosition + 5);
        pdf.text('Heures', 182, yPosition + 5);
        yPosition += 10;
      }

      // Fond alterné
      if (index % 2 === 0) {
        pdf.setFillColor(245, 247, 250);
        pdf.rect(15, yPosition - 2, pageWidth - 30, 8, 'F');
      }

      // Contenu
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", 'normal');
      pdf.setFontSize(8);
      
      // Nom de la compétence (tronqué si trop long)
      const skillName = skill.name.length > 30 ? skill.name.substring(0, 27) + '...' : skill.name;
      pdf.text(skillName, 18, yPosition + 3);
      
      // Catégorie
      pdf.setTextColor(100, 100, 100);
      pdf.text(this.getCategoryLabel(skill.category), 90, yPosition + 3);
      
      // Niveau
      const levelColor = this.levelColors[skill.currentLevel];
      const r = parseInt(levelColor.slice(1, 3), 16);
      const g = parseInt(levelColor.slice(3, 5), 16);
      const b = parseInt(levelColor.slice(5, 7), 16);
      pdf.setTextColor(r, g, b);
      pdf.text(this.getLevelLabel(skill.currentLevel), 135, yPosition + 3);
      
      // Stats
      pdf.setTextColor(60, 60, 60);
      pdf.text(skill.totalLearningSessions.toString(), 170, yPosition + 3, { align: 'center' });
      pdf.text(`${skill.totalLearningHours}h`, 185, yPosition + 3, { align: 'center' });

      yPosition += 8;
    });

    return yPosition;
  }

  private addFooter(pdf: jsPDF, pageWidth: number, pageHeight: number): void {
    const totalPages = pdf.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Ligne de séparation
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
      
      // Texte du footer
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);
      pdf.text('Skills Tracker - Portfolio de Compétences', pageWidth / 2, pageHeight - 10, { align: 'center' });
      pdf.text(`Page ${i} sur ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
    }
  }

  private getCategoryLabel(category: SkillCategory): string {
    const labels: Record<SkillCategory, string> = {
      [SkillCategory.PROGRAMMING]: 'Programmation',
      [SkillCategory.FRAMEWORK]: 'Framework',
      [SkillCategory.DATABASE]: 'Base de données',
      [SkillCategory.DEVOPS]: 'DevOps',
      [SkillCategory.ARCHITECTURE]: 'Architecture',
      [SkillCategory.SOFT_SKILLS]: 'Soft Skills',
      [SkillCategory.TOOLS]: 'Outils',
      [SkillCategory.LANGUAGE]: 'Langage',
      [SkillCategory.OTHER]: 'Autre'
    };
    return labels[category] || category;
  }

  private getLevelLabel(level: SkillLevel): string {
    const labels: Record<SkillLevel, string> = {
      [SkillLevel.BEGINNER]: 'Débutant',
      [SkillLevel.ELEMENTARY]: 'Élémentaire',
      [SkillLevel.INTERMEDIATE]: 'Intermédiaire',
      [SkillLevel.ADVANCED]: 'Avancé',
      [SkillLevel.EXPERT]: 'Expert'
    };
    return labels[level] || level;
  }
}
