import { Request } from 'express';

export type Role = 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'VIEWER' | 'SECURITY_ANALYST';

export type Permission =
  | 'org:delete'
  | 'org:update'
  | 'member:invite'
  | 'member:remove'
  | 'member:update_role'
  | 'repo:connect'
  | 'repo:sync'
  | 'repo:view'
  | 'metrics:view'
  | 'security:triage'
  | 'audit:view';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
}

export interface TenantContext {
  organizationId: string;
  organizationSlug: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  tenant?: TenantContext;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
  meta?: Record<string, any>;
}
