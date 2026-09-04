import crypto from 'crypto';
import { store, WebhookEventRecord } from './store.js';
import { timingSafeCompare } from '../lib/crypto.js';
import { QueueService } from './queue.service.js';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../middlewares/error.middleware.js';

export interface WebhookHeaders {
  signature?: string;
  deliveryId?: string;
  eventType?: string;
}

export class WebhookService {
  /**
   * Cryptographically verifies incoming GitHub webhook HMAC SHA-256 signature.
   */
  static verifySignature(rawBody: string | Buffer, signatureHeader?: string): boolean {
    const secret = env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
      logger.error('GITHUB_WEBHOOK_SECRET is not configured on server');
      return false;
    }

    if (!signatureHeader) {
      return false;
    }

    const parts = signatureHeader.split('=');
    if (parts.length !== 2 || parts[0] !== 'sha256') {
      return false;
    }

    const providedSignature = parts[1];
    const calculatedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    return timingSafeCompare(providedSignature, calculatedSignature);
  }

  /**
   * Processes incoming webhook payload:
   * 1. Checks delivery idempotency
   * 2. Persists raw payload
   * 3. Dispatches job to queue
   */
  static processWebhook(
    rawBody: string,
    parsedPayload: any,
    headers: WebhookHeaders
  ): { deliveryId: string; status: string; isDuplicate: boolean } {
    const deliveryId = headers.deliveryId;
    if (!deliveryId) {
      throw new AppError('Missing X-GitHub-Delivery header in webhook request.', 400, 'MISSING_DELIVERY_ID');
    }

    const eventType = headers.eventType || 'unknown';

    // 1. Idempotency Check: Look up deliveryId
    for (const existing of store.webhookEvents.values()) {
      if (existing.deliveryId === deliveryId) {
        logger.info('Duplicate webhook delivery received. Discarding duplicate.', { deliveryId, eventType });
        return {
          deliveryId,
          status: existing.processingStatus,
          isDuplicate: true,
        };
      }
    }

    // 2. Persist WebhookEvent record
    const eventRecord: WebhookEventRecord = {
      id: crypto.randomUUID(),
      deliveryId,
      organizationId: null,
      eventType,
      payload: typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody),
      signatureVerified: true,
      processingStatus: 'PENDING',
      errorMessage: null,
      receivedAt: new Date(),
    };

    store.webhookEvents.set(eventRecord.id, eventRecord);

    // 3. Enqueue to Worker Queue
    QueueService.enqueueWebhook({
      eventId: eventRecord.id,
      deliveryId,
      eventType,
      payload: parsedPayload,
    });

    return {
      deliveryId,
      status: 'PENDING',
      isDuplicate: false,
    };
  }
}
