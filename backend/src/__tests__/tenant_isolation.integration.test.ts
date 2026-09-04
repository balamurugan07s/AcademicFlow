import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { store } from '../services/store.js';

describe('Multi-Tenancy & Tenant Isolation Security Tests', () => {
  let userAToken: string;
  let userBToken: string;
  let orgAId: string;
  let orgBId: string;

  beforeEach(async () => {
    store.reset();

    // Register User A
    const regA = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'usera@company-a.com',
        password: 'Password123!',
        name: 'User A',
      });
    userAToken = regA.body.data.token;
    orgAId = regA.body.data.organization.id;

    // Register User B
    const regB = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'userb@company-b.com',
        password: 'Password123!',
        name: 'User B',
      });
    userBToken = regB.body.data.token;
    orgBId = regB.body.data.organization.id;
  });

  it('MANDATORY TEST: User A cannot query Organization B details', async () => {
    // User A attempts to read Org B
    const res = await request(app)
      .get(`/api/organizations/${orgBId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN_TENANT_ACCESS');
  });

  it('MANDATORY TEST: User A cannot invite members to Organization B', async () => {
    // User A attempts to invite an outsider into Org B
    const res = await request(app)
      .post(`/api/organizations/${orgBId}/members/invite`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        email: 'spy@external.com',
        role: 'ADMIN',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN_TENANT_ACCESS');
  });

  it('MANDATORY TEST: User A cannot view Audit Logs of Organization B', async () => {
    const res = await request(app)
      .get(`/api/organizations/${orgBId}/audit-logs`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN_TENANT_ACCESS');
  });

  it('should allow User A to access their own Organization A', async () => {
    const res = await request(app)
      .get(`/api/organizations/${orgAId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(orgAId);
  });
});
