import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { store } from '../services/store.js';

describe('RBAC Security & Authorization Integration Tests', () => {
  let ownerToken: string;
  let devToken: string;
  let viewerToken: string;
  let analystToken: string;
  let orgId: string;
  let devUserId: string;

  beforeEach(async () => {
    store.reset();

    // 1. Register Owner
    const regOwner = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'owner@enterprise.com',
        password: 'Password123!',
        name: 'Big Boss',
      });
    ownerToken = regOwner.body.data.token;
    orgId = regOwner.body.data.organization.id;

    // 2. Register Developer user
    const regDev = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'developer@enterprise.com',
        password: 'Password123!',
        name: 'Dev Dave',
      });
    devToken = regDev.body.data.token;
    devUserId = regDev.body.data.user.id;

    // Owner adds Dev Dave to orgId as DEVELOPER
    await request(app)
      .post(`/api/organizations/${orgId}/members/invite`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        email: 'developer@enterprise.com',
        role: 'DEVELOPER',
      });

    // 3. Register Viewer user
    const regViewer = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'viewer@enterprise.com',
        password: 'Password123!',
        name: 'View Only Vic',
      });
    viewerToken = regViewer.body.data.token;

    // Owner adds Vic to orgId as VIEWER
    await request(app)
      .post(`/api/organizations/${orgId}/members/invite`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        email: 'viewer@enterprise.com',
        role: 'VIEWER',
      });

    // 4. Register Security Analyst
    const regAnalyst = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'analyst@enterprise.com',
        password: 'Password123!',
        name: 'Sec Sam',
      });
    analystToken = regAnalyst.body.data.token;

    // Owner adds Sam to orgId as SECURITY_ANALYST
    await request(app)
      .post(`/api/organizations/${orgId}/members/invite`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        email: 'analyst@enterprise.com',
        role: 'SECURITY_ANALYST',
      });
  });

  it('MANDATORY TEST: Developer cannot perform Admin action (cannot invite member)', async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgId}/members/invite`)
      .set('Authorization', `Bearer ${devToken}`)
      .send({
        email: 'friend@external.com',
        role: 'DEVELOPER',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN_ROLE');
  });

  it('MANDATORY TEST: Viewer cannot modify resources (cannot change member role)', async () => {
    const res = await request(app)
      .patch(`/api/organizations/${orgId}/members/${devUserId}/role`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        role: 'ADMIN',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN_ROLE');
  });

  it('MANDATORY TEST: Developer cannot view sensitive Audit Logs', async () => {
    const res = await request(app)
      .get(`/api/organizations/${orgId}/audit-logs`)
      .set('Authorization', `Bearer ${devToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN_ROLE');
  });

  it('should allow Security Analyst to view Audit Logs', async () => {
    const res = await request(app)
      .get(`/api/organizations/${orgId}/audit-logs`)
      .set('Authorization', `Bearer ${analystToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should allow Owner to update member role to ADMIN', async () => {
    const res = await request(app)
      .patch(`/api/organizations/${orgId}/members/${devUserId}/role`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        role: 'ADMIN',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('ADMIN');
  });
});
