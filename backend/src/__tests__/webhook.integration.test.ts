import crypto from 'crypto';
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { store, RepositoryRecord } from '../services/store.js';
import { env } from '../config/env.js';

describe('GitHub Webhook Engine & Asynchronous Processing', () => {
  const webhookSecret = 'test_webhook_secret_key_12345';
  let orgId: string;
  let repo: RepositoryRecord;

  function generateSignature(payloadString: string): string {
    const hmac = crypto.createHmac('sha256', webhookSecret).update(payloadString).digest('hex');
    return `sha256=${hmac}`;
  }

  beforeEach(async () => {
    store.reset();
    (env as any).GITHUB_WEBHOOK_SECRET = webhookSecret;

    // Create Org & Repo
    const org = store.createOrg({
      name: 'Webhook Test Org',
      slug: 'webhook-org',
    });
    orgId = org.id;

    repo = {
      id: crypto.randomUUID(),
      organizationId: orgId,
      githubRepoId: '555123',
      name: 'backend-api',
      fullName: 'acme/backend-api',
      ownerLogin: 'acme',
      description: 'Test API',
      defaultBranch: 'main',
      isPrivate: true,
      htmlUrl: 'https://github.com/acme/backend-api',
      syncStatus: 'IDLE',
      lastSyncedAt: null,
      createdAt: new Date(),
    };
    store.repositories.set(repo.id, repo);
  });

  it('MANDATORY TEST: Valid webhook with correct signature is accepted (HTTP 202 Accepted)', async () => {
    const deliveryId = crypto.randomUUID();
    const payload = {
      repository: { full_name: 'acme/backend-api' },
      ref: 'refs/heads/main',
      commits: [
        {
          id: '1111222233334444555566667777888899990000',
          message: 'feat: add real-time webhook parser',
          timestamp: new Date().toISOString(),
          author: { name: 'Dev Lead', email: 'lead@acme.dev' },
        },
      ],
    };

    const payloadString = JSON.stringify(payload);
    const signature = generateSignature(payloadString);

    const res = await request(app)
      .post('/api/webhooks/github')
      .set('x-hub-signature-256', signature)
      .set('x-github-delivery', deliveryId)
      .set('x-github-event', 'push')
      .set('Content-Type', 'application/json')
      .send(payloadString);

    expect(res.status).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.deliveryId).toBe(deliveryId);

    // Wait for worker queue to process job
    await new Promise((r) => setTimeout(r, 60));

    // Verify commit was ingested into store
    const storedCommits = Array.from(store.commits.values()).filter((c) => c.repositoryId === repo.id);
    expect(storedCommits.length).toBe(1);
    expect(storedCommits[0].sha).toBe('1111222233334444555566667777888899990000');
    expect(storedCommits[0].message).toBe('feat: add real-time webhook parser');
  });

  it('MANDATORY TEST: Invalid signature is rejected (HTTP 401 Unauthorized)', async () => {
    const deliveryId = crypto.randomUUID();
    const payload = { repository: { full_name: 'acme/backend-api' } };
    const payloadString = JSON.stringify(payload);
    const forgedSignature = 'sha256=0000000000000000000000000000000000000000000000000000000000000000';

    const res = await request(app)
      .post('/api/webhooks/github')
      .set('x-hub-signature-256', forgedSignature)
      .set('x-github-delivery', deliveryId)
      .set('x-github-event', 'push')
      .set('Content-Type', 'application/json')
      .send(payloadString);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_WEBHOOK_SIGNATURE');
  });

  it('MANDATORY TEST: Duplicate delivery is not processed twice (Idempotency check)', async () => {
    const deliveryId = 'fixed-duplicate-delivery-guid-12345';
    const payload = {
      repository: { full_name: 'acme/backend-api' },
      ref: 'refs/heads/main',
      commits: [
        {
          id: 'abcdef1234567890abcdef1234567890abcdef12',
          message: 'fix: idempotency test',
          timestamp: new Date().toISOString(),
          author: { name: 'Dev', email: 'dev@acme.dev' },
        },
      ],
    };

    const payloadString = JSON.stringify(payload);
    const signature = generateSignature(payloadString);

    // First arrival: HTTP 202 Accepted
    const res1 = await request(app)
      .post('/api/webhooks/github')
      .set('x-hub-signature-256', signature)
      .set('x-github-delivery', deliveryId)
      .set('x-github-event', 'push')
      .set('Content-Type', 'application/json')
      .send(payloadString);

    expect(res1.status).toBe(202);

    // Second arrival with identical deliveryId: HTTP 200 OK (Duplicate skipped)
    const res2 = await request(app)
      .post('/api/webhooks/github')
      .set('x-hub-signature-256', signature)
      .set('x-github-delivery', deliveryId)
      .set('x-github-event', 'push')
      .set('Content-Type', 'application/json')
      .send(payloadString);

    expect(res2.status).toBe(200);
    expect(res2.body.message).toContain('Duplicate delivery already recorded');
  });

  it('MANDATORY TEST: Pull request lifecycle events (opened -> merged) are parsed correctly', async () => {
    // 1. Send PR opened event
    const prOpenPayload = {
      repository: { full_name: 'acme/backend-api' },
      pull_request: {
        id: 701,
        number: 42,
        title: 'feat: new audit trail engine',
        state: 'open',
        user: { login: 'marcus' },
        head: { ref: 'feature/audit' },
        base: { ref: 'main' },
        additions: 150,
        deletions: 20,
        changed_files: 5,
        created_at: new Date().toISOString(),
      },
    };

    const strOpen = JSON.stringify(prOpenPayload);
    await request(app)
      .post('/api/webhooks/github')
      .set('x-hub-signature-256', generateSignature(strOpen))
      .set('x-github-delivery', crypto.randomUUID())
      .set('x-github-event', 'pull_request')
      .set('Content-Type', 'application/json')
      .send(strOpen);

    await new Promise((r) => setTimeout(r, 60));

    const prAfterOpen = Array.from(store.pullRequests.values()).find((p) => p.number === 42);
    expect(prAfterOpen).toBeDefined();
    expect(prAfterOpen?.state).toBe('OPEN');
    expect(prAfterOpen?.title).toBe('feat: new audit trail engine');

    // 2. Send PR merged event
    const prMergePayload = {
      repository: { full_name: 'acme/backend-api' },
      pull_request: {
        ...prOpenPayload.pull_request,
        state: 'closed',
        merged_at: new Date().toISOString(),
      },
    };

    const strMerge = JSON.stringify(prMergePayload);
    await request(app)
      .post('/api/webhooks/github')
      .set('x-hub-signature-256', generateSignature(strMerge))
      .set('x-github-delivery', crypto.randomUUID())
      .set('x-github-event', 'pull_request')
      .set('Content-Type', 'application/json')
      .send(strMerge);

    await new Promise((r) => setTimeout(r, 60));

    const prAfterMerge = Array.from(store.pullRequests.values()).find((p) => p.number === 42);
    expect(prAfterMerge?.state).toBe('MERGED');
    expect(prAfterMerge?.mergedAt).not.toBeNull();
  });

  it('should process workflow_run event and insert pipeline run record', async () => {
    const runPayload = {
      repository: { full_name: 'acme/backend-api' },
      workflow_run: {
        id: 987654,
        name: 'Continuous Integration / Tests',
        event: 'push',
        status: 'completed',
        conclusion: 'success',
        head_sha: 'commit1234567890',
        head_branch: 'main',
        run_started_at: new Date(Date.now() - 45000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    const strRun = JSON.stringify(runPayload);
    const res = await request(app)
      .post('/api/webhooks/github')
      .set('x-hub-signature-256', generateSignature(strRun))
      .set('x-github-delivery', crypto.randomUUID())
      .set('x-github-event', 'workflow_run')
      .set('Content-Type', 'application/json')
      .send(strRun);

    expect(res.status).toBe(202);

    await new Promise((r) => setTimeout(r, 60));

    const runs = Array.from(store.pipelineRuns.values()).filter((p) => p.repositoryId === repo.id);
    expect(runs.length).toBe(1);
    expect(runs[0].githubRunId).toBe('987654');
    expect(runs[0].workflowName).toBe('Continuous Integration / Tests');
    expect(runs[0].conclusion).toBe('SUCCESS');
    expect(runs[0].durationMs).toBeGreaterThan(0);
  });
});
