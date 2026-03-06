export interface NotificationSettings {
  enabled: boolean;
  inactiveDaysThreshold: number; // Par défaut 3 jours
}

export interface SkillNotification {
  skillId: string;
  skillName: string;
  daysSinceLastSession: number;
  message: string;
  timestamp: Date;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  inactiveDaysThreshold: 3
};
