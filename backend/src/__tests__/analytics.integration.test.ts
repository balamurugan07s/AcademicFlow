import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { store } from '../services/store.js';

describe('Engineering Dashboard, DORA Metrics & CI/CD Pipelines', () => {
  let ownerToken: string;
  let devToken: string;
  let viewerToken: string;
  let orgId: string;
  let repoId: string;

  beforeEach(async () => {
    store.reset();

    // 1. Register Owner
    const regOwner = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'director@engineeringhub.dev',
        password: 'Password123!',
        name: 'Elena Director',
      });
    ownerToken = regOwner.body.data.token;
    orgId = regOwner.body.data.organization.id;

    // 2. Register Developer
    const regDev = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'dev@engineeringhub.dev',
        password: 'Password123!',
        name: 'Marcus Dev',
      });
    devToken = regDev.body.data.token;

    await request(app)
      .post(`/api/organizations/${orgId}/members/invite`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: 'dev@engineeringhub.dev', role: 'DEVELOPER' });

    // 3. Register Viewer
    const regViewer = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'viewer@engineeringhub.dev',
        password: 'Password123!',
        name: 'Vic Viewer',
      });
    viewerToken = regViewer.body.data.token;

    await request(app)
      .post(`/api/organizations/${orgId}/members/invite`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: 'viewer@engineeringhub.dev', role: 'VIEWER' });

    // 4. Seed Demo Repository with historical commits, PRs, issues
    const seedRes = await request(app)
      .post(`/api/organizations/${orgId}/repositories/demo`)
      .set('Authorization', `Bearer ${ownerToken}`);

    repoId = seedRes.body.data.id;
  });

  describe('Organization Dashboard Summary', () => {
    it('should aggregate genuine repository counts, PRs, issues, and active contributors', async () => {
      const res = await request(app)
        .get(`/api/organizations/${orgId}/dashboard`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const overview = res.body.data.overview;
      expect(overview.totalRepositories).toBe(1);
      expect(overview.totalCommitsLast30Days).toBe(20);
      expect(overview.openPullRequestsCount).toBe(1);
      expect(overview.mergedPullRequestsCount).toBe(3);
      expect(overview.activeContributorsCount).toBeGreaterThan(0);
      expect(Array.isArray(res.body.data.repositories)).toBe(true);
    });
  });

  describe('DORA-Style Metrics with Documented Formulas', () => {
    it('should return transparent DORA delivery metrics with definitions, sources, and ratings', async () => {
      // First, record production deployments
      await request(app)
        .post(`/api/organizations/${orgId}/repositories/${repoId}/deployments`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          environment: 'PRODUCTION',
          version: 'v1.0.0',
          commitSha: 'commit1234567890',
          status: 'SUCCESSFUL',
          durationMs: 45000,
        });

      await request(app)
        .post(`/api/organizations/${orgId}/repositories/${repoId}/deployments`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          environment: 'PRODUCTION',
          version: 'v1.0.1',
          commitSha: 'commit0987654321',
          status: 'FAILED',
          durationMs: 30000,
        });

      const res = await request(app)
        .get(`/api/organizations/${orgId}/analytics/dora`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const dora = res.body.data;
      expect(dora.timeWindowDays).toBe(30);

      // Verify Deployment Frequency metadata
      expect(dora.deploymentFrequency.name).toBe('Deployment Frequency');
      expect(dora.deploymentFrequency.formula).toBeDefined();
      expect(dora.deploymentFrequency.dataSource).toBeDefined();
      expect(dora.deploymentFrequency.limitations).toBeDefined();
      expect(dora.deploymentFrequency.value).toBeGreaterThan(0);

      // Verify Lead Time for Changes
      expect(dora.leadTimeForChanges.name).toBe('Lead Time for Changes');
      expect(dora.leadTimeForChanges.unit).toBe('hours');
      expect(dora.leadTimeForChanges.value).toBeGreaterThan(0);
      expect(dora.leadTimeForChanges.formula).toContain('pr.merged_at - pr.created_at');

      // Verify Change Failure Rate
      expect(dora.changeFailureRate.name).toBe('Change Failure Rate');
      expect(dora.changeFailureRate.unit).toBe('percentage');
      expect(dora.changeFailureRate.value).toBe(50); // 1 failed out of 2 = 50%
    });
  });

  describe('Repository Velocity & PR Cycle Time', () => {
    it('should calculate contributor activity and PR cycle times', async () => {
      const res = await request(app)
        .get(`/api/organizations/${orgId}/repositories/${repoId}/analytics`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contributors.length).toBeGreaterThan(0);
      expect(res.body.data.cycleTimes.length).toBe(3); // 3 merged PRs
      expect(res.body.data.cycleTimes[0].cycleTimeHours).toBeGreaterThan(0);
    });
  });

  describe('CI/CD Pipeline Runs & Deployments RBAC', () => {
    it('should allow Developer to record deployment but prevent Viewer', async () => {
      // 1. Developer records deployment -> 201 Created
      const devRes = await request(app)
        .post(`/api/organizations/${orgId}/repositories/${repoId}/deployments`)
        .set('Authorization', `Bearer ${devToken}`)
        .send({
          environment: 'STAGING',
          version: 'v1.1.0-rc1',
          commitSha: 'stagingcommit123',
          status: 'SUCCESSFUL',
          durationMs: 12000,
        });

      expect(devRes.status).toBe(201);
      expect(devRes.body.success).toBe(true);
      expect(devRes.body.data.environment).toBe('STAGING');

      // 2. Viewer attempts to record deployment -> 403 Forbidden
      const viewRes = await request(app)
        .post(`/api/organizations/${orgId}/repositories/${repoId}/deployments`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          environment: 'PRODUCTION',
          version: 'v9.9.9',
          commitSha: 'hackercommit',
          status: 'SUCCESSFUL',
        });

      expect(viewRes.status).toBe(403);
      expect(viewRes.body.success).toBe(false);
      expect(viewRes.body.error.code).toBe('FORBIDDEN_ROLE');
    });

    it('should list deployments history for the organization', async () => {
      const res = await request(app)
        .get(`/api/organizations/${orgId}/deployments`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.deployments)).toBe(true);
    });
  });
});
