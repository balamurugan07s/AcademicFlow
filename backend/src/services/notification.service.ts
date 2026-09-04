import crypto from 'crypto';
import { store } from './store.js';

export interface NotificationRecord {
  id: string;
  organizationId: string;
  userId: string;
  type: 'PIPELINE_FAILED' | 'DEPLOYMENT_FAILED' | 'SECURITY_ALERT' | 'PR_ACTIVITY' | 'INVITATION';
  title: string;
  message: string;
  isRead: boolean;
  resourceType?: string;
  resourceId?: string;
  createdAt: Date;
}

// In-memory notifications store
class NotificationStore {
  public notifications = new Map<string, NotificationRecord>();

  reset() {
    this.notifications.clear();
  }

  createNotification(data: {
    organizationId: string;
    userId: string;
    type: NotificationRecord['type'];
    title: string;
    message: string;
    resourceType?: string;
    resourceId?: string;
  }): NotificationRecord {
    const item: NotificationRecord = {
      id: crypto.randomUUID(),
      organizationId: data.organizationId,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      isRead: false,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      createdAt: new Date(),
    };
    this.notifications.set(item.id, item);
    return item;
  }

  listNotifications(organizationId: string, userId: string, unreadOnly = false): NotificationRecord[] {
    return Array.from(this.notifications.values())
      .filter((n) => n.organizationId === organizationId && n.userId === userId && (!unreadOnly || !n.isRead))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  markAsRead(notificationId: string, userId: string): NotificationRecord | null {
    const item = this.notifications.get(notificationId);
    if (item && item.userId === userId) {
      item.isRead = true;
      return item;
    }
    return null;
  }

  markAllAsRead(organizationId: string, userId: string): number {
    let count = 0;
    for (const item of this.notifications.values()) {
      if (item.organizationId === organizationId && item.userId === userId && !item.isRead) {
        item.isRead = true;
        count++;
      }
    }
    return count;
  }
}

export const notificationStore = new NotificationStore();
