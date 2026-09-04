import { Response, NextFunction } from 'express';
import { notificationStore } from '../services/notification.service.js';
import { SearchService } from '../services/search.service.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError } from '../middlewares/error.middleware.js';

export class NotificationController {
  static listNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const unreadOnly = req.query.unread === 'true';
      const items = notificationStore.listNotifications(
        req.tenant!.organizationId,
        req.user!.id,
        unreadOnly
      );

      return res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error) {
      return next(error);
    }
  }

  static markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
      const updated = notificationStore.markAsRead(id, req.user!.id);
      if (!updated) {
        throw new AppError('Notification not found or access denied.', 404, 'NOTIFICATION_NOT_FOUND');
      }

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      return next(error);
    }
  }

  static markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const count = notificationStore.markAllAsRead(req.tenant!.organizationId, req.user!.id);
      return res.status(200).json({
        success: true,
        data: { markedCount: count },
      });
    } catch (error) {
      return next(error);
    }
  }

  static globalSearch(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string) || '';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const results = SearchService.search(req.tenant!.organizationId, query, limit);

      return res.status(200).json({
        success: true,
        data: {
          query,
          totalResults: results.length,
          results,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}
