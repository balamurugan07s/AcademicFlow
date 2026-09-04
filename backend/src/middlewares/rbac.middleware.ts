import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, Role, Permission } from '../types/index.js';
import { AppError } from './error.middleware.js';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    'org:delete',
    'org:update',
    'member:invite',
    'member:remove',
    'member:update_role',
    'repo:connect',
    'repo:sync',
    'repo:view',
    'metrics:view',
    'security:triage',
    'audit:view',
  ],
  ADMIN: [
    'org:update',
    'member:invite',
    'member:remove',
    'member:update_role',
    'repo:connect',
    'repo:sync',
    'repo:view',
    'metrics:view',
    'security:triage',
    'audit:view',
  ],
  DEVELOPER: [
    'repo:sync',
    'repo:view',
    'metrics:view',
  ],
  SECURITY_ANALYST: [
    'repo:view',
    'metrics:view',
    'security:triage',
    'audit:view',
  ],
  VIEWER: [
    'repo:view',
    'metrics:view',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const allowed = ROLE_PERMISSIONS[role];
  return allowed ? allowed.includes(permission) : false;
}

export function requireRole(allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.tenant) {
      return next(new AppError('Tenant context required before RBAC evaluation.', 500, 'TENANT_CONTEXT_MISSING'));
    }

    if (!allowedRoles.includes(req.tenant.role)) {
      return next(
        new AppError(
          `Access denied. Role '${req.tenant.role}' does not have required privilege.`,
          403,
          'FORBIDDEN_ROLE'
        )
      );
    }

    return next();
  };
}

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.tenant) {
      return next(new AppError('Tenant context required before RBAC evaluation.', 500, 'TENANT_CONTEXT_MISSING'));
    }

    if (!hasPermission(req.tenant.role, permission)) {
      return next(
        new AppError(
          `Access denied. Missing permission '${permission}'.`,
          403,
          'FORBIDDEN_PERMISSION'
        )
      );
    }

    return next();
  };
}
