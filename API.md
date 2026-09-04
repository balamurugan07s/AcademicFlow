# EngineeringHub — REST API Documentation

## 1. Overview
The EngineeringHub REST API exposes secure, tenant-isolated endpoints for engineering visibility, repository synchronization, webhook event ingestion, security scanning, and operational analytics.

* **Base URL**: `http://localhost:4000/api`
* **Content-Type**: `application/json`
* **Authentication**: Bearer Token in `Authorization: Bearer <JWT_TOKEN>` header.
* **Tenant Scoping**: All operational endpoints include `:orgId` in the path or an `X-Organization-Id` header.

---

## 2. Standard Response & Error Format

### 2.1. Success Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```

### 2.2. Error Envelope
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable explanation.",
    "details": []
  }
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|---|:---:|---|
| `UNAUTHORIZED` | 401 | Missing or invalid Bearer authentication token. |
| `FORBIDDEN_TENANT_ACCESS` | 403 | Authenticated user is not a member of the requested organization. |
| `FORBIDDEN_ROLE` | 403 | User role lacks sufficient RBAC privileges for this operation. |
| `VALIDATION_ERROR` | 400 | Request body, query, or path parameters failed Zod schema validation. |
| `ORGANIZATION_NOT_FOUND` | 404 | Target organization does not exist. |
| `REPOSITORY_NOT_FOUND` | 404 | Target repository does not exist within the organization. |
| `INVALID_WEBHOOK_SIGNATURE`| 401 | Webhook HMAC SHA-256 signature verification failed. |
| `RATE_LIMIT_EXCEEDED` | 429 | Exceeded IP rate limit threshold (300 req / 15 min). |
| `CONFIGURATION_REQUIRED` | 503 | External integration credentials (e.g. GitHub OAuth) not configured in `.env`. |

---

## 3. Endpoints Catalog

### 3.1. Observability
* `GET /api/health`: Liveness probe returning process uptime.
* `GET /api/ready`: Readiness probe verifying PostgreSQL and Redis dependency connectivity.

### 3.2. Authentication (`/api/auth`)
* `POST /api/auth/register`: Create user account and automatic default personal workspace.
  * Request Body: `{ "email": "user@example.com", "password": "Password123!", "name": "Alice" }`
* `POST /api/auth/login`: Authenticate credentials and receive JWT token.
  * Request Body: `{ "email": "user@example.com", "password": "Password123!" }`
* `GET /api/auth/me`: Retrieve current authenticated user profile. Requires Bearer token.
* `GET /api/auth/github/authorize`: Generate GitHub OAuth authorization URL with CSRF state token.
* `POST /api/auth/github/callback`: Exchange temporary GitHub OAuth code for access token.

### 3.3. Organizations & Team Management (`/api/organizations`)
* `POST /api/organizations`: Create a new organization workspace. Caller assigned `OWNER`.
* `GET /api/organizations`: List all organizations the user belongs to.
* `GET /api/organizations/:orgId`: Get organization details and statistics.
* `GET /api/organizations/:orgId/members`: List organization team members and assigned roles.
* `POST /api/organizations/:orgId/members/invite`: Invite or add a member (`OWNER` or `ADMIN` only).
  * Request Body: `{ "email": "dev@example.com", "role": "DEVELOPER" }`
* `PATCH /api/organizations/:orgId/members/:memberId/role`: Update member role (`OWNER` or `ADMIN` only).
* `DELETE /api/organizations/:orgId/members/:memberId`: Remove member from organization.
* `GET /api/organizations/:orgId/audit-logs`: Immutable audit logs (`OWNER`, `ADMIN`, `SECURITY_ANALYST` only).

### 3.4. GitHub Repositories (`/api/organizations/:orgId/...`)
* `GET /organizations/:orgId/github/repos`: Discover user repos from GitHub using `X-GitHub-Token` header.
* `POST /organizations/:orgId/repositories/connect`: Connect repository (`OWNER` or `ADMIN` only).
* `GET /organizations/:orgId/repositories`: List connected repositories.
* `GET /organizations/:orgId/repositories/:repoId`: Get repository overview and summary stats.
* `POST /organizations/:orgId/repositories/:repoId/sync`: Trigger upstream sync (`OWNER`, `ADMIN`, `DEVELOPER`).
* `GET /organizations/:orgId/repositories/:repoId/commits`: List commits chronologically.
* `GET /organizations/:orgId/repositories/:repoId/pull-requests`: List pull requests.
* `GET /organizations/:orgId/repositories/:repoId/issues`: List issues.
* `GET /organizations/:orgId/repositories/:repoId/releases`: List releases.
* `POST /organizations/:orgId/repositories/demo`: Seed explicit `[DEMO DATA]` repository for local review.

### 3.5. Webhooks (`/api/webhooks`)
* `POST /api/webhooks/github`: Receives GitHub webhook push, pull_request, issues, and workflow_run events.
  * Headers: `X-Hub-Signature-256`, `X-GitHub-Delivery`, `X-GitHub-Event`.
  * Returns HTTP 202 Accepted within <50ms while worker executes asynchronously.
* `GET /api/webhooks`: List recent webhook deliveries and worker processing statuses.

### 3.6. Engineering Analytics & DORA Metrics (`/api/organizations/:orgId/...`)
* `GET /organizations/:orgId/dashboard`: High-level command center summary (active repos, lead times, PR counts).
* `GET /organizations/:orgId/analytics/dora`: DORA metrics (Deployment Frequency, Lead Time, Change Failure Rate) with formulas and limitations.
* `GET /organizations/:orgId/repositories/:repoId/analytics`: Repository velocity, cycle times, and contributor leaderboard.
* `GET /organizations/:orgId/pipelines`: List CI/CD workflow runs.
* `GET /organizations/:orgId/deployments`: List environment deployment history.
* `POST /organizations/:orgId/repositories/:repoId/deployments`: Record deployment (`OWNER`, `ADMIN`, `DEVELOPER`).

### 3.7. Security Center (`/api/organizations/:orgId/...`)
* `GET /organizations/:orgId/security/findings`: List vulnerability and secret findings.
* `POST /organizations/:orgId/repositories/:repoId/security/scan-dependencies`: Scan package dependencies against CVE database.
* `POST /organizations/:orgId/repositories/:repoId/security/scan-secrets`: Scan content for exposed API keys and private keys.
* `PATCH /organizations/:orgId/security/findings/:findingId/triage`: Mark finding as `RESOLVED` or `DISMISSED`.
* `GET /organizations/:orgId/repositories/:repoId/code-health`: Retrieve code health score (0-100), letter grade, and formula.

### 3.8. Notifications & Global Search (`/api/organizations/:orgId/...`)
* `GET /organizations/:orgId/notifications`: List in-app notifications for current user.
* `PATCH /organizations/:orgId/notifications/:id/read`: Mark notification as read.
* `POST /organizations/:orgId/notifications/read-all`: Mark all notifications as read.
* `GET /organizations/:orgId/search?q=<query>`: Global search across repos, commits, PRs, issues, deployments, and team members.
