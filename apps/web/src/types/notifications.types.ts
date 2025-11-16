/**
 * Notification System Types
 */

export type NotificationType = 'success' | 'info' | 'warning' | 'error' | 'achievement';

export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  waterReminders: boolean;
  mealReminders: boolean;
  goalMilestones: boolean;
  weeklyReports: boolean;
  achievementUnlocks: boolean;
  premiumOffers: boolean;
}
