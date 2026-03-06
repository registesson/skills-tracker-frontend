import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Skill, NotificationPreferences } from '../models/skill.model';
import { SkillNotification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = '/api/skills';
  
  activeNotifications = signal<SkillNotification[]>([]);
  
  constructor(private http: HttpClient) {
    this.initNotificationCheck();
  }

  /**
   * Initialise la vérification périodique des notifications
   * Vérifie toutes les heures
   */
  private initNotificationCheck(): void {
    // Vérification initiale
    this.checkInactiveSkills();
    
    // Vérification périodique toutes les heures
    setInterval(() => {
      this.checkInactiveSkills();
    }, 60 * 60 * 1000); // 1 heure
  }

  /**
   * Vérifie les compétences inactives et génère des notifications
   */
  checkInactiveSkills(): void {
    this.http.get<Skill[]>('/api/skills').subscribe({
      next: (skills) => {
        const notifications: SkillNotification[] = [];
        const now = new Date();

        skills.forEach(skill => {
          // Vérifier si les notifications sont activées pour cette compétence
          const notifEnabled = skill.notificationPreferences?.enabled ?? true;
          const threshold = skill.notificationPreferences?.inactiveDaysThreshold ?? 3;

          if (notifEnabled && skill.lastSessionDate) {
            const lastSessionDate = new Date(skill.lastSessionDate);
            const daysSinceLastSession = Math.floor(
              (now.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysSinceLastSession >= threshold) {
              notifications.push({
                skillId: skill.id,
                skillName: skill.name,
                daysSinceLastSession: daysSinceLastSession,
                message: `Vous n'avez pas pratiqué "${skill.name}" depuis ${daysSinceLastSession} jours`,
                timestamp: now
              });
            }
          } else if (notifEnabled && !skill.lastSessionDate && skill.totalLearningSessions === 0) {
            // Compétence sans aucune session
            const createdDate = new Date(skill.createdAt);
            const daysSinceCreation = Math.floor(
              (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysSinceCreation >= threshold) {
              notifications.push({
                skillId: skill.id,
                skillName: skill.name,
                daysSinceLastSession: daysSinceCreation,
                message: `Commencez à pratiquer "${skill.name}" !`,
                timestamp: now
              });
            }
          }
        });

        this.activeNotifications.set(notifications);
      },
      error: (error) => {
        console.error('Erreur lors de la vérification des compétences inactives:', error);
      }
    });
  }

  /**
   * Met à jour les préférences de notification pour une compétence
   */
  updateNotificationPreferences(
    skillId: string,
    preferences: NotificationPreferences
  ): Observable<Skill> {
    return this.http.put<Skill>(
      `${this.API_URL}/${skillId}/notification-preferences`,
      preferences
    ).pipe(
      tap(() => {
        // Revérifier les notifications après la mise à jour
        this.checkInactiveSkills();
      })
    );
  }

  /**
   * Marque une notification comme lue/fermée
   */
  dismissNotification(skillId: string): void {
    this.activeNotifications.update(notifications =>
      notifications.filter(n => n.skillId !== skillId)
    );
  }

  /**
   * Efface toutes les notifications
   */
  dismissAllNotifications(): void {
    this.activeNotifications.set([]);
  }

  /**
   * Vérifie si les notifications du navigateur sont activées
   */
  async requestBrowserNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Ce navigateur ne supporte pas les notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Envoie une notification du navigateur
   */
  sendBrowserNotification(notification: SkillNotification): void {
    if (Notification.permission === 'granted') {
      new Notification('Skills Tracker - Rappel de pratique', {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.skillId,
        requireInteraction: false
      });
    }
  }
}
