import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (notifications().length > 0) {
      <div class="notification-banner">
        <div class="notification-header">
          <h3>
            <span class="icon">🔔</span>
            Rappels de pratique ({{ notifications().length }})
          </h3>
          <button 
            class="btn-dismiss-all" 
            (click)="dismissAll()"
            title="Tout ignorer"
          >
            ✕
          </button>
        </div>

        <div class="notification-list">
          @for (notification of notifications(); track notification.skillId) {
            <div class="notification-item">
              <div class="notification-content">
                <p class="notification-message">{{ notification.message }}</p>
                <p class="notification-detail">
                  Dernière pratique : il y a {{ notification.daysSinceLastSession }} jours
                </p>
              </div>
              <div class="notification-actions">
                <a 
                  [routerLink]="['/skills', notification.skillId]"
                  class="btn btn-practice"
                >
                  Pratiquer
                </a>
                <button 
                  class="btn btn-dismiss" 
                  (click)="dismiss(notification.skillId)"
                  title="Ignorer"
                >
                  ✕
                </button>
              </div>
            </div>
          }
        </div>

        @if (!browserNotificationsEnabled()) {
          <div class="browser-notification-prompt">
            <p>
              💡 Activez les notifications du navigateur pour être alerté même lorsque l'application est fermée.
            </p>
            <button 
              class="btn btn-enable-notifications" 
              (click)="enableBrowserNotifications()"
            >
              Activer les notifications
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .notification-banner {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .notification-header h3 {
      margin: 0;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .icon {
      font-size: 1.75rem;
      animation: ring 2s ease-in-out infinite;
    }

    @keyframes ring {
      0%, 100% { transform: rotate(0deg); }
      10%, 30% { transform: rotate(-10deg); }
      20%, 40% { transform: rotate(10deg); }
    }

    .btn-dismiss-all {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 1.5rem;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-dismiss-all:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .notification-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-item {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      padding: 1rem;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .notification-content {
      flex: 1;
    }

    .notification-message {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .notification-detail {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .notification-actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-block;
    }

    .btn-practice {
      background: white;
      color: #667eea;
      font-weight: 600;
    }

    .btn-practice:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .btn-dismiss {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      font-size: 1.25rem;
      width: 2rem;
      height: 2rem;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-dismiss:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .browser-notification-prompt {
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      border: 1px dashed rgba(255, 255, 255, 0.3);
    }

    .browser-notification-prompt p {
      margin: 0 0 0.75rem 0;
      font-size: 0.95rem;
    }

    .btn-enable-notifications {
      background: white;
      color: #667eea;
      font-weight: 600;
    }

    .btn-enable-notifications:hover {
      background: #f8f9fa;
    }

    @media (max-width: 768px) {
      .notification-item {
        flex-direction: column;
        align-items: flex-start;
      }

      .notification-actions {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class NotificationBannerComponent {
  private notificationService = inject(NotificationService);
  
  notifications = this.notificationService.activeNotifications;
  browserNotificationsEnabled = computed(() => {
    return 'Notification' in window && Notification.permission === 'granted';
  });

  dismiss(skillId: string): void {
    this.notificationService.dismissNotification(skillId);
  }

  dismissAll(): void {
    this.notificationService.dismissAllNotifications();
  }

  async enableBrowserNotifications(): Promise<void> {
    const granted = await this.notificationService.requestBrowserNotificationPermission();
    if (granted && this.notifications().length > 0) {
      // Envoyer une notification de test
      this.notificationService.sendBrowserNotification(this.notifications()[0]);
    }
  }
}
