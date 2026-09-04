import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../lib/db.js';
import { env } from '../config/env.js';

const startTime = Date.now();

export class HealthController {
  static getHealth(_req: Request, res: Response) {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    return res.status(200).json({
      status: 'ok',
      service: 'engineeringhub-backend',
      version: '1.0.0',
      uptimeSeconds,
      timestamp: new Date().toISOString(),
    });
  }

  static async getReady(_req: Request, res: Response) {
    const dbStatus = await checkDatabaseConnection();

    // Check if live external dependencies are healthy
    const isReady = dbStatus.isHealthy;

    const statusCode = isReady ? 200 : 503;

    return res.status(statusCode).json({
      status: isReady ? 'ready' : 'unready',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: {
          status: dbStatus.isHealthy ? 'connected' : 'disconnected',
          latencyMs: dbStatus.latencyMs,
          error: dbStatus.error,
        },
        environment: {
          mode: env.NODE_ENV,
          githubOAuthConfigured: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
          githubWebhookConfigured: Boolean(env.GITHUB_WEBHOOK_SECRET),
        },
      },
    });
  }
}
