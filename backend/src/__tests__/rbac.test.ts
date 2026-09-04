import { describe, it, expect } from 'vitest';
import { hasPermission } from '../middlewares/rbac.middleware.js';

describe('RBAC Permission Matrix', () => {
  it('should grant OWNER all administrative, operational, and security permissions', () => {
    expect(hasPermission('OWNER', 'org:delete')).toBe(true);
    expect(hasPermission('OWNER', 'member:invite')).toBe(true);
    expect(hasPermission('OWNER', 'member:update_role')).toBe(true);
    expect(hasPermission('OWNER', 'repo:connect')).toBe(true);
    expect(hasPermission('OWNER', 'repo:sync')).toBe(true);
    expect(hasPermission('OWNER', 'repo:view')).toBe(true);
    expect(hasPermission('OWNER', 'security:triage')).toBe(true);
    expect(hasPermission('OWNER', 'audit:view')).toBe(true);
  });

  it('should grant ADMIN team and repo management but NOT org:delete', () => {
    expect(hasPermission('ADMIN', 'org:delete')).toBe(false);
    expect(hasPermission('ADMIN', 'org:update')).toBe(true);
    expect(hasPermission('ADMIN', 'member:invite')).toBe(true);
    expect(hasPermission('ADMIN', 'repo:connect')).toBe(true);
    expect(hasPermission('ADMIN', 'repo:sync')).toBe(true);
  });

  it('should restrict DEVELOPER from admin actions while allowing dev actions', () => {
    expect(hasPermission('DEVELOPER', 'org:delete')).toBe(false);
    expect(hasPermission('DEVELOPER', 'member:invite')).toBe(false);
    expect(hasPermission('DEVELOPER', 'member:update_role')).toBe(false);
    expect(hasPermission('DEVELOPER', 'repo:connect')).toBe(false);
    expect(hasPermission('DEVELOPER', 'security:triage')).toBe(false);
    expect(hasPermission('DEVELOPER', 'audit:view')).toBe(false);

    expect(hasPermission('DEVELOPER', 'repo:sync')).toBe(true);
    expect(hasPermission('DEVELOPER', 'repo:view')).toBe(true);
    expect(hasPermission('DEVELOPER', 'metrics:view')).toBe(true);
  });

  it('should restrict VIEWER to read-only views', () => {
    expect(hasPermission('VIEWER', 'repo:view')).toBe(true);
    expect(hasPermission('VIEWER', 'metrics:view')).toBe(true);

    expect(hasPermission('VIEWER', 'repo:sync')).toBe(false);
    expect(hasPermission('VIEWER', 'repo:connect')).toBe(false);
    expect(hasPermission('VIEWER', 'member:invite')).toBe(false);
    expect(hasPermission('VIEWER', 'org:delete')).toBe(false);
  });

  it('should grant SECURITY_ANALYST triage and audit capabilities', () => {
    expect(hasPermission('SECURITY_ANALYST', 'security:triage')).toBe(true);
    expect(hasPermission('SECURITY_ANALYST', 'audit:view')).toBe(true);
    expect(hasPermission('SECURITY_ANALYST', 'repo:view')).toBe(true);

    expect(hasPermission('SECURITY_ANALYST', 'member:invite')).toBe(false);
    expect(hasPermission('SECURITY_ANALYST', 'repo:connect')).toBe(false);
  });
});
