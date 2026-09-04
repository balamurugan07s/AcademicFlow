# EngineeringHub — Technical Interview Defense Guide

This document provides structured, defensible answers for CSE placement and technical architecture interviews. It explains every design decision, security boundary, scalability bottleneck, and trade-off in EngineeringHub based on the actual implementation.

---

## 1. Product & Domain

### Q: What problem does EngineeringHub solve?
**Answer:** Engineering teams often work across dozens of repositories and microservices. Important engineering health indicators—such as pull request cycle times, failing CI/CD builds, unpatched security vulnerabilities, and deployment frequency—are scattered across separate GitHub pages, action logs, and team silos. EngineeringHub acts as an **engineering visibility and intelligence layer**, giving engineering leads, directors, and developers a consolidated, multi-tenant command center.

### Q: Why not simply use GitHub directly?
**Answer:** GitHub is an execution and version control tool, not an aggregated visibility engine. It does not provide cross-repository DORA delivery metrics, organization-wide PR cycle time distributions, or centralized secret/vulnerability dashboards across independent repos without costly enterprise extensions or manual spreadsheet tracking.

---

## 2. Architecture & Systems Design

### Q: Why a modular monolith with decoupled background workers instead of microservices?
**Answer:** 
* Microservices introduce distributed transactions, network serialization overhead, RPC retries, and complex orchestration (Kubernetes, service meshes) that are unjustified for this operational domain.
* A modular monolith provides strict internal domain boundaries (`auth`, `organizations`, `repositories`, `webhooks`, `analytics`, `security`) while sharing database schemas and types natively.
* By decoupling the background worker into a separate OS process (`npm run start:worker`) sharing the same codebase, heavy GitHub API syncs and webhook ingestion bursts never block the synchronous HTTP request-response cycle.

### Q: Why PostgreSQL with Prisma?
**Answer:** The data model is deeply relational: Organizations have Memberships, Repositories belong to Organizations, Commits, PRs, and Issues belong to Repositories. Foreign key cascades, unique composite constraints (e.g. preventing the same repo from being connected twice to a tenant), and ACID transactions are critical. Prisma gives end-to-end type safety and automated migration management.

### Q: Why did you use a queue and worker for webhooks?
**Answer:** GitHub webhook deliveries timeout after 10 seconds. If a webhook payload triggers multiple database updates, commits parsing, and metric rollups during peak push times, synchronous handling would cause timeouts and dropped deliveries. Our endpoint verifies the HMAC signature, stores the raw payload, enqueues the job to BullMQ/queue, and immediately responds with **HTTP 202 Accepted within <50ms**. The worker processes the job asynchronously with retries.

---

## 3. Security Engineering

### Q: How is multi-tenant isolation enforced? How do you prevent data leakage?
**Answer:** 
* We use logical row-level multi-tenancy. Every tenant-owned table (`repositories`, `commits`, `pull_requests`, `issues`, `deployments`, `security_findings`, `audit_logs`) includes an indexed `organization_id` foreign key.
* The `requireTenant` middleware resolves the organization and verifies that the authenticated user holds an active `Membership` in that organization.
* If a user in Organization A tampers with query parameters or URL paths to target an entity in Organization B, the request is terminated with **HTTP 403 `FORBIDDEN_TENANT_ACCESS`**.
* This invariant is strictly tested in our automated test suite (`tenant_isolation.integration.test.ts`).

### Q: How do you protect GitHub OAuth Access Tokens?
**Answer:** Tokens are encrypted prior to database insertion using **AES-256-GCM** with an initialization vector (IV) and authentication tag (`iv:authTag:ciphertext`). Tokens are decrypted only in memory when making outgoing calls to GitHub's REST API. They are never exposed in JSON API responses or sent to the browser.

### Q: How do you verify incoming GitHub webhooks?
**Answer:** 
1. We capture the raw request byte stream before JSON parsing.
2. We compute an HMAC SHA-256 digest using the shared `GITHUB_WEBHOOK_SECRET`.
3. We compare our computed digest against GitHub's `X-Hub-Signature-256` header using `crypto.timingSafeEqual` to eliminate timing attacks.

### Q: What happens if a webhook arrives twice?
**Answer:** GitHub guarantees at-least-once delivery, so duplicates happen. We capture GitHub's unique `X-GitHub-Delivery` GUID and check the `webhook_events` table before processing. If the delivery ID exists, we return **HTTP 200 OK** and skip redundant worker processing.

---

## 4. Scalability & Performance

### Q: What happens with 10,000 active organizations? What is the first bottleneck?
**Answer:** 
1. **First Bottleneck: Database connection pool and analytical aggregation queries.** Running `AVG(merged_at - pr_created_at)` across millions of rows during dashboard loads will slow down PostgreSQL.
2. **Mitigation:** 
   * Pre-computed rollup tables / materialized views refreshed incrementally on webhook events.
   * Read replicas for analytical queries.
   * Connection pooling via PgBouncer.
3. **Worker Scaling:** Horizontal scaling of BullMQ worker instances across container replicas consuming from Redis.

---

## 5. Reliability & Error Handling

### Q: What happens when GitHub is down or rate-limited?
**Answer:**
* Outgoing GitHub requests check `x-ratelimit-remaining`. If rate-limited (HTTP 429), exponential backoff is triggered.
* Synchronizations that fail mark the repository's `syncStatus` as `FAILED` with an error message in the audit log, without crashing the server.
* The platform displays cached data stored in PostgreSQL, allowing the user to view previous metrics even when GitHub is temporarily unreachable.

---

## 6. Deliberate Engineering Trade-offs

### Q: What did you deliberately NOT build?
1. **No fake GitHub API responses or mock OAuth claiming to be real.** If keys are missing, the system reports `CONFIGURATION_REQUIRED` or explicitly labeled `[DEMO DATA]`.
2. **No arbitrary "code quality scores" without clear formulas.** The Code Health Score documents its exact formula, deductions, and limitations.
3. **No fake rollback button.** Rollback workflows require real deployment dispatching or are omitted.
4. **No microservices.** Kept the operational complexity low and maintainability high.
