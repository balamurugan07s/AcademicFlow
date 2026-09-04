import { Request, Response, NextFunction } from 'express';
import { WebhookService } from '../services/webhook.service.js';
import { store } from '../services/store.js';
import { AppError } from '../middlewares/error.middleware.js';

export class WebhookController {
  static handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-hub-signature-256'] as string | undefined;
      const deliveryId = req.headers['x-github-delivery'] as string | undefined;
      const eventType = req.headers['x-github-event'] as string | undefined;

      // Ensure raw body is captured for cryptographic integrity
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      // Verify HMAC SHA-256 Signature
      const isValid = WebhookService.verifySignature(rawBody, signature);
      if (!isValid) {
        throw new AppError(
          'Webhook HMAC SHA-256 signature verification failed. Unauthorized payload.',
          401,
          'INVALID_WEBHOOK_SIGNATURE'
        );
      }

      if (!req.body || typeof req.body !== 'object') {
        throw new AppError('Malformed webhook JSON payload.', 400, 'MALFORMED_PAYLOAD');
      }

      const result = WebhookService.processWebhook(rawBody, req.body, {
        signature,
        deliveryId,
        eventType,
      });

      if (result.isDuplicate) {
        return res.status(200).json({
          success: true,
          message: 'Duplicate delivery already recorded. Skipping redundant processing.',
          deliveryId: result.deliveryId,
        });
      }

      // Return HTTP 202 Accepted within <50ms while worker processes asynchronously
      return res.status(202).json({
        success: true,
        message: 'Webhook accepted for asynchronous background processing.',
        deliveryId: result.deliveryId,
      });
    } catch (error) {
      return next(error);
    }
  }

  static listWebhooks(_req: Request, res: Response, next: NextFunction) {
    try {
      const events = Array.from(store.webhookEvents.values())
        .sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime())
        .slice(0, 50)
        .map((e) => ({
          id: e.id,
          deliveryId: e.deliveryId,
          eventType: e.eventType,
          signatureVerified: e.signatureVerified,
          processingStatus: e.processingStatus,
          errorMessage: e.errorMessage,
          receivedAt: e.receivedAt,
        }));

      return res.status(200).json({
        success: true,
        data: events,
      });
    } catch (error) {
      return next(error);
    }
  }
}
