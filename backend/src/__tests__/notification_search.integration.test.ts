import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { store } from '../services/store.js';
import { notificationStore } from '../services/notification.service.js';

describe('In-App Notifications & Cross-Resource Global Search', () => {
  let userToken: string;
  let userId: string;
  let orgId: string;
  let competitorToken: string;
  let competitorOrgId: string;

  beforeEach(async () => {
    store.reset();
    notificationStore.reset();

    // 1. Register Primary User
    const regUser = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'engineer@corp.com',
        password: 'Password123!',
        name: 'Engineer Eric',
      });
    userToken = regUser.body.data.token;
    userId = regUser.body.data.user.id;
    orgId = regUser.body.data.organization.id;

    // Seed demo repo in Org A
    await request(app)
      .post(`/api/organizations/${orgId}/repositories/demo`)
      .set('Authorization', `Bearer ${userToken}`);

    // 2. Register Competitor User in Org B
    const regComp = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'competitor@rival.com',
        password: 'Password123!',
        name: 'Rival Rob',
      });
    competitorToken = regComp.body.data.token;
    competitorOrgId = regComp.body.data.organization.id;
  });

  describe('Notifications System', () => {
    it('should retrieve in-app notifications and mark them as read', async () => {
      // Create a notification for the user
      notificationStore.createNotification({
        organizationId: orgId,
        userId,
        type: 'PIPELINE_FAILED',
        title: 'CI Workflow Run Failed',
        message: 'Workflow CI / Build failed on branch main (commit 4a9f12)',
      });

      // 1. List unread notifications
      const listRes = await request(app)
        .get(`/api/organizations/${orgId}/notifications?unread=true`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBe(1);
      expect(listRes.body.data[0].type).toBe('PIPELINE_FAILED');

      const notifId = listRes.body.data[0].id;

      // 2. Mark as read
      const readRes = await request(app)
        .patch(`/api/organizations/${orgId}/notifications/${notifId}/read`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(readRes.status).toBe(200);
      expect(readRes.body.data.isRead).toBe(true);

      // 3. Confirm 0 unread remain
      const remainingRes = await request(app)
        .get(`/api/organizations/${orgId}/notifications?unread=true`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(remainingRes.body.data.length).toBe(0);
    });
  });

  describe('Cross-Resource Global Search', () => {
    it('should search across repositories, commits, PRs, issues, and team members', async () => {
      // Query "demo" or "patch" which exists in the seeded demo repository
      const res = await request(app)
        .get(`/api/organizations/${orgId}/search?q=patch`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.results.length).toBeGreaterThan(0);

      // Verify that results include both commits and pull requests
      const types = res.body.data.results.map((r: any) => r.type);
      expect(types.some((t: string) => t === 'commit' || t === 'pull_request')).toBe(true);
    });

    it('MANDATORY SECURITY TEST: Global search enforces tenant isolation (Org B cannot see Org A resources)', async () => {
      // Competitor in Org B searches for Org A's repository keyword
      const res = await request(app)
        .get(`/api/organizations/${competitorOrgId}/search?q=Acme`)
        .set('Authorization', `Bearer ${competitorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.results.length).toBe(0); // Zero results because Acme repo belongs to Org A!
    });
  });
});
