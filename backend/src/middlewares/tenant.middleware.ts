import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { store } from '../services/store.js';
import { AppError } from './error.middleware.js';

export function requireTenant(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required before tenant resolution.', 401, 'UNAUTHORIZED'));
    }

    // Determine target organization from params or header
    const rawParam = req.params.orgId || req.params.orgSlug || (req.headers['x-organization-id'] as string);

    if (!rawParam) {
      return next(new AppError('Organization context required. Missing orgId/slug in path or header.', 400, 'ORG_CONTEXT_REQUIRED'));
    }

    const orgParam = Array.isArray(rawParam) ? rawParam[0] : String(rawParam);

    // Lookup organization by ID first, then by slug
    let org = store.findOrgById(orgParam);
    if (!org) {
      org = store.findOrgBySlug(orgParam);
    }

    if (!org) {
      return next(new AppError(`Organization '${orgParam}' not found.`, 404, 'ORGANIZATION_NOT_FOUND'));
    }

    // Enforce tenant boundary: Verify authenticated user has membership in this organization
    const membership = store.findMembership(org.id, req.user.id);
    if (!membership) {
      return next(
        new AppError(
          'Access denied. You do not belong to this organization.',
          403,
          'FORBIDDEN_TENANT_ACCESS'
        )
      );
    }

    // Attach verified tenant context
    req.tenant = {
      organizationId: org.id,
      organizationSlug: org.slug,
      role: membership.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}
