import { Router } from 'express';
import { z } from 'zod';
import { OrgController } from '../controllers/org.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireTenant } from '../middlewares/tenant.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

export const orgRouter = Router();

const createOrgSchema = {
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and dashes'),
  }),
};

const inviteMemberSchema = {
  body: z.object({
    email: z.string().email('Valid email address required'),
    role: z.enum(['OWNER', 'ADMIN', 'DEVELOPER', 'VIEWER', 'SECURITY_ANALYST']),
  }),
};

const updateRoleSchema = {
  body: z.object({
    role: z.enum(['OWNER', 'ADMIN', 'DEVELOPER', 'VIEWER', 'SECURITY_ANALYST']),
  }),
};

// Top-level org routes
orgRouter.post('/', requireAuth, validate(createOrgSchema), OrgController.create);
orgRouter.get('/', requireAuth, OrgController.listMyOrgs);

// Tenant-scoped routes (enforces requireAuth + requireTenant)
orgRouter.get('/:orgId', requireAuth, requireTenant, OrgController.getDetails);
orgRouter.get('/:orgId/members', requireAuth, requireTenant, OrgController.getMembers);

// Admin / Owner restricted actions
orgRouter.post(
  '/:orgId/members/invite',
  requireAuth,
  requireTenant,
  requireRole(['OWNER', 'ADMIN']),
  validate(inviteMemberSchema),
  OrgController.inviteMember
);

orgRouter.patch(
  '/:orgId/members/:memberId/role',
  requireAuth,
  requireTenant,
  requireRole(['OWNER', 'ADMIN']),
  validate(updateRoleSchema),
  OrgController.updateRole
);

orgRouter.delete(
  '/:orgId/members/:memberId',
  requireAuth,
  requireTenant,
  requireRole(['OWNER', 'ADMIN']),
  OrgController.removeMember
);

// Audit logs restricted to Owner, Admin, and Security Analyst
orgRouter.get(
  '/:orgId/audit-logs',
  requireAuth,
  requireTenant,
  requireRole(['OWNER', 'ADMIN', 'SECURITY_ANALYST']),
  OrgController.getAuditLogs
);
