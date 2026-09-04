import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { store } from '../services/store.js';

describe('Security Center, Vulnerability Scanning & Code Health', () => {
  let ownerToken: string;
  let devToken: string;
  let analystToken: string;
  let orgId: string;
  let repoId: string;

  beforeEach(async () => {
    store.reset();

    // 1. Register Owner
    const regOwner = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'ciso@security.dev',
        password: 'Password123!',
        name: 'Chief Security Officer',
      });
    ownerToken = regOwner.body.data.token;
    orgId = regOwner.body.data.organization.id;

    // 2. Register Developer
    const regDev = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'coder@security.dev',
        password: 'Password123!',
        name: 'Coder Chris',
      });
    devToken = regDev.body.data.token;

    await request(app)
      .post(`/api/organizations/${orgId}/members/invite`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: 'coder@security.dev', role: 'DEVELOPER' });

    // 3. Register Security Analyst
    const regAnalyst = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'analyst@security.dev',
        password: 'Password123!',
        name: 'Analyst Abby',
      });
    analystToken = regAnalyst.body.data.token;

    await request(app)
      .post(`/api/organizations/${orgId}/members/invite`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: 'analyst@security.dev', role: 'SECURITY_ANALYST' });

    // 4. Seed test repo
    const seedRes = await request(app)
      .post(`/api/organizations/${orgId}/repositories/demo`)
      .set('Authorization', `Bearer ${ownerToken}`);
    repoId = seedRes.body.data.id;
  });

  describe('Dependency Vulnerability Scanner', () => {
    it('should detect known vulnerable package versions and report CVEs with remediation', async () => {
      const res = await request(app)
        .post(`/api/organizations/${orgId}/repositories/${repoId}/security/scan-dependencies`)
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          dependencies: {
            lodash: '^4.17.15', // Vulnerable to Prototype Pollution CVE-2021-23337
            axios: '^1.6.0',     // Vulnerable to SSRF CVE-2024-39338
            express: '^4.21.2',  // Clean
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.vulnerabilitiesDetected).toBe(2);

      const findings = res.body.data.findings;
      const lodashFinding = findings.find((f: any) => f.packageName === 'lodash');
      expect(lodashFinding).toBeDefined();
      expect(lodashFinding.severity).toBe('HIGH');
      expect(lodashFinding.patchedVersion).toBe('4.17.21');
      expect(lodashFinding.title).toContain('CVE-2021-23337');
    });
  });

  describe('Secret Detection Engine', () => {
    it('should detect hardcoded AWS credentials and private keys in source content', async () => {
      const sampleCodeWithKey = `
        const config = {
          awsAccessKey: "AKIAIOSFODNN7EXAMPLE",
          region: "us-east-1"
        };
      `;

      const res = await request(app)
        .post(`/api/organizations/${orgId}/repositories/${repoId}/security/scan-secrets`)
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          filePath: 'src/config/aws.ts',
          content: sampleCodeWithKey,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.secretsDetected).toBe(1);
      expect(res.body.data.findings[0].severity).toBe('CRITICAL');
      expect(res.body.data.findings[0].title).toContain('AWS Access Key ID');
    });
  });

  describe('Finding Triage & RBAC Enforcement', () => {
    it('should allow Security Analyst to resolve a finding, but reject Developer', async () => {
      // 1. Scan to create a finding
      const scanRes = await request(app)
        .post(`/api/organizations/${orgId}/repositories/${repoId}/security/scan-dependencies`)
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          dependencies: { minimist: '1.2.0' }, // CRITICAL CVE-2021-44906
        });

      const findingId = scanRes.body.data.findings[0].id;

      // 2. Developer attempts to triage -> 403 Forbidden
      const devRes = await request(app)
        .patch(`/api/organizations/${orgId}/security/findings/${findingId}/triage`)
        .set('Authorization', `Bearer ${devToken}`)
        .send({ status: 'RESOLVED' });

      expect(devRes.status).toBe(403);
      expect(devRes.body.error.code).toBe('FORBIDDEN_ROLE');

      // 3. Security Analyst triages -> 200 OK
      const analystRes = await request(app)
        .patch(`/api/organizations/${orgId}/security/findings/${findingId}/triage`)
        .set('Authorization', `Bearer ${analystToken}`)
        .send({ status: 'RESOLVED' });

      expect(analystRes.status).toBe(200);
      expect(analystRes.body.data.status).toBe('RESOLVED');
    });
  });

  describe('Documented Code Health Score Formula', () => {
    it('should calculate code health grade with transparent deductions and formula documentation', async () => {
      // Add a critical finding
      await request(app)
        .post(`/api/organizations/${orgId}/repositories/${repoId}/security/scan-dependencies`)
        .set('Authorization', `Bearer ${analystToken}`)
        .send({
          dependencies: { minimist: '1.2.0' }, // -25 deduction
        });

      const res = await request(app)
        .get(`/api/organizations/${orgId}/repositories/${repoId}/code-health`)
        .set('Authorization', `Bearer ${devToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const health = res.body.data;
      expect(health.score).toBeLessThanOrEqual(75); // 100 - 25 = 75
      expect(health.grade).toBeDefined();
      expect(health.formula.equation).toContain('Score = MAX(0, 100');
      expect(health.formula.inputs.criticalVulnerabilities).toBeGreaterThan(0);
      expect(health.formula.limitations).toBeDefined();
    });
  });
});
