import { Router } from 'express';
import { z } from 'zod';
import { SecurityController } from '../controllers/security.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireTenant } from '../middlewares/tenant.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

export const securityRouter = Router();

const scanDepsSchema = {
  body: z.object({
    dependencies: z.record(z.string()),
  }),
};

const scanSecretsSchema = {
  body: z.object({
    filePath: z.string().min(1, 'File path is required'),
    content: z.string(),
  }),
};

const triageSchema = {
  body: z.object({
    status: z.enum(['RESOLVED', 'DISMISSED']),
  }),
};

// Organization wide findings
securityRouter.get(
  '/organizations/:orgId/security/findings',
  requireAuth,
  requireTenant,
  SecurityController.listFindings
);

// Repository specific findings
securityRouter.get(
  '/organizations/:orgId/repositories/:repoId/security/findings',
  requireAuth,
  requireTenant,
  SecurityController.listFindings
);

// Run dependency analysis
securityRouter.post(
  '/organizations/:orgId/repositories/:repoId/security/scan-dependencies',
  requireAuth,
  requireTenant,
  requireRole(['OWNER', 'ADMIN', 'SECURITY_ANALYST']),
  validate(scanDepsSchema),
  SecurityController.scanDependencies
);

// Run secret detection
securityRouter.post(
  '/organizations/:orgId/repositories/:repoId/security/scan-secrets',
  requireAuth,
  requireTenant,
  requireRole(['OWNER', 'ADMIN', 'SECURITY_ANALYST']),
  validate(scanSecretsSchema),
  SecurityController.scanSecrets
);

// Triage finding status
securityRouter.patch(
  '/organizations/:orgId/security/findings/:findingId/triage',
  requireAuth,
  requireTenant,
  requireRole(['OWNER', 'ADMIN', 'SECURITY_ANALYST']),
  validate(triageSchema),
  SecurityController.triageFinding
);

// Code health score and formula
securityRouter.get(
  '/organizations/:orgId/repositories/:repoId/code-health',
  requireAuth,
  requireTenant,
  SecurityController.getCodeHealth
);
