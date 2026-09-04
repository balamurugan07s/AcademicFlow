import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Health & Observability Probes', () => {
  it('GET /api/health returns 200 OK with uptime and service metadata', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('engineeringhub-backend');
    expect(res.body.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/ready reports dependency connectivity details honestly', async () => {
    const res = await request(app).get('/api/ready');

    // It should report dependencies accurately without pretending
    expect([200, 503]).toContain(res.status);
    expect(res.body.dependencies).toBeDefined();
    expect(res.body.dependencies.database).toBeDefined();
    expect(res.body.dependencies.environment).toBeDefined();
  });
});
