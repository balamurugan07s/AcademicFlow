import { Router } from 'express';
import { z } from 'zod';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireTenant } from '../middlewares/tenant.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

export const analyticsRouter = Router();

const recordDeploymentSchema = {
  body: z.object({
    environment: z.enum(['DEVELOPMENT', 'STAGING', 'PRODUCTION']),
    version: z.string().min(1, 'Version is required'),
    commitSha: z.string().min(6, 'Commit SHA is required'),
    status: z.enum(['PENDING', 'RUNNING', 'SUCCESSFUL', 'FAILED', 'ROLLED_BACK']),
    durationMs: z.number().int().positive().nullable().optional(),
    deployedBy: z.string().optional(),
  }),
};

// 1. Organization Dashboard Summary
analyticsRouter.get('/organizations/:orgId/dashboard', requireAuth, requireTenant, AnalyticsController.getDashboardSummary);

// 2. DORA Metrics
analyticsRouter.get('/organizations/:orgId/analytics/dora', requireAuth, requireTenant, AnalyticsController.getDoraMetrics);

// 3. Repository Velocity Analytics
analyticsRouter.get(
  '/organizations/:orgId/repositories/:repoId/analytics',
  requireAuth,
  requireTenant,
  AnalyticsController.getRepoAnalytics
);

// 4. CI/CD Pipeline Runs
analyticsRouter.get('/organizations/:orgId/pipelines', requireAuth, requireTenant, AnalyticsController.listPipelines);
analyticsRouter.get(
  '/organizations/:orgId/repositories/:repoId/pipelines',
  requireAuth,
  requireTenant,
  AnalyticsController.listPipelines
);

// 5. Deployments
analyticsRouter.get('/organizations/:orgId/deployments', requireAuth, requireTenant, AnalyticsController.listDeployments);
analyticsRouter.get(
  '/organizations/:orgId/repositories/:repoId/deployments',
  requireAuth,
  requireTenant,
  AnalyticsController.listDeployments
);

analyticsRouter.post(
  '/organizations/:orgId/repositories/:repoId/deployments',
  requireAuth,
  requireTenant,
  requireRole(['OWNER', 'ADMIN', 'DEVELOPER']),
  validate(recordDeploymentSchema),
  AnalyticsController.recordDeployment
);
