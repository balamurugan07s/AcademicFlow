# EngineeringHub — Limitations & Boundaries Specification

Honesty is a core engineering principle of EngineeringHub. This document details current boundaries, external configuration requirements, what is implemented, what is not yet implemented, and known system limits.

---

## 1. Feature Implementation Status Matrix

| Feature Domain | Status | Notes |
|---|---|---|
| **System Architecture & Design** | `IMPLEMENTED` | Detailed in `ARCHITECTURE.md`, `DATABASE.md`, and `DECISIONS.md`. |
| **Authentication (Local & OAuth)** | `IN PROGRESS` | Architecture designed; Phase 2 foundation implementation starting. |
| **Multi-Tenancy & RBAC** | `IN PROGRESS` | 5 roles specified; row-level isolation pattern defined. |
| **GitHub OAuth & Repo Discovery** | `CONFIGURATION REQUIRED` | Requires real `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. |
| **Webhook Signature Verification** | `IMPLEMENTED (SPEC)` | HMAC SHA-256 algorithm with timing-safe buffers specified. |
| **Asynchronous Worker Queue** | `PLANNED` | BullMQ + Redis queue architecture with fallback defined. |
| **CI/CD Workflow Runs** | `PLANNED` | Planned for Phase 6 using GitHub Actions REST API. |
| **Deployments Module** | `PLANNED` | Planned for Phase 6; strictly requires GitHub deployment events or API triggers. No fake rollback. |
| **Security Center** | `PLANNED` | Planned for Phase 7; ingests Dependabot / CodeQL alerts. |
| **DORA Metrics** | `PLANNED` | Planned for Phase 5; formulas documented in `ARCHITECTURE.md`. |
| **AI Insights / Analysis** | `NOT IMPLEMENTED` | Deliberately excluded until Level 1 and Level 2 are completely stable. |

---

## 2. External Configuration Requirements

To run the live external integration features, the following credentials must be supplied in `.env`:

1. **GitHub OAuth Integration**:
   * `GITHUB_CLIENT_ID`: OAuth App Client ID from GitHub Developer Settings.
   * `GITHUB_CLIENT_SECRET`: OAuth App Client Secret.
   * *Behavior if missing*: The system displays `CONFIGURATION REQUIRED` in the UI and does not attempt fake OAuth handshakes.

2. **GitHub Webhooks**:
   * `GITHUB_WEBHOOK_SECRET`: Secret string configured in GitHub repository Webhook settings.
   * *Behavior if missing*: Webhook verification fails closed with HTTP 401 Unauthorized.

3. **Database & Cache**:
   * `DATABASE_URL`: PostgreSQL connection string (e.g. `postgresql://user:pass@localhost:5432/engineeringhub`).
   * `REDIS_URL`: Redis connection string (e.g. `redis://localhost:6379`).

4. **Security Secrets**:
   * `JWT_SECRET`: Minimum 32-byte secret for signing JSON Web Tokens.
   * `ENCRYPTION_KEY`: 32-byte hexadecimal key (64 characters) for AES-256-GCM token encryption.

---

## 3. Known Technical Limitations

1. **GitHub REST API Rate Limits**:
   * Unauthenticated requests to GitHub are limited to 60/hr.
   * Authenticated OAuth token requests are limited to 5,000 requests/hr.
   * *Mitigation*: The worker caches synced data in PostgreSQL and relies on push webhooks for delta changes rather than continuous polling.
2. **Historical Import Scope**:
   * For repositories with tens of thousands of commits, initial historical sync is bounded to the most recent 500 commits and 100 pull requests to prevent rate limit exhaustion and job worker timeouts.
3. **No Fake Rollback**:
   * Rollback buttons are not cosmetically implemented. If a deployment rollback is triggered, it must dispatch an actual GitHub deployment workflow dispatch event or be omitted.

---

## 4. Scalability Limitations

1. **Single Node Worker Pool**:
   * In local Docker Compose development, a single worker container processes jobs sequentially or with limited concurrency (5 concurrent jobs).
   * For production loads exceeding 100 webhooks/second, Redis BullMQ workers must be scaled horizontally across multiple instances.
2. **Single Database Instance**:
   * Read and write traffic targets the primary PostgreSQL node. Read replicas are not yet configured in MVP.
