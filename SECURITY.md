# EngineeringHub — Security Architecture & Threat Model

## 1. Security Philosophy
EngineeringHub treats security and tenant isolation as primary architectural invariants. It operates under a zero-trust model where client inputs are untrusted, database queries must enforce tenant context, and external webhooks must be cryptographically authenticated.

---

## 2. Core Security Controls

### 2.1. Tenant Data Isolation
* **Isolation Model**: Logical row-level multi-tenancy.
* **Enforcement**:
  1. Every tenant-scoped request passes through `requireTenant` middleware.
  2. The middleware resolves the target organization and verifies that the authenticated user holds a valid `Membership` record.
  3. If a user in Organization A specifies an ID belonging to Organization B, the request is terminated immediately with HTTP 403 `FORBIDDEN_TENANT_ACCESS`.
* **Database Queries**: All database operations include `where: { organizationId }` parameterization.

### 2.2. Authentication & Credential Storage
* **Password Hashing**: Passwords are salted and hashed using `bcrypt` (12 work factor rounds) or `Argon2id`. Plaintext passwords are never logged, cached, or persisted.
* **Session Tokens**: Stateless signed JWTs with short expiry windows and cryptographically random signing keys (`JWT_SECRET`).
* **OAuth Credential Encryption at Rest**:
  * GitHub access tokens and refresh tokens are encrypted prior to PostgreSQL persistence using **AES-256-GCM**.
  * Format: `iv:authTag:ciphertext` (all hex encoded).
  * Key: Loaded from `ENCRYPTION_KEY` in environment variables.
  * Redaction: Sensitive tokens are never returned in JSON API responses.

### 2.3. Webhook Cryptographic Verification & Anti-Replay
* **HMAC SHA-256 Validation**: Every incoming payload from `POST /api/webhooks/github` is verified against the `GITHUB_WEBHOOK_SECRET`.
* **Timing-Attack Mitigation**: Signature comparisons use `crypto.timingSafeEqual` over fixed-length binary buffers to prevent timing side-channel attacks.
* **Anti-Replay Protection**: The `X-GitHub-Delivery` GUID is verified against the `webhook_events` deduplication store. Duplicate deliveries are skipped without re-processing.

### 2.4. OWASP Top 10 Mitigations
| Threat | Mitigation Mechanism |
|---|---|
| **SQL Injection (SQLi)** | Parameterized queries via Prisma ORM and sanitized `$queryRaw` parameters. Zero string concatenation. |
| **Cross-Site Scripting (XSS)** | React automatic output encoding, strict Content Security Policy (CSP) headers via Helmet. |
| **Cross-Site Request Forgery (CSRF)** | Secure, `SameSite=Lax` cookies, cryptographically signed OAuth state nonces. |
| **Broken Object Level Authorization (BOLA)** | Tenant middleware enforces that the requesting user belongs to the target organization on every request. |
| **Server-Side Request Forgery (SSRF)** | Server never fetches arbitrary user-provided URLs. All outgoing HTTP requests are hardcoded to `api.github.com`. |
| **Denial of Service (DoS)** | Rate limiting applied to all public and authenticated endpoints via `express-rate-limit` (300 requests / 15 minutes). |

---

## 3. Mandatory Security Test Suite
The automated test suite explicitly executes the following security verifications on every build:

1. **Cross-Tenant Attack Simulation**: Verified that User A in Org A cannot query, invite members to, or view audit logs of Org B ([`tenant_isolation.integration.test.ts`](file:///c:/Users/BALA/Desktop/CAREER/Work/antigravity/work/sih/backend/src/__tests__/tenant_isolation.integration.test.ts)).
2. **Privilege Escalation Simulation**: Verified that Developers and Viewers cannot perform administrative actions or view sensitive audit trails ([`rbac_security.integration.test.ts`](file:///c:/Users/BALA/Desktop/CAREER/Work/antigravity/work/sih/backend/src/__tests__/rbac_security.integration.test.ts)).
3. **Webhook Forgery Attack Simulation**: Verified that tampered signatures, missing signatures, or forged delivery IDs are immediately rejected ([`webhook.integration.test.ts`](file:///c:/Users/BALA/Desktop/CAREER/Work/antigravity/work/sih/backend/src/__tests__/webhook.integration.test.ts)).
4. **Secret Scanning Verification**: Verified that exposed AWS keys and private RSA keys in source files trigger `CRITICAL` findings ([`security.integration.test.ts`](file:///c:/Users/BALA/Desktop/CAREER/Work/antigravity/work/sih/backend/src/__tests__/security.integration.test.ts)).

---

## 4. Reporting Security Vulnerabilities
If you discover a potential security vulnerability in EngineeringHub, please report it privately to `security@engineeringhub.dev`. Do not file public GitHub issues for security vulnerabilities.
