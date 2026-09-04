import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const webhookRouter = Router();

// Public webhook ingest endpoint for GitHub (verified via HMAC signature)
webhookRouter.post('/webhooks/github', WebhookController.handleWebhook);

// Protected audit route to inspect incoming webhooks
webhookRouter.get('/webhooks', requireAuth, WebhookController.listWebhooks);
