import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { store } from '../services/store.js';

describe('GitHub Integration Core & Repository Management', () => {
  let ownerToken: string;
  let devToken: string;
  let viewerToken: string;
  let orgId: string;
  let otherOrgToken: string;
  let otherOrgId: string;

  beforeEach(async () => {
    store.reset();

    // Register Owner
    const regOwner = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'owner@octo.dev',
        password: 'Password123!',
        name: 'Octo Owner',
      });
    ownerToken = regOwner.body.data.token;
    orgId = regOwner.body.data.organization.id;

    // Register Developer
    const regDev = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'developer@octo.dev',
        password: 'Password123!',
        name: 'Dev Dana',
      });
    devToken = regDev.body.data.token;

    await request(app)
      .post(`/api/organizations/${orgId}/members/invite`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        email: 'developer@octo.dev',
        role: 'DEVELOPER',
      });

    // Register Viewer
    const regViewer = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'viewer@octo.dev',
        password: 'Password123!',
        name: 'Viewer Victor',
      });
    viewerToken = regViewer.body.data.token;

    await request(app)
      .post(`/api/organizations/${orgId}/members/invite`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        email: 'viewer@octo.dev',
        role: 'VIEWER',
      });

    // Register User in completely different organization
    const regOther = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'other@competitor.com',
        password: 'Password123!',
        name: 'Competitor User',
      });
    otherOrgToken = regOther.body.data.token;
    otherOrgId = regOther.body.data.organization.id;
  });

  describe('Honest Configuration Boundaries & OAuth', () => {
    it('should report CONFIGURATION_REQUIRED when OAuth credentials are not supplied', async () => {
      const res = await request(app).get('/api/auth/github/authorize');

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFIGURATION_REQUIRED');
      expect(res.body.error.message).toContain('credentials are not configured');
    });

    it('should reject repo discovery when token header is omitted', async () => {
      const res = await request(app)
        .get(`/api/organizations/${orgId}/github/repos`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('TOKEN_REQUIRED');
    });
  });

  describe('Repository Connection & RBAC', () => {
    const testRepo = {
      githubRepoId: '12345678',
      name: 'microservice-auth',
      fullName: 'octo-org/microservice-auth',
      ownerLogin: 'octo-org',
      description: 'Authentication microservice',
      defaultBranch: 'main',
      isPrivate: true,
      htmlUrl: 'https://github.com/octo-org/microservice-auth',
    };

    it('should allow Owner to connect a repository', async () => {
      const res = await request(app)
        .post(`/api/organizations/${orgId}/repositories/connect`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(testRepo);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('microservice-auth');
      expect(res.body.data.syncStatus).toBe('IDLE');
    });

    it('should prevent Developer from connecting a repository (RBAC restriction)', async () => {
      const res = await request(app)
        .post(`/api/organizations/${orgId}/repositories/connect`)
        .set('Authorization', `Bearer ${devToken}`)
        .send(testRepo);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN_ROLE');
    });

    it('should reject duplicate repository connection in the same organization', async () => {
      await request(app)
        .post(`/api/organizations/${orgId}/repositories/connect`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(testRepo);

      const res = await request(app)
        .post(`/api/organizations/${orgId}/repositories/connect`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(testRepo);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('REPOSITORY_ALREADY_CONNECTED');
    });
  });

  describe('Demo Repository Seeding & Derived Views', () => {
    it('should seed an honest, explicitly labeled [DEMO DATA] repository with full metrics data', async () => {
      const res = await request(app)
        .post(`/api/organizations/${orgId}/repositories/demo`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toContain('[DEMO DATA]');
      expect(res.body.meta.note).toContain('DEMO DATA');

      const repoId = res.body.data.id;

      // 1. Query repository details
      const detailsRes = await request(app)
        .get(`/api/organizations/${orgId}/repositories/${repoId}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(detailsRes.status).toBe(200);
      expect(detailsRes.body.data.stats.commitsCount).toBeGreaterThan(0);
      expect(detailsRes.body.data.stats.prsCount).toBeGreaterThan(0);

      // 2. Query commits
      const commitsRes = await request(app)
        .get(`/api/organizations/${orgId}/repositories/${repoId}/commits`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(commitsRes.status).toBe(200);
      expect(commitsRes.body.data.length).toBe(20);
      expect(commitsRes.body.data[0].message).toContain('[DEMO DATA]');

      // 3. Query PRs
      const prsRes = await request(app)
        .get(`/api/organizations/${orgId}/repositories/${repoId}/pull-requests`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(prsRes.status).toBe(200);
      expect(prsRes.body.data.length).toBe(4);

      // 4. Query Issues
      const issuesRes = await request(app)
        .get(`/api/organizations/${orgId}/repositories/${repoId}/issues`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(issuesRes.status).toBe(200);
      expect(issuesRes.body.data.length).toBe(3);

      // 5. Query Releases
      const releasesRes = await request(app)
        .get(`/api/organizations/${orgId}/repositories/${repoId}/releases`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(releasesRes.status).toBe(200);
      expect(releasesRes.body.data.length).toBe(1);
      expect(releasesRes.body.data[0].tagName).toBe('v1.0.0');
    });

    it('MANDATORY SECURITY TEST: Competitor from Other Org cannot access Org A repository data', async () => {
      // Owner seeds repo in Org A
      const seedRes = await request(app)
        .post(`/api/organizations/${orgId}/repositories/demo`)
        .set('Authorization', `Bearer ${ownerToken}`);

      const repoId = seedRes.body.data.id;

      // Competitor attempts to query Org A's repository details
      const res = await request(app)
        .get(`/api/organizations/${orgId}/repositories/${repoId}`)
        .set('Authorization', `Bearer ${otherOrgToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN_TENANT_ACCESS');

      // Competitor attempts to query Org A's commits
      const commitRes = await request(app)
        .get(`/api/organizations/${orgId}/repositories/${repoId}/commits`)
        .set('Authorization', `Bearer ${otherOrgToken}`);

      expect(commitRes.status).toBe(403);
      expect(commitRes.body.error.code).toBe('FORBIDDEN_TENANT_ACCESS');
    });
  });
});
