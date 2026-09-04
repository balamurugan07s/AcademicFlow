# EngineeringHub — Automated Testing Strategy & Verification Report

## 1. Testing Philosophy
Testing is a non-negotiable core requirement of EngineeringHub. Features are only considered complete once accompanied by automated unit, integration, and security test suites.

* **Test Framework**: Vitest 2.1+
* **HTTP Test Client**: Supertest 7.0+
* **Total Automated Tests**: 50 tests across 11 test suites
* **Pass Rate**: 100% (0 failing tests)

---

## 2. Test Execution Commands

From the `backend/` directory:

```bash
# Run the complete automated test suite once
npm test

# Run tests in continuous watch mode
npm run test:watch
```

---

## 3. Test Suites Catalog & Coverage

| Suite | Type | File | Tests | Verified Behaviors |
|---|:---:|---|:---:|---|
| **Cryptographic Utilities** | Unit | `crypto.test.ts` | 3 | Bcrypt 12-round password hashing, AES-256-GCM token encryption roundtrip, constant-time `timingSafeCompare`. |
| **RBAC Permission Matrix** | Unit | `rbac.test.ts` | 5 | Role hierarchies (`OWNER`, `ADMIN`, `DEVELOPER`, `VIEWER`, `SECURITY_ANALYST`) and granular permission checks. |
| **Authentication Lifecycle** | Integration | `auth.integration.test.ts` | 7 | User registration, automatic workspace provisioning, duplicate email rejection (409), password length validation (400), login with valid/invalid credentials, profile retrieval. |
| **Tenant Isolation Security** | Integration / Security | `tenant_isolation.integration.test.ts` | 4 | **Mandatory Security Test**: Cross-tenant boundary verification. User in Org A cannot read, invite members to, or view audit logs of Org B (HTTP 403 `FORBIDDEN_TENANT_ACCESS`). |
| **RBAC Privilege Escalation** | Integration / Security | `rbac_security.integration.test.ts` | 5 | **Mandatory Security Test**: Developer cannot invite members or view audit logs; Viewer cannot modify member roles; Owner/Admin role modifications succeed. |
| **Observability & Probes** | Integration | `health.test.ts` | 2 | `/api/health` reports process uptime; `/api/ready` tests live dependency connectivity. |
| **GitHub Core & Repository** | Integration | `github.integration.test.ts` | 7 | Honest OAuth configuration boundaries (`CONFIGURATION_REQUIRED` when keys are missing), repository connection, duplicate connection rejection, demo seeder, cross-tenant repo isolation. |
| **Webhook Engine & Queue** | Integration / Event | `webhook.integration.test.ts` | 5 | **Mandatory Security Test**: HMAC SHA-256 signature verification, rejection of forged signatures (401), delivery ID deduplication (anti-replay), push event parsing, PR open/merge event parsing, workflow run parsing. |
| **Dashboard & DORA Metrics** | Integration | `analytics.integration.test.ts` | 5 | Dashboard summary aggregation, DORA metrics calculation (Deployment Frequency, Lead Time for Changes, Change Failure Rate), PR cycle times, contributor activity, deployment recording RBAC. |
| **Security Center & Scanner** | Integration | `security.integration.test.ts` | 5 | Real CVE vulnerability scanning against package manifests, hardcoded secret pattern detection, finding triage RBAC, transparent code health score formula. |
| **Notifications & Search** | Integration | `notification_search.integration.test.ts` | 2 | In-app notification creation and read state, cross-resource global search with strict tenant scoping. |

---

## 4. Failure & Resilience Testing

The test suite explicitly validates system resilience under adverse conditions:
1. **Missing / Unconfigured OAuth Secrets**: Returns `CONFIGURATION_REQUIRED` without crashing or returning fake mock repositories.
2. **Missing Bearer Tokens**: Rejects unauthenticated requests with HTTP 401 `UNAUTHORIZED`.
3. **Invalid Webhook Signatures**: Rejects malicious or forged webhook payloads with HTTP 401 `INVALID_WEBHOOK_SIGNATURE`.
4. **Duplicate Deliveries**: Acknowledges delivery without duplicate processing or duplicate commit insertion.
5. **Cross-Tenant ID Tampering**: Changing the target organization ID in request headers or URLs immediately triggers HTTP 403 `FORBIDDEN_TENANT_ACCESS`.
