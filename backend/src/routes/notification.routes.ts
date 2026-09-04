import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireTenant } from '../middlewares/tenant.middleware.js';

export const notificationRouter = Router();

// Notifications
notificationRouter.get(
  '/organizations/:orgId/notifications',
  requireAuth,
  requireTenant,
  NotificationController.listNotifications
);

notificationRouter.patch(
  '/organizations/:orgId/notifications/:id/read',
  requireAuth,
  requireTenant,
  NotificationController.markAsRead
);

notificationRouter.post(
  '/organizations/:orgId/notifications/read-all',
  requireAuth,
  requireTenant,
  NotificationController.markAllAsRead
);

// Global Search across organization resources
notificationRouter.get(
  '/organizations/:orgId/search',
  requireAuth,
  requireTenant,
  NotificationController.globalSearch
);
